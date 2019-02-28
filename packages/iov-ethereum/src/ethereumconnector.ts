import { ChainConnector, ChainId } from "@iov/bcp";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection, EthereumConnectionOptions } from "./ethereumconnection";

/**
 * A helper to connect to a ethereum-based chain at a given url
 *
 * @param options An EthereumConnectionOptions object. If undefined, all possible options are default.
 */
export function ethereumConnector(
  url: string,
  options: EthereumConnectionOptions | undefined,
  expectedChainId?: ChainId,
): ChainConnector {
  const usedOptions: EthereumConnectionOptions = options || {};
  return {
    client: async () => EthereumConnection.establish(url, usedOptions),
    codec: ethereumCodec,
    expectedChainId,
  };
}
