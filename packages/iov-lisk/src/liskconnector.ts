import { ChainConnector } from "@iov/bcp-types";

import { LiskConnection } from "./liskclient";
import { liskCodec } from "./liskcodec";

export function liskConnector(url: string): ChainConnector {
  return {
    client: () => LiskConnection.connect(url),
    codec: liskCodec,
  };
}
