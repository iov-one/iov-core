import { ChainId } from "@iov/tendermint-types";
import {
  Address,
  BaseTx,
  FullSignature,
  SendTx,
  SetNameTx,
  SignedTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapIdBytes,
  SwapTimeoutTx,
  TransactionKind,
  UnsignedTransaction,
} from "@iov/types";
import * as codec from "./codec";
import { asNumber, decodeFullSig, decodeToken, ensure } from "./types";
import { isHashIdentifier } from "./util";

// export const buildTx = async (
//   tx: Transaction,
//   sigs: ReadonlyArray<FullSignature>,
// ): Promise<codec.app.ITx> => {
//   const msg = await buildMsg(tx);
//   return codec.app.Tx.create({
//     ...msg,
//     fees: tx.fee ? { fees: encodeToken(tx.fee) } : null,
//     signatures: sigs.map(encodeFullSig),
//   });
// };

export const parseTx = (tx: codec.app.ITx, chainId: ChainId): SignedTransaction => {
  const sigs = ensure(tx.signatures, "signatures").map(decodeFullSig);
  const sig = ensure(sigs[0], "first signature");
  return {
    transaction: parseMsg(parseBaseTx(tx, sig, chainId), tx),
    primarySignature: sig,
    otherSignatures: sigs.slice(1),
  };
};
export const parseMsg = (base: BaseTx, tx: codec.app.ITx): UnsignedTransaction => {
  if (tx.sendMsg) {
    return parseSendTx(base, tx.sendMsg);
  } else if (tx.setNameMsg) {
    return parseSetNameTx(base, tx.setNameMsg);
  } else if (tx.createEscrowMsg) {
    return parseSwapCounterTx(base, tx.createEscrowMsg);
  } else if (tx.releaseEscrowMsg) {
    return parseSwapClaimTx(base, tx.releaseEscrowMsg, tx);
  } else if (tx.returnEscrowMsg) {
    return parseSwapTimeoutTx(base, tx.returnEscrowMsg);
  }
  throw new Error("unknown message type in transaction");
};

const parseSendTx = (base: BaseTx, msg: codec.cash.ISendMsg): SendTx => ({
  // TODO: would we want to ensure these match?
  //    src: await keyToAddress(tx.signer),
  kind: TransactionKind.SEND,
  recipient: ensure(msg.dest, "recipient") as Address,
  amount: decodeToken(ensure(msg.amount)),
  memo: msg.memo || undefined,
  ...base,
});

const parseSetNameTx = (base: BaseTx, msg: codec.namecoin.ISetWalletNameMsg): SetNameTx => ({
  kind: TransactionKind.SET_NAME,
  name: ensure(msg.name, "name"),
  ...base,
});

const parseSwapCounterTx = (base: BaseTx, msg: codec.escrow.ICreateEscrowMsg): SwapCounterTx => {
  const hashCode = ensure(msg.arbiter, "arbiter");
  if (!isHashIdentifier(hashCode)) {
    throw new Error("escrow not controlled by hashlock");
  }
  return {
    kind: TransactionKind.SWAP_COUNTER,
    hashCode,
    recipient: ensure(msg.recipient, "recipient") as Address,
    timeout: asNumber(msg.timeout),
    amount: (msg.amount || []).map(decodeToken),
    ...base,
  };
};

const parseSwapClaimTx = (
  base: BaseTx,
  msg: codec.escrow.IReturnEscrowMsg,
  tx: codec.app.ITx,
): SwapClaimTx => ({
  kind: TransactionKind.SWAP_CLAIM,
  swapId: ensure(msg.escrowId) as SwapIdBytes,
  preimage: ensure(tx.preimage),
  ...base,
});

const parseSwapTimeoutTx = (base: BaseTx, msg: codec.escrow.IReturnEscrowMsg): SwapTimeoutTx => ({
  kind: TransactionKind.SWAP_TIMEOUT,
  swapId: ensure(msg.escrowId) as SwapIdBytes,
  ...base,
});

const parseBaseTx = (tx: codec.app.ITx, sig: FullSignature, chainId: ChainId): BaseTx => {
  const base: BaseTx = {
    chainId,
    signer: sig.publicKey,
  };
  if (tx.fees && tx.fees.fees) {
    return { ...base, fee: decodeToken(tx.fees.fees) };
  }
  return base;
};
