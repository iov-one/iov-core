import { ChainId } from "@iov/base-types";
import { ChainConnector } from "@iov/bcp-types";
/**
 * A helper to connect to a bns-based chain at a given url
 */
export declare function bnsConnector(url: string, expectedChainId?: ChainId): ChainConnector;
