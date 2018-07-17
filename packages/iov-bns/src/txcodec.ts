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
import * as codec from "./codec";
import { parseTx } from "./decode";
import { buildSignedTx, buildUnsignedTx } from "./encode";
import { appendSignBytes, tendermintHash } from "./util";

export class Codec {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  public static bytesToSign(tx: UnsignedTransaction, nonce: Nonce): SigningJob {
    // we encode it without any signatures
    const built = buildUnsignedTx(tx);
    const bz = codec.app.Tx.encode(built).finish();
    // now we want to append the nonce and chainID
    const bytes = appendSignBytes(bz, tx.chainId, nonce);
    // TODO: migrate to Sha512 when the backend is ready
    return { bytes, prehashType: PrehashType.None };
  }

  // bytesToPost includes the raw transaction appended with the various signatures
  public static bytesToPost(tx: SignedTransaction): PostableBytes {
    const built = buildSignedTx(tx);
    return codec.app.Tx.encode(built).finish() as PostableBytes;
  }

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  public static identifier(tx: SignedTransaction): TransactionIDBytes {
    const post = this.bytesToPost(tx);
    return tendermintHash(post) as TransactionIDBytes;
  }

  // parseBytes will recover bytes from the blockchain into a format we can use
  public static parseBytes(bz: PostableBytes, chainId: ChainId): SignedTransaction {
    const parsed = codec.app.Tx.decode(bz);
    return parseTx(parsed, chainId);
  }
}

// we need to create a const to properly type-check the static methods
// and we need to export it to satisfy tsc (but never exported in index.ts)
export const _: TxCodec = Codec;
