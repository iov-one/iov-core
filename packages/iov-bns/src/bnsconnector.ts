import { ChainConnector } from "@iov/bcp-types";

import { bnsCodec } from "./bnscodec";
import { Client } from "./bnsconnection";

/**
 * A helper to connect to a bns-based chain at a given url
 */
export function bnsConnector(url: string): ChainConnector {
  return {
    client: () => Client.connect(url),
    codec: bnsCodec,
  };
}
