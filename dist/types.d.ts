export type IPFSFetcherOptions = {
    customDomains?: string[];
    verbose?: boolean;
    forceInitialize?: boolean;
    minimumGateways?: number;
    notFoundMaxRetries?: number;
};
export type IPFSGateway = {
    path: string;
    errors: number;
    response: number;
};
