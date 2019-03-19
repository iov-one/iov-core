import { isSendTransaction, Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { isValidAddress } from "./address";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, fromBcpChainId, normalizeHex } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeUnsignedEthSendTransaction(
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    recipientHex: string,
    valueHex: string,
    dataHex: string,
    chainIdHex: string,
  ): Uint8Array {
    // Last 3 items are v, r and s values. Are present to encode full structure.
    return toRlp([
      Serialization.encodeNonce(nonce),
      fromHex(normalizeHex(gasPriceHex)),
      fromHex(normalizeHex(gasLimitHex)),
      fromHex(normalizeHex(recipientHex)),
      fromHex(normalizeHex(valueHex)),
      fromHex(normalizeHex(dataHex)),
      fromHex(normalizeHex(chainIdHex)),
      new Uint8Array([]),
      new Uint8Array([]),
    ]);
  }

  public static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    if (isSendTransaction(unsigned)) {
      const chainIdHex = encodeQuantity(fromBcpChainId(unsigned.creator.chainId));
      const valueHex = encodeQuantityString(unsigned.amount.quantity);
      if (!unsigned.fee || !unsigned.fee.gasPrice) {
        throw new Error("fee.gasPrice must be set");
      }
      const gasPriceHex = encodeQuantityString(unsigned.fee.gasPrice.quantity);
      if (!unsigned.fee.gasLimit) {
        throw new Error("fee.gasLimit must be set");
      }
      const gasLimitHex = encodeQuantityString(unsigned.fee.gasLimit.quantity);
      const dataHex = unsigned.memo ? "0x" + Encoding.toHex(Encoding.toUtf8(unsigned.memo)) : "0x";

      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }

      return Serialization.serializeUnsignedEthSendTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        unsigned.recipient,
        valueHex,
        dataHex,
        chainIdHex,
      );
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

      const valueHex = encodeQuantityString(unsigned.amount.quantity);
      if (unsigned.fee && unsigned.fee.gasPrice) {
        gasPriceHex = encodeQuantityString(unsigned.fee.gasPrice.quantity);
      }
      if (unsigned.fee && unsigned.fee.gasLimit) {
        gasLimitHex = encodeQuantityString(unsigned.fee.gasLimit.quantity);
      }
      if (unsigned.memo) {
        dataHex += Encoding.toHex(Encoding.toUtf8(unsigned.memo));
      }
      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }
      const encodedNonce = Serialization.encodeNonce(signed.primarySignature.nonce);
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
        encodedNonce,
        fromHex(normalizeHex(gasPriceHex)),
        fromHex(normalizeHex(gasLimitHex)),
        fromHex(normalizeHex(unsigned.recipient)),
        fromHex(normalizeHex(valueHex)),
        fromHex(normalizeHex(dataHex)),
        fromHex(normalizeHex(encodeQuantity(v))),
        r,
        s,
      ]);
      return postableTx;
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  /**
   * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeNonce(nonce: Nonce): Uint8Array {
    const checkedNonce = new Int53(nonce);

    if (checkedNonce.toNumber() === 0) {
      return new Uint8Array([]);
    } else {
      return fromHex(normalizeHex(encodeQuantity(checkedNonce.toNumber())));
    }
  }
}
