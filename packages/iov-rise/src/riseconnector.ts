import { ChainConnector, ChainId } from "@iov/bcp";

import { riseCodec } from "./risecodec";
import { RiseConnection } from "./riseconnection";

export function createRiseConnector(url: string, expectedChainId?: ChainId): ChainConnector<RiseConnection> {
  return {
    establishConnection: async () => RiseConnection.establish(url),
    codec: riseCodec,
    expectedChainId: expectedChainId,
  };
}
