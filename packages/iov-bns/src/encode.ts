import {
  Amount,
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
import { Algorithm, PublicKeyBundle } from "@iov/tendermint-types";

import * as codecImpl from "./codecimpl";
import { encodeFullSig, PrivateKeyBundle } from "./types";
import { decodeBnsAddress, keyToAddress, preimageIdentifier } from "./util";

export function encodePubkey(publicKey: PublicKeyBundle): codecImpl.crypto.IPublicKey {
  switch (publicKey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: publicKey.data };
    default:
      throw new Error("unsupported algorithm: " + publicKey.algo);
  }
}

export function encodePrivkey(privateKey: PrivateKeyBundle): codecImpl.crypto.IPrivateKey {
  switch (privateKey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: privateKey.data };
    default:
      throw new Error("unsupported algorithm: " + privateKey.algo);
  }
}

export function encodeAmount(amount: Amount): codecImpl.x.Coin {
  return codecImpl.x.Coin.create({
    // use null instead of 0 to not encode zero fields
    // for compatibility with golang encoder
    whole: amount.whole || null,
    fractional: amount.fractional || null,
    ticker: amount.tokenTicker,
  });
}

export function buildSignedTx(tx: SignedTransaction): codecImpl.app.ITx {
  const sigs: ReadonlyArray<FullSignature> = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return { ...built, signatures: sigs.map(encodeFullSig) };
}

export function buildUnsignedTx(tx: UnsignedTransaction): codecImpl.app.ITx {
  const msg = buildMsg(tx);
  return codecImpl.app.Tx.create({
    ...msg,
    fees: tx.fee ? { fees: encodeAmount(tx.fee) } : null,
  });
}

export function buildMsg(tx: UnsignedTransaction): codecImpl.app.ITx {
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
}

function buildSendTx(tx: SendTx): codecImpl.app.ITx {
  return {
    sendMsg: codecImpl.cash.SendMsg.create({
      src: decodeBnsAddress(keyToAddress(tx.signer)).data,
      dest: decodeBnsAddress(tx.recipient).data,
      amount: encodeAmount(tx.amount),
      memo: tx.memo,
    }),
  };
}

function buildSetNameTx(tx: SetNameTx): codecImpl.app.ITx {
  return {
    setNameMsg: codecImpl.namecoin.SetWalletNameMsg.create({
      address: decodeBnsAddress(keyToAddress(tx.signer)).data,
      name: tx.name,
    }),
  };
}

function buildSwapOfferTx(tx: SwapOfferTx): codecImpl.app.ITx {
  const hashed = {
    ...tx,
    hashCode: preimageIdentifier(tx.preimage),
    kind: TransactionKind.SwapCounter,
  };
  return buildSwapCounterTx(hashed as SwapCounterTx);
}

function buildSwapCounterTx(tx: SwapCounterTx): codecImpl.app.ITx {
  return {
    createEscrowMsg: codecImpl.escrow.CreateEscrowMsg.create({
      src: decodeBnsAddress(keyToAddress(tx.signer)).data,
      arbiter: tx.hashCode,
      recipient: decodeBnsAddress(tx.recipient).data,
      amount: tx.amount.map(encodeAmount),
      timeout: tx.timeout,
      memo: tx.memo,
    }),
  };
}

function buildSwapClaimTx(tx: SwapClaimTx): codecImpl.app.ITx {
  return {
    releaseEscrowMsg: codecImpl.escrow.ReleaseEscrowMsg.create({
      escrowId: tx.swapId,
    }),
    preimage: tx.preimage,
  };
}

function buildSwapTimeoutTx(tx: SwapTimeoutTx): codecImpl.app.ITx {
  return {
    returnEscrowMsg: codecImpl.escrow.ReturnEscrowMsg.create({
      escrowId: tx.swapId,
    }),
  };
}
