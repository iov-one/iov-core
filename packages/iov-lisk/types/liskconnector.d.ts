import { ChainConnector, ChainId } from "@iov/bcp";
import { LiskConnection } from "./liskconnection";
export declare function createLiskConnector(
  url: string,
  expectedChainId?: ChainId,
): ChainConnector<LiskConnection>;
