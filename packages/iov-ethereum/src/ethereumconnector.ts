import { ChainConnector, ChainId } from "@iov/bcp-types";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection, EthereumConnectionOptions } from "./ethereumconnection";

/**
 * A helper to connect to a ethereum-based chain at a given url
 */
export function ethereumConnector(
  url: string,
  wsUrl: string | undefined,
  expectedChainId?: ChainId,
): ChainConnector {
  const options: EthereumConnectionOptions = {
    wsUrl: wsUrl,
  };
  return {
    client: () => EthereumConnection.establish(url, options),
    codec: ethereumCodec,
    expectedChainId,
  };
}
