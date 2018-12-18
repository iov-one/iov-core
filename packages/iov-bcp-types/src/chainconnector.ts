import { ChainId } from "@iov/base-types";

import { TxCodec } from "./codec";
import { BcpConnection } from "./connection";

export interface ChainConnector {
  readonly client: () => Promise<BcpConnection>;
  readonly codec: TxCodec;
  readonly expectedChainId?: ChainId;
}
