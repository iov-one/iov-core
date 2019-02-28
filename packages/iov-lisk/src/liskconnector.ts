import { ChainConnector } from "@iov/bcp";

import { liskCodec } from "./liskcodec";
import { LiskConnection } from "./liskconnection";

export function liskConnector(url: string): ChainConnector {
  return {
    client: async () => LiskConnection.establish(url),
    codec: liskCodec,
  };
}
