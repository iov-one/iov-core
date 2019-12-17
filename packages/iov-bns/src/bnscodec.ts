import {
  ChainId,
  Nonce,
  PostableBytes,
  PrehashType,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { TxBytes, v0_31 } from "@iov/tendermint-rpc";

import { decodeSignedTx } from "./decode";
import { encodeSignedTx, encodeUnsignedTx } from "./encode";
import * as codecImpl from "./generated/codecimpl";
import { appendSignBytes, identityToAddress, isValidAddress } from "./util";

export const bnsCodec: TxCodec = {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  bytesToSign: (tx: UnsignedTransaction, nonce: Nonce): SigningJob => {
    // we encode it without any signatures
    const protobufBytes = Uint8Array.from(codecImpl.bnsd.Tx.encode(encodeUnsignedTx(tx)).finish());
    // now we want to append the nonce and chainID
    const bytes = appendSignBytes(protobufBytes, tx.chainId, nonce);
    return { bytes: bytes, prehashType: PrehashType.Sha512 };
  },

  // bytesToPost includes the raw transaction appended with the various signatures
  bytesToPost: (tx: SignedTransaction): PostableBytes => {
    const built = encodeSignedTx(tx);
    const out = new Uint8Array(codecImpl.bnsd.Tx.encode(built).finish());
    return out as PostableBytes;
  },

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  identifier: (tx: SignedTransaction): TransactionId => {
    const transactionBytes = (bnsCodec.bytesToPost(tx) as unknown) as TxBytes;
    const hash = v0_31.hashTx(transactionBytes);
    return Encoding.toHex(hash).toUpperCase() as TransactionId;
  },

  // parseBytes will recover bytes from the blockchain into a format we can use
  parseBytes: (bz: PostableBytes, chainId: ChainId): SignedTransaction => {
    const parsed = codecImpl.bnsd.Tx.decode(bz);
    return decodeSignedTx(parsed, chainId);
  },

  identityToAddress: identityToAddress,
  isValidAddress: isValidAddress,
};
