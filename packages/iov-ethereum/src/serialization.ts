import { isSendTransaction, Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { isValidAddress } from "./derivation";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, fromBcpChainId, hexPadToEven } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    if (isSendTransaction(unsigned)) {
      const chainIdHex = encodeQuantity(fromBcpChainId(unsigned.creator.chainId));
      const valueHex = encodeQuantityString(unsigned.amount.quantity);
      const nonceHex = nonce.toNumber() > 0 ? encodeQuantity(nonce.toNumber()) : "0x";
      const gasPriceHex = unsigned.gasPrice ? encodeQuantityString(unsigned.gasPrice.quantity) : "0x";
      const gasLimitHex = unsigned.gasLimit ? encodeQuantityString(unsigned.gasLimit.quantity) : "0x";
      const dataHex = unsigned.memo ? "0x" + Encoding.toHex(Encoding.toUtf8(unsigned.memo)) : "0x";

      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }

      // Last 3 items are v, r and s values. Are present to encode full structure.
      return toRlp([
        fromHex(hexPadToEven(nonceHex)),
        fromHex(hexPadToEven(gasPriceHex)),
        fromHex(hexPadToEven(gasLimitHex)),
        fromHex(hexPadToEven(unsigned.recipient)),
        fromHex(hexPadToEven(valueHex)),
        fromHex(hexPadToEven(dataHex)),
        fromHex(hexPadToEven(chainIdHex)),
        new Uint8Array([]),
        new Uint8Array([]),
      ]);
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  public static serializeSignedTransaction(signed: SignedTransaction): Uint8Array {
    const unsigned = signed.transaction;

    if (isSendTransaction(unsigned)) {
      let gasPriceHex = "0x";
      let gasLimitHex = "0x";
      let dataHex = "0x";
      let nonceHex = "0x";

      const valueHex = encodeQuantityString(unsigned.amount.quantity);
      if (signed.primarySignature.nonce.toNumber() > 0) {
        nonceHex = encodeQuantity(signed.primarySignature.nonce.toNumber());
      }
      if (unsigned.gasPrice) {
        gasPriceHex = encodeQuantityString(unsigned.gasPrice.quantity);
      }
      if (unsigned.gasLimit) {
        gasLimitHex = encodeQuantityString(unsigned.gasLimit.quantity);
      }
      if (unsigned.memo) {
        dataHex += Encoding.toHex(Encoding.toUtf8(unsigned.memo));
      }
      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }
      const sig = ExtendedSecp256k1Signature.fromFixedLength(signed.primarySignature.signature);
      const r = sig.r();
      const s = sig.s();
      const chainId = fromBcpChainId(unsigned.creator.chainId);
      const chain: Eip155ChainId =
        chainId > 0
          ? { forkState: BlknumForkState.Forked, chainId: chainId }
          : { forkState: BlknumForkState.Before };
      const v = eip155V(chain, sig.recovery);
      const postableTx = toRlp([
        fromHex(hexPadToEven(nonceHex)),
        fromHex(hexPadToEven(gasPriceHex)),
        fromHex(hexPadToEven(gasLimitHex)),
        fromHex(hexPadToEven(unsigned.recipient)),
        fromHex(hexPadToEven(valueHex)),
        fromHex(hexPadToEven(dataHex)),
        fromHex(hexPadToEven(encodeQuantity(v))),
        r,
        s,
      ]);
      return postableTx;
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }
}
