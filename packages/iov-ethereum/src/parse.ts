import { Amount } from "@iov/bcp-types";

import { constants } from "./constants";

export class Parse {
  public static ethereumAmount(total: string): Amount {
    const fractionalDigits = constants.primaryTokenFractionalDigits;
    return {
      whole: Number.parseInt(total.slice(0, -fractionalDigits).replace(/^0+/, ""), 10) || 0,
      fractional: Number.parseInt(total.slice(-fractionalDigits).replace(/^0+/, ""), 10) || 0,
      fractionalDigits: fractionalDigits,
      tokenTicker: constants.primaryTokenTicker,
    };
  }
}
