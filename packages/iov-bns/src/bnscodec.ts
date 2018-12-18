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
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { parseTx } from "./decode";
import { buildSignedTx, buildUnsignedTx } from "./encode";
import * as codecImpl from "./generated/codecimpl";
import { appendSignBytes, isValidAddress, keyToAddress, tendermintHash } from "./util";

export const bnsCodec: TxCodec = {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  bytesToSign: (tx: UnsignedTransaction, nonce: Nonce): SigningJob => {
    // we encode it without any signatures
    const built = buildUnsignedTx(tx);
    const bz = codecImpl.app.Tx.encode(built).finish();
    // now we want to append the nonce and chainID
    const bytes = appendSignBytes(bz, tx.chainId, nonce);
    return { bytes, prehashType: PrehashType.Sha512 };
  },

  // bytesToPost includes the raw transaction appended with the various signatures
  bytesToPost: (tx: SignedTransaction): PostableBytes => {
    const built = buildSignedTx(tx);
    const outBuffer = codecImpl.app.Tx.encode(built).finish();
    return new Uint8Array(outBuffer) as PostableBytes;
  },

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  identifier: (tx: SignedTransaction): TransactionId => {
    const transactionBytes = bnsCodec.bytesToPost(tx);
    return Encoding.toHex(tendermintHash(transactionBytes)).toUpperCase() as TransactionId;
  },

  // parseBytes will recover bytes from the blockchain into a format we can use
  parseBytes: (bz: PostableBytes, chainId: ChainId): SignedTransaction => {
    const parsed = codecImpl.app.Tx.decode(bz);
    return parseTx(parsed, chainId);
  },

  keyToAddress: keyToAddress,
  isValidAddress: isValidAddress,
};
