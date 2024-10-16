export type IPFSFetcherOptions = {
    customDomains?: string[];
    verbose?: boolean;
    forceInitialize?: boolean;
    minimumGateways?: number;
    gatewayCheckAmount?: number;
    gatewayTimeout?: number;
    reinitializeTime?: number;
};
export type IPFSGateway = {
    path: string;
    response: number;
};
