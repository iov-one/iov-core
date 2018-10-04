import { ChainConnector } from "@iov/bcp-types";

import { LiskClient } from "./liskclient";
import { liskCodec } from "./liskcodec";

export function liskConnector(url: string): ChainConnector {
  return {
    client: () => LiskClient.connect(url),
    codec: liskCodec,
  };
}
