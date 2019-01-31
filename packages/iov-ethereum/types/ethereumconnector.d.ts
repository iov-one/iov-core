import { ChainConnector, ChainId } from "@iov/bcp-types";
import { EthereumConnectionOptions } from "./ethereumconnection";
/**
 * A helper to connect to a ethereum-based chain at a given url
 *
 * @param options if string, interpreted as a websocket URL; otherwise a EthereumConnectionOptions object
 */
export declare function ethereumConnector(url: string, options: string | undefined | EthereumConnectionOptions, expectedChainId?: ChainId): ChainConnector;
