import {
  FullSignature,
  SendTx,
  SetNameTx,
  SwapClaimTx,
  SwapCounterTx,
  SwapOfferTx,
  SwapTimeoutTx,
  Transaction,
  TransactionKind,
} from "@iov/types";
import * as codec from "./codec";
import { encodeFullSig, encodeToken } from "./types";
import { hashIdentifier, keyToAddress } from "./util";

export const buildTx = async (
  tx: Transaction,
  sigs: ReadonlyArray<FullSignature>,
): Promise<codec.app.ITx> => {
  const msg = await buildMsg(tx);
  return codec.app.Tx.create({
    ...msg,
    fees: tx.fee ? { fees: encodeToken(tx.fee) } : null,
    signatures: sigs.map(encodeFullSig),
  });
};

export const buildMsg = (tx: Transaction): Promise<codec.app.ITx> => {
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
    dest: tx.recipient,
    amount: encodeToken(tx.amount),
    memo: tx.memo,
  }),
});

const buildSetNameTx = async (tx: SetNameTx): Promise<codec.app.ITx> => ({
  setNameMsg: codec.namecoin.SetWalletNameMsg.create({
    address: await keyToAddress(tx.signer),
    name: tx.name,
  }),
});

const buildSwapOfferTx = async (tx: SwapOfferTx): Promise<codec.app.ITx> => {
  const hashed = { ...tx, hashCode: await hashIdentifier(tx.preimage), kind: TransactionKind.SWAP_COUNTER };
  return buildSwapCounterTx(hashed as SwapCounterTx);
};

const buildSwapCounterTx = async (tx: SwapCounterTx): Promise<codec.app.ITx> => ({
  createEscrowMsg: codec.escrow.CreateEscrowMsg.create({
    sender: await keyToAddress(tx.signer),
    arbiter: tx.hashCode,
    recipient: tx.recipient,
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
