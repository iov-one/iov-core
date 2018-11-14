import { Nonce, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import BN = require("bn.js");

import { constants } from "./constants";
import { isValidAddress } from "./derivation";
import { encodeQuantity, encodeQuantityString, hexPadToEven, stringDataToHex } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    switch (unsigned.kind) {
      case TransactionKind.Send:
        let gasPriceHex = "0x";
        let gasLimitHex = "0x";
        let dataHex = "0x";

        const nonceHex = encodeQuantity(nonce.toNumber());
        const chainIdHex = encodeQuantity(Number(unsigned.chainId));
        const valueHex = encodeQuantityString(
          Serialization.amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional),
        );
        if (unsigned.gasPrice) {
          gasPriceHex = encodeQuantityString(
            Serialization.amountFromComponents(unsigned.gasPrice.whole, unsigned.gasPrice.fractional),
          );
        }
        if (unsigned.gasLimit) {
          gasLimitHex = encodeQuantityString(
            Serialization.amountFromComponents(unsigned.gasLimit.whole, unsigned.gasLimit.fractional),
          );
        }
        if (unsigned.memo) {
          dataHex = stringDataToHex(unsigned.memo);
        }
        if (!isValidAddress(unsigned.recipient)) {
          throw new Error("Invalid recipient address");
        }

        return new Uint8Array([
          ...fromHex(hexPadToEven(nonceHex)),
          ...fromHex(hexPadToEven(gasPriceHex)),
          ...fromHex(hexPadToEven(gasLimitHex)),
          ...fromHex(hexPadToEven(unsigned.recipient)),
          ...fromHex(hexPadToEven(valueHex)),
          ...fromHex(hexPadToEven(dataHex)),
          ...fromHex(hexPadToEven(chainIdHex)),
        ]);
      default:
        throw new Error("Unsupported kind of transaction");
    }
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
