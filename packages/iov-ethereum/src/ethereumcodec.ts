import { ChainId, PostableBytes } from "@iov/base-types";
import {
  Nonce,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TransactionIdBytes,
  TransactionKind,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { isValidAddress, keyToAddress } from "./derivation";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { Serialization } from "./serialization";
import { encodeQuantity, encodeQuantityString, hexPadToEven } from "./utils";

const { fromHex } = Encoding;

export const ethereumCodec: TxCodec = {
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    return {
      bytes: Serialization.serializeTransaction(unsigned, nonce) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    switch (signed.transaction.kind) {
      case TransactionKind.Send:
        let gasPriceHex = "0x";
        let gasLimitHex = "0x";
        let dataHex = "0x";
        let nonceHex = "0x";

        const valueHex = encodeQuantityString(signed.transaction.amount.quantity);
        if (signed.primarySignature.nonce.toNumber() > 0) {
          nonceHex = encodeQuantity(signed.primarySignature.nonce.toNumber());
        }
        if (signed.transaction.gasPrice) {
          gasPriceHex = encodeQuantityString(signed.transaction.gasPrice.quantity);
        }
        if (signed.transaction.gasLimit) {
          gasLimitHex = encodeQuantityString(signed.transaction.gasLimit.quantity);
        }
        if (signed.transaction.memo) {
          dataHex += Encoding.toHex(Encoding.toUtf8(signed.transaction.memo));
        }
        if (!isValidAddress(signed.transaction.recipient)) {
          throw new Error("Invalid recipient address");
        }
        const sig = ExtendedSecp256k1Signature.fromFixedLength(signed.primarySignature.signature);
        const r = sig.r();
        const s = sig.s();
        const chain: Eip155ChainId = {
          forkState: BlknumForkState.Forked,
          chainId: Number(signed.transaction.chainId),
        };
        const v = eip155V(chain, sig.recovery);
        const chainIdHex = encodeQuantity(v);
        const postableTx = new Uint8Array(
          toRlp([
            Buffer.from(fromHex(hexPadToEven(nonceHex))),
            Buffer.from(fromHex(hexPadToEven(gasPriceHex))),
            Buffer.from(fromHex(hexPadToEven(gasLimitHex))),
            Buffer.from(fromHex(hexPadToEven(signed.transaction.recipient))),
            Buffer.from(fromHex(hexPadToEven(valueHex))),
            Buffer.from(fromHex(hexPadToEven(dataHex))),
            Buffer.from(fromHex(hexPadToEven(chainIdHex))),
            Buffer.from(r),
            Buffer.from(s),
          ]),
        );
        return postableTx as PostableBytes;
      default:
        throw new Error("Unsupported kind of transaction");
    }
  },
  identifier: (signed: SignedTransaction): TransactionIdBytes => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    throw new Error(`Not implemented bytes: ${bytes}, chainId: ${chainId}`);
  },
  keyToAddress: keyToAddress,
  isValidAddress: isValidAddress,
};
