import { ChainConnector, ChainId } from "@iov/bcp";
import { RiseConnection } from "./riseconnection";
export declare function createRiseConnector(
  url: string,
  expectedChainId?: ChainId,
): ChainConnector<RiseConnection>;
