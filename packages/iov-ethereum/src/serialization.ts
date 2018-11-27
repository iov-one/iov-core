import { Nonce, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import BN = require("bn.js");

import { constants } from "./constants";
import { isValidAddress } from "./derivation";
import { toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, hexPadToEven } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    switch (unsigned.kind) {
      case TransactionKind.Send:
        const chainIdHex = encodeQuantity(Number(unsigned.chainId));
        const valueHex = encodeQuantityString(
          Serialization.amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional),
        );
        const nonceHex = nonce.toNumber() > 0 ? encodeQuantity(nonce.toNumber()) : "0x";
        const gasPriceHex = unsigned.gasPrice
          ? encodeQuantityString(
              Serialization.amountFromComponents(unsigned.gasPrice.whole, unsigned.gasPrice.fractional),
            )
          : "0x";
        const gasLimitHex = unsigned.gasLimit
          ? encodeQuantityString(
              Serialization.amountFromComponents(unsigned.gasLimit.whole, unsigned.gasLimit.fractional),
            )
          : "0x";
        const dataHex = unsigned.memo ? "0x" + Encoding.toHex(Encoding.toUtf8(unsigned.memo)) : "0x";

        if (!isValidAddress(unsigned.recipient)) {
          throw new Error("Invalid recipient address");
        }

        // Last 3 items are v, r and s values. Are present to encode full structure.
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
    const base10BigNumber = new BN(10);
    const wholeBigNumber = new BN(whole);
    const sigFigsBigNumber = new BN(constants.primaryTokenSigFigs);
    const fractionalBigNumber = new BN(fractional);
    return base10BigNumber
      .pow(sigFigsBigNumber)
      .mul(wholeBigNumber)
      .add(fractionalBigNumber)
      .toString();
  }
}
