import {
  FullSignature,
  Nonce,
  PostableBytes,
  SendTx,
  SetNameTx,
  SignableBytes,
  SignableTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapOfferTx,
  SwapTimeoutTx,
  Transaction,
  TransactionIDBytes,
  TransactionKind,
  // TxCodec,
} from "@iov/types";
import * as codec from "./codec";
import { encodeFullSig, encodeToken } from "./types";
import {
  appendSignBytes,
  hashIdentifier,
  hashPreimage,
  keyToAddress,
  keyToIdentifier,
  tendermintHash,
} from "./util";

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

const buildTx = async (tx: Transaction, sigs: ReadonlyArray<FullSignature>): Promise<codec.app.ITx> => {
  const msg = await buildMsg(tx);
  return codec.app.Tx.create({
    ...msg,
    fees: { fees: encodeToken(tx.fee) },
    signatures: sigs.map(encodeFullSig),
  });
};

const buildMsg = (tx: Transaction): Promise<codec.app.ITx> => {
  switch (tx.kind) {
    case TransactionKind.SEND:
      return buildSendTx(tx);
    case TransactionKind.SET_NAME:
      return buildSetNameTx(tx);
    case TransactionKind.SWAP_OFFER:
      return buildSwapOfferTx(tx);
    case TransactionKind.SWAP_COUNTER:
      return buildSwapCounterTx(tx);
    case TransactionKind.SWAP_CLAIM:
      return buildSwapClaimTx(tx);
    case TransactionKind.SWAP_TIMEOUT:
      return buildSwapTimeoutTx(tx);
  }
};

const buildSendTx = async (tx: SendTx): Promise<codec.app.ITx> => ({
  sendMsg: codec.cash.SendMsg.create({
    src: await keyToAddress(tx.signer),
    dest: await keyToAddress(tx.recipient),
    amount: encodeToken(tx.amount),
  }),
});

const buildSetNameTx = async (tx: SetNameTx): Promise<codec.app.ITx> => ({
  setNameMsg: codec.namecoin.SetWalletNameMsg.create({
    address: await keyToAddress(tx.signer),
    name: tx.name,
  }),
});

const buildSwapOfferTx = async (tx: SwapOfferTx): Promise<codec.app.ITx> => {
  const hashed = { ...tx, hash: await hashPreimage(tx.preimage), kind: TransactionKind.SWAP_COUNTER };
  return buildSwapCounterTx(hashed as SwapCounterTx);
};

const buildSwapCounterTx = async (tx: SwapCounterTx): Promise<codec.app.ITx> => ({
  createEscrowMsg: codec.escrow.CreateEscrowMsg.create({
    sender: await keyToIdentifier(tx.signer),
    arbiter: hashIdentifier(tx.hash),
    recipient: await keyToIdentifier(tx.recipient),
    timeout: tx.timeout,
    amount: tx.amount.map(encodeToken),
  }),
});

const buildSwapClaimTx = async (tx: SwapClaimTx): Promise<codec.app.ITx> => ({
  releaseEscrowMsg: codec.escrow.ReleaseEscrowMsg.create({
    escrowId: tx.swapId,
  }),
  preimage: tx.preimage,
});

const buildSwapTimeoutTx = async (tx: SwapTimeoutTx): Promise<codec.app.ITx> => ({
  returnEscrowMsg: codec.escrow.ReturnEscrowMsg.create({
    escrowId: tx.swapId,
  }),
});
