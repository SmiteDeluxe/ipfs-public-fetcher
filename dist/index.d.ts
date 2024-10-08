import { IPFSFetcherOptions } from './types';
export declare const Initialize: (options?: IPFSFetcherOptions) => Promise<void>;
export declare const IsConnected: () => boolean;
export declare const FetchContent: (path: string, notFoundMaxRetries?: number) => Promise<string>;
export declare const FetchJSON: (path: any, notFoundMaxRetries?: number) => Promise<unknown>;
