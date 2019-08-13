import { ChainConnector, ChainId } from "@iov/bcp";
/**
 * A helper to connect to a bns-based chain at a given url
 */
export declare function createBnsConnector(url: string, expectedChainId?: ChainId): ChainConnector;
