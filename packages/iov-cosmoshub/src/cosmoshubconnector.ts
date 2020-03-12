import { ChainConnector, ChainId } from "@iov/bcp";

import { CosmosHubCodec } from "./cosmoshubcodec";
import { CosmosHubConnection } from "./cosmoshubconnection";

/**
 * A helper to connect to a cosmos-based chain at a given url
 */
export function createCosmosHubConnector(
  url: string,
  expectedChainId?: ChainId,
): ChainConnector<CosmosHubConnection> {
  // Avoid the use of default `cosmosCodec` here to prepare for codec configurations
  const codec = new CosmosHubCodec();
  return {
    establishConnection: async () => CosmosHubConnection.establish(url, codec),
    codec: codec,
    expectedChainId: expectedChainId,
  };
}
