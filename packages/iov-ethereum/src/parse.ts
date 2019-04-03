import { Amount, TransactionId } from "@iov/bcp";

import { constants } from "./constants";

export class Parse {
  public static ethereumAmount(total: string): Amount {
    if (!total.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }

    // cut leading zeros
    const quantity = total.replace(/^0*/, "") || "0";

    const fractionalDigits = constants.primaryTokenFractionalDigits;
    return {
      quantity: quantity,
      fractionalDigits: fractionalDigits,
      tokenTicker: constants.primaryTokenTicker,
    };
  }

  public static transactionId(hash: string): TransactionId {
    if (!hash.match(/^0x[0-9a-f]{64}$/)) {
      throw new Error("Invalid transaction ID format");
    }
    return hash as TransactionId;
  }
}
