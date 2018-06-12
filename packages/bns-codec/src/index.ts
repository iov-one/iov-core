import { Nonce, PostableBytes, SignableBytes, SignableTransaction, TransactionIDBytes } from "@iov/types";
import * as codec from "./codec";
import { buildTx } from "./encode";
import { appendSignBytes, tendermintHash } from "./util";

export class Codec {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  public static async bytesToSign(tx: SignableTransaction, nonce: Nonce): Promise<SignableBytes> {
    // we encode it without any signatures
    const built = await buildTx(tx.transaction, []);
    const bz = codec.app.Tx.encode(built).finish();
    // now we want to append the nonce and chainID
    return appendSignBytes(bz, tx.transaction.chainId, nonce);
  }

  // bytesToPost includes the raw transaction appended with the various signatures
  public static async bytesToPost(tx: SignableTransaction): Promise<PostableBytes> {
    const built = await buildTx(tx.transaction, tx.signatures);
    return codec.app.Tx.encode(built).finish() as PostableBytes;
  }

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  public static async identifier(tx: SignableTransaction): Promise<TransactionIDBytes> {
    const post = await this.bytesToPost(tx);
    return tendermintHash(post) as Promise<TransactionIDBytes>;
  }

  // parseBytes will recover bytes from the blockchain into a format we can use
  public static parseBytes(/*bz: PostableBytes*/): SignableTransaction {
    throw new Error("not yet implemented");
  }
}

// we need to create a const to properly type-check the export...
// export const BNSCodec: TxCodec = Codec;
