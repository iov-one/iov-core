import { TxCodec } from "./codec";
import { BlockchainConnection } from "./connection";
import { ChainId } from "./transactions";
export interface ChainConnector<T extends BlockchainConnection = BlockchainConnection> {
  readonly establishConnection: () => Promise<T>;
  readonly codec: TxCodec;
  readonly expectedChainId: ChainId | undefined;
}
