import { ChainId } from "@iov/base-types";
import {
  Address,
  Amount,
  BaseTx,
  FullSignature,
  RegisterUsernameTx,
  SendTx,
  SetNameTx,
  SignedTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapIdBytes,
  SwapTimeoutTx,
  TokenTicker,
  TransactionKind,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import { asNumber, decodeFullSig, ensure } from "./types";
import { encodeBnsAddress, isHashIdentifier } from "./util";

export function decodeAmount(coin: codecImpl.x.ICoin): Amount {
  return {
    whole: asNumber(coin.whole),
    fractional: asNumber(coin.fractional),
    tokenTicker: (coin.ticker || "") as TokenTicker,
  };
}

export function parseTx(tx: codecImpl.app.ITx, chainId: ChainId): SignedTransaction {
  const sigs = ensure(tx.signatures, "signatures").map(decodeFullSig);
  const sig = ensure(sigs[0], "first signature");
  return {
    transaction: parseMsg(parseBaseTx(tx, sig, chainId), tx),
    primarySignature: sig,
    otherSignatures: sigs.slice(1),
  };
}

export function parseMsg(base: BaseTx, tx: codecImpl.app.ITx): UnsignedTransaction {
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
  } else if (tx.issueUsernameNftMsg) {
    return parseRegisterUsernameTx(base, tx.issueUsernameNftMsg);
  }
  throw new Error("unknown message type in transaction");
}

function parseSendTx(base: BaseTx, msg: codecImpl.cash.ISendMsg): SendTx {
  return {
    // TODO: would we want to ensure these match?
    //    src: await keyToAddress(tx.signer),
    kind: TransactionKind.Send,
    recipient: encodeBnsAddress(ensure(msg.dest, "recipient")),
    amount: decodeAmount(ensure(msg.amount)),
    memo: msg.memo || undefined,
    ...base,
  };
}

function parseSetNameTx(base: BaseTx, msg: codecImpl.namecoin.ISetWalletNameMsg): SetNameTx {
  return {
    kind: TransactionKind.SetName,
    name: ensure(msg.name, "name"),
    ...base,
  };
}

function parseSwapCounterTx(base: BaseTx, msg: codecImpl.escrow.ICreateEscrowMsg): SwapCounterTx {
  const hashCode = ensure(msg.arbiter, "arbiter");
  if (!isHashIdentifier(hashCode)) {
    throw new Error("escrow not controlled by hashlock");
  }
  return {
    kind: TransactionKind.SwapCounter,
    hashCode,
    recipient: encodeBnsAddress(ensure(msg.recipient, "recipient")),
    timeout: asNumber(msg.timeout),
    amount: (msg.amount || []).map(decodeAmount),
    ...base,
  };
}

function parseSwapClaimTx(
  base: BaseTx,
  msg: codecImpl.escrow.IReturnEscrowMsg,
  tx: codecImpl.app.ITx,
): SwapClaimTx {
  return {
    kind: TransactionKind.SwapClaim,
    swapId: ensure(msg.escrowId) as SwapIdBytes,
    preimage: ensure(tx.preimage),
    ...base,
  };
}

function parseSwapTimeoutTx(base: BaseTx, msg: codecImpl.escrow.IReturnEscrowMsg): SwapTimeoutTx {
  return {
    kind: TransactionKind.SwapTimeout,
    swapId: ensure(msg.escrowId) as SwapIdBytes,
    ...base,
  };
}

function parseBaseTx(tx: codecImpl.app.ITx, sig: FullSignature, chainId: ChainId): BaseTx {
  const base: BaseTx = {
    chainId,
    signer: sig.pubkey,
  };
  if (tx.fees && tx.fees.fees) {
    return { ...base, fee: decodeAmount(tx.fees.fees) };
  }
  return base;
}

function parseRegisterUsernameTx(base: BaseTx, msg: codecImpl.username.IIssueTokenMsg): RegisterUsernameTx {
  const chainAddresses = ensure(ensure(msg.details, "details").addresses, "details.addresses");
  const addressesAsMap = new Map(
    chainAddresses.map(
      (chainAddress): [ChainId, Address] => [
        Encoding.fromUtf8(ensure(chainAddress.chainID, "chainID")) as ChainId,
        Encoding.fromUtf8(ensure(chainAddress.address, "address")) as Address,
      ],
    ),
  );
  if (addressesAsMap.size !== chainAddresses.length) {
    throw new Error(
      "Map does not have the same number of elements as list. Are there duplicate chain ID entries in the transaction?",
    );
  }

  return {
    kind: TransactionKind.RegisterUsername,
    username: Encoding.fromUtf8(ensure(msg.id, "id")),
    addresses: addressesAsMap,
    ...base,
  };
}
