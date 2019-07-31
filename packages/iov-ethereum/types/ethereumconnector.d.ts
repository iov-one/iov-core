import { ChainConnector, ChainId } from "@iov/bcp";
import { EthereumConnectionOptions } from "./ethereumconnection";
/**
 * A helper to connect to a ethereum-based chain at a given url
 *
 * @param options An EthereumConnectionOptions object. If {}, all possible options are set to their default.
 */
export declare function ethereumConnector(
  url: string,
  options: EthereumConnectionOptions,
  expectedChainId?: ChainId,
): ChainConnector;
