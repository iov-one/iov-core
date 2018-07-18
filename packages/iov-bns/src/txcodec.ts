import {
  ChainId,
  Nonce,
  PostableBytes,
  PrehashType,
  SignedTransaction,
  SigningJob,
  TransactionIDBytes,
  TxCodec,
  UnsignedTransaction,
} from "@iov/types";
import * as codecImpl from "./codec";
import { parseTx } from "./decode";
import { buildSignedTx, buildUnsignedTx } from "./encode";
import { appendSignBytes, keyToAddress, tendermintHash } from "./util";

export const bnsCodec: TxCodec = {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  bytesToSign: (tx: UnsignedTransaction, nonce: Nonce): SigningJob => {
    // we encode it without any signatures
    const built = buildUnsignedTx(tx);
    const bz = codecImpl.app.Tx.encode(built).finish();
    // now we want to append the nonce and chainID
    const bytes = appendSignBytes(bz, tx.chainId, nonce);
    // TODO: migrate to Sha512 when the backend is ready
    return { bytes, prehashType: PrehashType.None };
  },

  // bytesToPost includes the raw transaction appended with the various signatures
  bytesToPost: (tx: SignedTransaction): PostableBytes => {
    const built = buildSignedTx(tx);
    return codecImpl.app.Tx.encode(built).finish() as PostableBytes;
  },

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  identifier: (tx: SignedTransaction): TransactionIDBytes => {
    const post = bnsCodec.bytesToPost(tx);
    return tendermintHash(post) as TransactionIDBytes;
  },

  // parseBytes will recover bytes from the blockchain into a format we can use
  parseBytes: (bz: PostableBytes, chainId: ChainId): SignedTransaction => {
    const parsed = codecImpl.app.Tx.decode(bz);
    return parseTx(parsed, chainId);
  },

  keyToAddress: keyToAddress,
};
