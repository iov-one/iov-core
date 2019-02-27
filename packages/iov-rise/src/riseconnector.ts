import { ChainConnector } from "@iov/bcp";

import { riseCodec } from "./risecodec";
import { RiseConnection } from "./riseconnection";

export function riseConnector(url: string): ChainConnector {
  return {
    client: async () => RiseConnection.establish(url),
    codec: riseCodec,
  };
}
