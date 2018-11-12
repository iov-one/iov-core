import { Nonce, UnsignedTransaction } from "@iov/bcp-types";

import BN = require("bn.js");
import { constants } from "./constants";

export class Serialization {
  public static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    console.log("input", unsigned, nonce);
    return new Uint8Array([]);
  }
  public static amountFromComponents(whole: number, fractional: number): string {
    const base10BN = new BN(10);
    const wholeBN = new BN(whole);
    const sigFigsBN = new BN(constants.primaryTokenSigFigs);
    const fractionalBN = new BN(fractional);
    return base10BN
      .pow(sigFigsBN)
      .mul(wholeBN)
      .add(fractionalBN)
      .toString();
  }
}
