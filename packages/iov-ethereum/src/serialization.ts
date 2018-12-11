import { isSendTransaction, Nonce, UnsignedTransaction } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { isValidAddress } from "./derivation";
import { toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, hexPadToEven } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    if (isSendTransaction(unsigned)) {
      const chainIdHex = encodeQuantity(Number(unsigned.chainId));
      const valueHex = encodeQuantityString(unsigned.amount.quantity);
      const nonceHex = nonce.toNumber() > 0 ? encodeQuantity(nonce.toNumber()) : "0x";
      const gasPriceHex = unsigned.gasPrice ? encodeQuantityString(unsigned.gasPrice.quantity) : "0x";
      const gasLimitHex = unsigned.gasLimit ? encodeQuantityString(unsigned.gasLimit.quantity) : "0x";
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
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }
}
