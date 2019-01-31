import { ChainConnector, ChainId } from "@iov/bcp-types";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection, EthereumConnectionOptions } from "./ethereumconnection";

/**
 * A helper to connect to a ethereum-based chain at a given url
 *
 * @param options if string, interpreted as a websocket URL; otherwise a EthereumConnectionOptions object
 */
export function ethereumConnector(
  url: string,
  options: string | undefined | EthereumConnectionOptions,
  expectedChainId?: ChainId,
): ChainConnector {
  const usedOptions: EthereumConnectionOptions =
    typeof options === "string" || options === undefined ? { wsUrl: options } : options;
  return {
    client: () => EthereumConnection.establish(url, usedOptions),
    codec: ethereumCodec,
    expectedChainId,
  };
}
