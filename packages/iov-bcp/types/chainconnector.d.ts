import { TxCodec } from "./codec";
import { BlockchainConnection } from "./connection";
import { ChainId } from "./transactions";
export interface ChainConnector {
  readonly client: () => Promise<BlockchainConnection>;
  readonly codec: TxCodec;
  readonly expectedChainId?: ChainId;
}
