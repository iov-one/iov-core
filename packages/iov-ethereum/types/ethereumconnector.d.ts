import { ChainId } from "@iov/base-types";
import { ChainConnector } from "@iov/bcp-types";
/**
 * A helper to connect to a ethereum-based chain at a given url
 */
export declare function ethereumConnector(url: string, wsUrl: string | undefined, expectedChainId?: ChainId): ChainConnector;
