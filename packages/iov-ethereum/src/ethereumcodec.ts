import {
  Algorithm,
  ChainId,
  isSendTransaction,
  Nonce,
  PostableBytes,
  PrehashType,
  PublicKeyBytes,
  SendTransaction,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { constants } from "./constants";
import { isValidAddress, keyToAddress } from "./derivation";
import { BlknumForkState, Eip155ChainId, eip155V, getRecoveryParam, toRlp } from "./encoding";
import { Serialization } from "./serialization";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  encodeQuantityString,
  hexPadToEven,
} from "./utils";

const { fromHex } = Encoding;

export const ethereumCodec: TxCodec = {
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    return {
      bytes: Serialization.serializeTransaction(unsigned, nonce) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
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
      const chain: Eip155ChainId = {
        forkState: BlknumForkState.Forked,
        chainId: Number(unsigned.chainId),
      };
      const v = eip155V(chain, sig.recovery);
      const chainIdHex = encodeQuantity(v);
      const postableTx = new Uint8Array(
        toRlp([
          fromHex(hexPadToEven(nonceHex)),
          fromHex(hexPadToEven(gasPriceHex)),
          fromHex(hexPadToEven(gasLimitHex)),
          fromHex(hexPadToEven(unsigned.recipient)),
          fromHex(hexPadToEven(valueHex)),
          fromHex(hexPadToEven(dataHex)),
          fromHex(hexPadToEven(chainIdHex)),
          r,
          s,
        ]),
      );
      return postableTx as PostableBytes;
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  },
  identifier: (signed: SignedTransaction): TransactionId => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    const json = JSON.parse(Encoding.fromUtf8(bytes));
    // signature
    const chain: Eip155ChainId = {
      forkState: BlknumForkState.Forked,
      chainId: Number(chainId),
    };
    const r = Encoding.fromHex(json.r.replace("0x", ""));
    const s = Encoding.fromHex(json.s.replace("0x", ""));
    const v = decodeHexQuantity(json.v);
    const recoveryParam = getRecoveryParam(chain, v);
    const signature = new ExtendedSecp256k1Signature(r, s, recoveryParam).toFixedLength() as SignatureBytes;

    let unsignedTransaction: SendTransaction;
    switch (json.type) {
      case 0:
        const send: SendTransaction = {
          kind: "bcp/send",
          chainId: chainId,
          fee: {
            quantity: decodeHexQuantityString(json.gas),
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          signer: {
            algo: Algorithm.Secp256k1,
            data: json.from,
          },
          amount: {
            quantity: decodeHexQuantityString(json.value),
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          recipient: json.to,
          memo: json.input,
        };
        unsignedTransaction = send;
        break;
      default:
        throw new Error("Unsupported transaction type");
    }

    return {
      transaction: unsignedTransaction,
      primarySignature: {
        nonce: decodeHexQuantityNonce(json.nonce),
        // fake pubkey, we cannot know this
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        signature: signature,
      },
      otherSignatures: [],
    };
  },
  keyToAddress: keyToAddress,
  isValidAddress: isValidAddress,
};
