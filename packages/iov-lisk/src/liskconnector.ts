import { ChainConnector } from "@iov/core";

import { LiskClient } from "./liskclient";
import { liskCodec } from "./liskcodec";

export function liskConnector(url: string): ChainConnector {
  return {
    client: () => Promise.resolve(new LiskClient(url)),
    codec: liskCodec,
  };
}
