import { ReadonlyDate } from "readonly-date";

import { ChainId } from "@iov/base-types";

export interface Header {
  readonly chainId: ChainId;
  readonly height: number;
  readonly time: ReadonlyDate;
  readonly blockId: Uint8Array;
  readonly totalTxs: number;
}
