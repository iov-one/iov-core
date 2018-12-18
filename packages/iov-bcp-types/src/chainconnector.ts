import { TxCodec } from "./codec";
import { BcpConnection } from "./connection";
import { ChainId } from "./transactions";

export interface ChainConnector {
  readonly client: () => Promise<BcpConnection>;
  readonly codec: TxCodec;
  readonly expectedChainId?: ChainId;
}
