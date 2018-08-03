import {
  FullSignature,
  SendTx,
  SetNameTx,
  SignedTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapOfferTx,
  SwapTimeoutTx,
  TransactionKind,
  UnsignedTransaction,
} from "@iov/bcp-types";

import * as codec from "./codec";
import { encodeFullSig, encodeToken } from "./types";
import { hashIdentifier, keyToAddress } from "./util";

export const buildSignedTx = (tx: SignedTransaction): codec.app.ITx => {
  const sigs: ReadonlyArray<FullSignature> = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return { ...built, signatures: sigs.map(encodeFullSig) };
};

export const buildUnsignedTx = (tx: UnsignedTransaction): codec.app.ITx => {
  const msg = buildMsg(tx);
  return codec.app.Tx.create({
    ...msg,
    fees: tx.fee ? { fees: encodeToken(tx.fee) } : null,
  });
};

export const buildMsg = (tx: UnsignedTransaction): codec.app.ITx => {
  switch (tx.kind) {
    case TransactionKind.Send:
      return buildSendTx(tx);
    case TransactionKind.SetName:
      return buildSetNameTx(tx);
    case TransactionKind.SwapOffer:
      return buildSwapOfferTx(tx);
    case TransactionKind.SwapCounter:
      return buildSwapCounterTx(tx);
    case TransactionKind.SwapClaim:
      return buildSwapClaimTx(tx);
    case TransactionKind.SwapTimeout:
      return buildSwapTimeoutTx(tx);
  }
};

const buildSendTx = (tx: SendTx): codec.app.ITx => ({
  sendMsg: codec.cash.SendMsg.create({
    src: keyToAddress(tx.signer),
    dest: tx.recipient,
    amount: encodeToken(tx.amount),
    memo: tx.memo,
  }),
});

const buildSetNameTx = (tx: SetNameTx): codec.app.ITx => ({
  setNameMsg: codec.namecoin.SetWalletNameMsg.create({
    address: keyToAddress(tx.signer),
    name: tx.name,
  }),
});

const buildSwapOfferTx = (tx: SwapOfferTx): codec.app.ITx => {
  const hashed = {
    ...tx,
    hashCode: hashIdentifier(tx.preimage),
    kind: TransactionKind.SwapCounter,
  };
  return buildSwapCounterTx(hashed as SwapCounterTx);
};

const buildSwapCounterTx = (tx: SwapCounterTx): codec.app.ITx => ({
  createEscrowMsg: codec.escrow.CreateEscrowMsg.create({
    sender: keyToAddress(tx.signer),
    arbiter: tx.hashCode,
    recipient: tx.recipient,
    timeout: tx.timeout,
    amount: tx.amount.map(encodeToken),
  }),
});

const buildSwapClaimTx = (tx: SwapClaimTx): codec.app.ITx => ({
  releaseEscrowMsg: codec.escrow.ReleaseEscrowMsg.create({
    escrowId: tx.swapId,
  }),
  preimage: tx.preimage,
});

const buildSwapTimeoutTx = (tx: SwapTimeoutTx): codec.app.ITx => ({
  returnEscrowMsg: codec.escrow.ReturnEscrowMsg.create({
    escrowId: tx.swapId,
  }),
});
