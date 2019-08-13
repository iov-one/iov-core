import { ChainConnector, ChainId } from "@iov/bcp";

import { liskCodec } from "./liskcodec";
import { LiskConnection } from "./liskconnection";

export function liskConnector(url: string, expectedChainId?: ChainId): ChainConnector {
  return {
    establishConnection: async () => LiskConnection.establish(url),
    codec: liskCodec,
    expectedChainId: expectedChainId,
  };
}
