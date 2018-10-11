import { ChainConnector } from "@iov/bcp-types";
import { ChainId } from "@iov/tendermint-types";
/**
 * A helper to connect to a bns-based chain at a given url
 */
export declare function bnsConnector(url: string, expectedChainId?: ChainId): ChainConnector;
