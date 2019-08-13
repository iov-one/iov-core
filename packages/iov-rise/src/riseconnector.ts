import { ChainConnector, ChainId } from "@iov/bcp";

import { riseCodec } from "./risecodec";
import { RiseConnection } from "./riseconnection";

export function riseConnector(url: string, expectedChainId?: ChainId): ChainConnector {
  return {
    establishConnection: async () => RiseConnection.establish(url),
    codec: riseCodec,
    expectedChainId: expectedChainId,
  };
}
