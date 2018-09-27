import Long from "long";

import { TokenTicker } from "@iov/bcp-types";

export interface AmountFields {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export class Parse {
  public static liskAmount(str: string): AmountFields {
    const amount = Long.fromString(str, true, 10);
    return {
      whole: amount.divide(100000000).toNumber(),
      fractional: amount.modulo(100000000).toNumber(),
      tokenTicker: "LSK" as TokenTicker,
    };
  }
}
