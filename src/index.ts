import fetchGateways from './domains'
import * as Utilities from './utilities'
import {
    IPFSFetcherOptions,
    IPFSGateway
} from './types'

let instance: IPFSFetcher | undefined = undefined;
// True when verbosity is enabled to check errors
let verbose = false
// Timeout for gateways to respond
let gatewayTimeout = 5000
// Reinitializing time
let reinitializeTime = 1000 * 60 * 60
// Minimum gateways to be connected before consider IPFS as connected as well as slice size of fastest gateways used
let gatewayCheckAmount = 3
// Store initially passed options for reinitialization
let initialOptions: IPFSFetcherOptions | undefined = undefined

export const Initialize = async (options?: IPFSFetcherOptions) => {
    // Only initialize in cases where isn't initialized yet
    // Or in cases where is initialized and connected but forced to reinitialize
    if (instance == undefined || (instance?.ipfsConnected && options?.forceInitialize)) {
        instance = new IPFSFetcher(options);
        verbose = options?.verbose || false;
        gatewayTimeout = options?.gatewayTimeout || 5000;
        gatewayCheckAmount = options?.gatewayCheckAmount || 3;
        reinitializeTime = options?.reinitializeTime || 1000 * 60 * 60;
        initialOptions = options;
    }
}

export const IsConnected = () => {
    return instance?.ipfsConnected
}

// Wait for gateway connections before try fetch any content 
const waitLoop = (callback: (value?: unknown) => void) => {
    // If connected return
    if (instance?.ipfsConnected) {
        callback()
        return
    }
    // Try again if not connected.
    setTimeout(() => {
        if (instance) waitLoop(callback)
    }, 100)
}

class IPFSFetcher {

    // List of gateways that successfully responded
    gatewaysFetched: IPFSGateway[]
    // True when sucessfully connected with at least two gateways
    ipfsConnected = false
    // Time of initialization
    initializedTime: Date;

    constructor(options?: IPFSFetcherOptions) {
        this.initializedTime = new Date();
        this.gatewaysFetched = [];
        if (verbose) console.log('-- IPFS Starting connection process --');
        this.initialize(options);
    }

    private async initialize(options?: IPFSFetcherOptions) {
        const domains = options?.customDomains ? options.customDomains : await fetchGateways();
    
        for (const gatewayPath of domains) {
            const dateBefore = Date.now();
            let timeoutId;
    
            try {
                // Race between fetch and timeout
                await Promise.race([
                    fetch(gatewayPath + '/ipfs/' + 'bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m', { mode: 'cors', method: 'HEAD' }),
                    new Promise((_, reject) => { timeoutId = setTimeout(() => reject(new Error("Timeout")), 5000) })
                ]).then((response: Response) => {
                    clearTimeout(timeoutId);
    
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
    
                    // Record successful gateway
                    this.gatewaysFetched.push({ path: gatewayPath, response: Date.now() - dateBefore });
                    this.gatewaysFetched.sort((a, b) => a.response - b.response);  // Sort by response time
    
                    if (verbose) console.log('Gateway connected: ', this.gatewaysFetched.length, '-', gatewayPath);
    
                    // If more than minimum gateways succeed, mark as connected
                    if (this.gatewaysFetched.length >= (options?.minimumGateways || 5) && !this.ipfsConnected) {
                        if (verbose) console.log('-- IPFS Connected to enough gateways --');
                        this.ipfsConnected = true;
                    }
                });
            } catch (error) {
                clearTimeout(timeoutId);
                if (verbose) console.log('Failed to fetch gateway or Path based Gateway', gatewayPath, error instanceof Error ? error.message : '');
            }
        }
    }
    
}

// Try to fetch a content to via gateway path
class PathResolver {

    controller: AbortController;
    signal: AbortSignal;
    gateway: IPFSGateway;
    gatewayPath: string;

    constructor(digested: string, gateway: IPFSGateway) {
        this.controller = new AbortController();
        this.signal = this.controller.signal;
        this.gatewayPath = gateway.path + '/ipfs/' + digested;
    }

