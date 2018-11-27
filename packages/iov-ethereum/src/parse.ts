import { TokenTicker } from "@iov/bcp-types";

import { constants } from "./constants";

export interface AmountFields {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export class Parse {
  public static ethereumAmount(total: string): AmountFields {
    const fractionalDigits = constants.primaryTokenFractionalDigits;
    return {
      whole: Number.parseInt(total.slice(0, -fractionalDigits).replace(/^0+/, ""), 10) || 0,
      fractional: Number.parseInt(total.slice(-fractionalDigits).replace(/^0+/, ""), 10) || 0,
      tokenTicker: constants.primaryTokenTicker,
    };
  }
}
