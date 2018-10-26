import { TokenTicker } from "@iov/bcp-types";

import { constants } from "./constants";

export interface AmountFields {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export class Parse {
  public static ethereumAmount(total: string): AmountFields {
    const totalLenght = total.length;
    const sigFigs = constants.primaryTokenSigFigs;
    return {
      whole: Number(total.substring(0, totalLenght - sigFigs).replace(/^0+/, "")) || 0,
      fractional: Number(total.substring(totalLenght - sigFigs, totalLenght).replace(/^0+/, "")) || 0,
      tokenTicker: constants.primaryTokenTicker,
    };
  }
}