    async fetch() {
        return new Promise<string>((resolve, reject) => {
            if(verbose) console.log('Fetching content from', this.gatewayPath)
            // Fetch digested path from best gateways
            fetch(this.gatewayPath, { method: 'HEAD', signal: this.signal })
                .then((r) => {
                    // If fetched return as soon as possible
                    if (r.ok) {
                        resolve(this.gatewayPath)
                        return
                    }
                    if (verbose) console.log('Error fetching content from', this.gatewayPath, r.statusText)
                    throw new Error('Error fetching content')
                })
                .catch((_err: any) => {
                    // if (err.name === 'AbortError') {
                    //     // console.log('Aborted request', this.gatewayPath)
                    // } else if (this.gateway && err.code && err.code != 20) {
                    //     this.gateway.errors++

                    reject()
                })
        })
    }

    // Kill resolver in case of other fetched faster or timeout
    kill() {
        this.controller.abort()
    }
}

class PersistentFetcher {

    // Will be use to kill/abort fetch request that could still be alive
    resolvers: PathResolver[]
    // A string containing a CID and maybe a Subpath togheter
    digested: string
    // The raw path for request in case everything fails
    originalPath: string
    // How many tries
    tries: number
    // Item found!
    found: null | string
    // Max retries before give up
    maxFetchTries: number

    constructor(digested: string, originalPath: string, maxFetchTriesOverride: number = 5) {
        this.digested = digested;
        this.originalPath = originalPath;
        this.resolvers = [];
        this.maxFetchTries = maxFetchTriesOverride;
    }

    // Try persistently to fetch 
    async fetch() {
        this.tries = 0;
        this.found = undefined;

        while (!this.found && this.tries < this.maxFetchTries) {
            if (verbose) console.log(`Trying to fetch content, on try`, this.tries);
    
            // Start all fetch promises immediately
            const fetchPromises = instance.gatewaysFetched.slice(0, gatewayCheckAmount).map((gateway) => {
                const resolver = new PathResolver(this.digested, gateway);
                this.resolvers.push(resolver);
                return resolver.fetch().catch(err => new Promise(() => {})); // Catch errors to prevent Promise rejection
            });
    
            // Create timeout promise
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => resolve(null), gatewayTimeout);
            });
    
            // Race all fetch promises against timeout
            const results = await Promise.race([...fetchPromises, timeoutPromise]);
    
            // Clear resolvers immediately on receiving a result
            this.resolvers.forEach((r) => r.kill());
            this.resolvers = [];
    
            // Process results
            if (typeof results === 'string') {
                if (verbose) console.log('Found content at', results);
                this.found = results; // This will be the fastest response
            } else {
                this.tries++; // Increment if no successful fetches
            }
        }
        
        // If instance too old, reinitialize
        if (instance && (new Date().getTime() - instance.initializedTime.getTime()) > reinitializeTime) {
            if(verbose) console.log('Instance too old, reinitializing');
            await Initialize({ forceInitialize: true, ...initialOptions });
        }

        // In case of successful found a resource, return it.
        if (this.found) return this.found
        // In case of a non successful fetch after maxFetchTries tries, return descriptive error
        throw new Error('Failed to fetch content. Possibly not pinned in which case the retrieval process should have been initiated.');
    }
}


// Fetch fastest IPFS gateway url for the desired content 
export const FetchContent = async (path: string, maxFetchTries = 3) => {
    let digested = Utilities.digestPath(path)
    if (!digested.isIPFS) {
        throw new Error('Invalid IPFS path');
    }

    // Wait connection to be completed before try to fetch 
    await new Promise(resolve => { waitLoop(resolve) });

    const fetcher = new PersistentFetcher(digested.cid + digested.subpath, path, maxFetchTries)
    return fetcher.fetch()
}

// Fetch a JSON formatted doc from fastest IPFS gateways connected
export const FetchJSON = async (path, maxFetchTries = 3) => {
    const newPath = await FetchContent(path, maxFetchTries);
    return new Promise((resolve, reject) => {
        fetch(newPath)
            .then((r) => r.json())
            .then(doc => resolve(doc))
            .catch((err) => {
                if(err instanceof Error && err.message.toLowerCase().includes('unexpected')) {
                    reject('Failed to parse JSON. The content fetched is not a valid JSON document.');
                } else {
                    reject('Failed to fetch JSON content.');
                }
            });
    })
}