import { ChainConnector, ChainId } from "@iov/bcp";

import { CosmosCodec } from "./cosmoscodec";
import { CosmosConnection } from "./cosmosconnection";

/**
 * A helper to connect to a cosmos-based chain at a given url
 */
export function createCosmosConnector(
  url: string,
  expectedChainId?: ChainId,
): ChainConnector<CosmosConnection> {
  // Avoid the use of default `cosmosCodec` here to prepare for codec configurations
  const codec = new CosmosCodec();
  return {
    establishConnection: async () => CosmosConnection.establish(url, codec),
    codec: codec,
    expectedChainId: expectedChainId,
  };
}
