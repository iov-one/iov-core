import { Nonce, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import BN = require("bn.js");

import { constants } from "./constants";
import { isValidAddress } from "./derivation";
import { toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, hexPadToEven, stringDataToHex } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    switch (unsigned.kind) {
      case TransactionKind.Send:
        let gasPriceHex = "0x";
        let gasLimitHex = "0x";
        let dataHex = "0x";
        let nonceHex = "0x";

        const chainIdHex = encodeQuantity(Number(unsigned.chainId));
        const valueHex = encodeQuantityString(
          Serialization.amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional),
        );
        if (nonce.toNumber() > 0) {
          nonceHex = encodeQuantity(nonce.toNumber());
        }
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

        return new Uint8Array(
          toRlp([
            Buffer.from(fromHex(hexPadToEven(nonceHex))),
            Buffer.from(fromHex(hexPadToEven(gasPriceHex))),
            Buffer.from(fromHex(hexPadToEven(gasLimitHex))),
            Buffer.from(fromHex(hexPadToEven(unsigned.recipient))),
            Buffer.from(fromHex(hexPadToEven(valueHex))),
            Buffer.from(fromHex(hexPadToEven(dataHex))),
            Buffer.from(fromHex(hexPadToEven(chainIdHex))),
            Buffer.from([]),
            Buffer.from([]),
          ]),
        );
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
