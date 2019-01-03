import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PostableBytes,
  PrehashType,
  PublicIdentity,
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
import { BlknumForkState, Eip155ChainId, getRecoveryParam } from "./encoding";
import { Serialization } from "./serialization";
import { decodeHexQuantity, decodeHexQuantityNonce, decodeHexQuantityString, fromBcpChainId } from "./utils";

export const ethereumCodec: TxCodec = {
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    return {
      bytes: Serialization.serializeUnsignedTransaction(unsigned, nonce) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    return Serialization.serializeSignedTransaction(signed) as PostableBytes;
  },
  identifier: (signed: SignedTransaction): TransactionId => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    const json = JSON.parse(Encoding.fromUtf8(bytes));
    // signature
    const chain: Eip155ChainId = {
      forkState: BlknumForkState.Forked,
      chainId: fromBcpChainId(chainId),
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
  identityToAddress: (identity: PublicIdentity): Address => {
    return keyToAddress(identity.pubkey);
  },
  isValidAddress: isValidAddress,
};
