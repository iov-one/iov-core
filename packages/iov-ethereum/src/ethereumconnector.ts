import { ChainConnector, ChainId } from "@iov/bcp";

import { EthereumCodec } from "./ethereumcodec";
import { EthereumConnection, EthereumConnectionOptions } from "./ethereumconnection";

/**
 * A helper to connect to a ethereum-based chain at a given url
 *
 * @param options An EthereumConnectionOptions object. If {}, all possible options are set to their default.
 */
export function createEthereumConnector(
  url: string,
  options: EthereumConnectionOptions,
  expectedChainId?: ChainId,
): ChainConnector {
  return {
    establishConnection: async () => EthereumConnection.establish(url, options),
    codec: new EthereumCodec({
      erc20Tokens: options.erc20Tokens,
      atomicSwapEtherContractAddress: options.atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress: options.atomicSwapErc20ContractAddress,
    }),
    expectedChainId: expectedChainId,
  };
}
