import { TxCodec } from "./codec";
import { BlockchainConnection } from "./connection";
import { ChainId } from "./transactions";

export interface ChainConnector {
  readonly establishConnection: () => Promise<BlockchainConnection>;
  readonly codec: TxCodec;
  readonly expectedChainId: ChainId | undefined;
}
