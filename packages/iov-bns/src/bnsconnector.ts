import { ChainConnector, ChainId } from "@iov/bcp";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";

/**
 * A helper to connect to a bns-based chain at a given url
 */
export function createBnsConnector(url: string, expectedChainId?: ChainId): ChainConnector {
  return {
    establishConnection: async () => BnsConnection.establish(url),
    codec: bnsCodec,
    expectedChainId: expectedChainId,
  };
}
