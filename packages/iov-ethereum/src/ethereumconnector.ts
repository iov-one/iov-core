import { ChainConnector, ChainId } from "@iov/bcp-types";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection } from "./ethereumconnection";

/**
 * A helper to connect to a ethereum-based chain at a given url
 */
export function ethereumConnector(
  url: string,
  wsUrl: string | undefined,
  expectedChainId?: ChainId,
): ChainConnector {
  return {
    client: () => EthereumConnection.establish(url, wsUrl),
    codec: ethereumCodec,
    expectedChainId,
  };
}
