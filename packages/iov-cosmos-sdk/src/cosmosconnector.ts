import { ChainConnector, ChainId } from "@iov/bcp";

import { CosmosCodec } from "./cosmoscodec";
import { CosmosConnection, TokenConfiguration } from "./cosmosconnection";

/**
 * A helper to connect to a cosmos-based chain at a given url
 */
export function createCosmosConnector(
  url: string,
  addressPrefix: string,
  tokenConfig: TokenConfiguration,
  expectedChainId?: ChainId,
): ChainConnector<CosmosConnection> {
  const codec = new CosmosCodec(addressPrefix, tokenConfig.bankTokens);
  return {
    establishConnection: async () => CosmosConnection.establish(url, addressPrefix, tokenConfig),
    codec: codec,
    expectedChainId: expectedChainId,
  };
}
