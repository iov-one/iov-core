import { ChainConnector, ChainId } from "@iov/bcp";
import { CosmosHubConnection } from "./cosmoshubconnection";
/**
 * A helper to connect to a cosmos-based chain at a given url
 */
export declare function createCosmosHubConnector(
  url: string,
  expectedChainId?: ChainId,
): ChainConnector<CosmosHubConnection>;
