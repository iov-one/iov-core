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

import * as codecImpl from "./codecimpl";
import { encodeFullSig, encodeToken } from "./types";
import { decodeBnsAddress, keyToAddress, preimageIdentifier } from "./util";

export const buildSignedTx = (tx: SignedTransaction): codecImpl.app.ITx => {
  const sigs: ReadonlyArray<FullSignature> = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return { ...built, signatures: sigs.map(encodeFullSig) };
};

export const buildUnsignedTx = (tx: UnsignedTransaction): codecImpl.app.ITx => {
  const msg = buildMsg(tx);
  return codecImpl.app.Tx.create({
    ...msg,
    fees: tx.fee ? { fees: encodeToken(tx.fee) } : null,
  });
};

export const buildMsg = (tx: UnsignedTransaction): codecImpl.app.ITx => {
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

const buildSendTx = (tx: SendTx): codecImpl.app.ITx => ({
  sendMsg: codecImpl.cash.SendMsg.create({
    src: decodeBnsAddress(keyToAddress(tx.signer)),
    dest: decodeBnsAddress(tx.recipient),
    amount: encodeToken(tx.amount),
    memo: tx.memo,
  }),
});

const buildSetNameTx = (tx: SetNameTx): codecImpl.app.ITx => ({
  setNameMsg: codecImpl.namecoin.SetWalletNameMsg.create({
    address: decodeBnsAddress(keyToAddress(tx.signer)),
    name: tx.name,
  }),
});

const buildSwapOfferTx = (tx: SwapOfferTx): codecImpl.app.ITx => {
  const hashed = {
    ...tx,
    hashCode: preimageIdentifier(tx.preimage),
    kind: TransactionKind.SwapCounter,
  };
  return buildSwapCounterTx(hashed as SwapCounterTx);
};

const buildSwapCounterTx = (tx: SwapCounterTx): codecImpl.app.ITx => ({
  createEscrowMsg: codecImpl.escrow.CreateEscrowMsg.create({
    sender: decodeBnsAddress(keyToAddress(tx.signer)),
    arbiter: tx.hashCode,
    recipient: decodeBnsAddress(tx.recipient),
    timeout: tx.timeout,
    amount: tx.amount.map(encodeToken),
  }),
});

const buildSwapClaimTx = (tx: SwapClaimTx): codecImpl.app.ITx => ({
  releaseEscrowMsg: codecImpl.escrow.ReleaseEscrowMsg.create({
    escrowId: tx.swapId,
  }),
  preimage: tx.preimage,
});

const buildSwapTimeoutTx = (tx: SwapTimeoutTx): codecImpl.app.ITx => ({
  returnEscrowMsg: codecImpl.escrow.ReturnEscrowMsg.create({
    escrowId: tx.swapId,
  }),
});
