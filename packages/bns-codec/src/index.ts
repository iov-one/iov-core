import {
  FullSignature,
  FungibleToken,
  Nonce,
  PostableBytes,
  SendTx,
  SignableBytes,
  SignableTransaction,
  Transaction,
  TransactionIDBytes,
  // TxCodec,
} from "@iov/types";
import codec from "./codec";
import { encodeFullSig, encodeToken } from "./types";
import { appendSignBytes, keyToAddress, tendermintHash } from "./util";

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
  public static parseBytes(/* bytes: PostableBytes*/): SignableTransaction {
    throw new Error("Not yet implemented");
  }
}

// we need to create a const to properly type-check the export...
// export const BNSCodec: TxCodec = Codec;

async function buildTx(tx: Transaction, sigs: ReadonlyArray<FullSignature>): Promise<codec.app.ITx> {
  switch (tx.kind) {
    case "send":
      return buildSendTx(tx, sigs);
    default:
      throw new Error("tx type not supported: " + tx.kind);
  }
}

// buildSendTx builds
async function buildSendTx(tx: SendTx, sigs: ReadonlyArray<FullSignature>): Promise<codec.app.ITx> {
  const msg = {
    sendMsg: codec.cash.SendMsg.create({
      src: await keyToAddress(tx.signer),
      dest: await keyToAddress(tx.recipient),
      amount: encodeToken(tx.amount),
    }),
  };
  return extendTx(msg, tx.fee, sigs);
}

// extendTx take a tx with the message set and adds
// the fee info and signatures as provided
function extendTx(msg: codec.app.ITx, fee: FungibleToken, sigs: ReadonlyArray<FullSignature>): codec.app.ITx {
  return codec.app.Tx.create({
    ...msg,
    fees: { fees: encodeToken(fee) },
    signatures: sigs.map(encodeFullSig),
  });
}
