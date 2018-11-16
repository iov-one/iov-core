import { ChainId } from "@iov/base-types";
import {
  AddAddressToUsernameTx,
  Address,
  Amount,
  BaseTx,
  BnsBlockchainId,
  ChainAddressPair,
  FullSignature,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
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

const { fromUtf8 } = Encoding;

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
  if (tx.addUsernameAddressNftMsg) {
    return parseAddAddressToUsernameTx(base, tx.addUsernameAddressNftMsg);
  } else if (tx.sendMsg) {
    return parseSendTx(base, tx.sendMsg);
  } else if (tx.setNameMsg) {
    return parseSetNameTx(base, tx.setNameMsg);
  } else if (tx.createEscrowMsg) {
    return parseSwapCounterTx(base, tx.createEscrowMsg);
  } else if (tx.releaseEscrowMsg) {
    return parseSwapClaimTx(base, tx.releaseEscrowMsg, tx);
  } else if (tx.returnEscrowMsg) {
    return parseSwapTimeoutTx(base, tx.returnEscrowMsg);
  } else if (tx.issueBlockchainNftMsg) {
    return parseRegisterBlockchainTx(base, tx.issueBlockchainNftMsg);
  } else if (tx.issueUsernameNftMsg) {
    return parseRegisterUsernameTx(base, tx.issueUsernameNftMsg);
  } else if (tx.removeUsernameAddressMsg) {
    return parseRemoveAddressFromUsernameTx(base, tx.removeUsernameAddressMsg);
  }
  throw new Error("unknown message type in transaction");
}

function parseAddAddressToUsernameTx(
  base: BaseTx,
  msg: codecImpl.username.IAddChainAddressMsg,
): AddAddressToUsernameTx {
  return {
    ...base,
    kind: TransactionKind.AddAddressToUsername,
    username: fromUtf8(ensure(msg.id, "id")),
    payload: {
      blockchainId: ensure(msg.chainID, "chainID") as BnsBlockchainId,
      address: fromUtf8(ensure(msg.address, "address")) as Address,
    },
  };
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

function parseRegisterBlockchainTx(
  base: BaseTx,
  msg: codecImpl.blockchain.IIssueTokenMsg,
): RegisterBlockchainTx {
  const id = ensure(msg.id, "id");
  const details = ensure(msg.details, "details");

  const chain = ensure(details.chain, "details.chain");
  const chainId = ensure(chain.chainID, "details.chain.chainID");
  const networkId = chain.networkID || undefined;
  const name = ensure(chain.name, "details.chain.name");
  const production = ensure(chain.production, "details.chain.production");
  const enabled = ensure(chain.enabled, "details.chain.enabled");
  const mainTickerId = chain.mainTickerID || undefined;

  const iov = ensure(details.iov, "details.iov");
  const codec = ensure(iov.codec, "details.iov.codec");
  const codecConfig = ensure(iov.codecConfig, "details.iov.codecConfig");
  return {
    ...base,
    kind: TransactionKind.RegisterBlockchain,
    blockchainId: id as BnsBlockchainId,
    chain: {
      chainId: chainId as ChainId,
      networkId: networkId,
      name: name,
      production: production,
      enabled: enabled,
      mainTickerId:
        mainTickerId && mainTickerId.length > 0 ? (fromUtf8(mainTickerId) as TokenTicker) : undefined,
    },
    codecName: codec,
    codecConfig: codecConfig,
  };
}

function parseRegisterUsernameTx(base: BaseTx, msg: codecImpl.username.IIssueTokenMsg): RegisterUsernameTx {
  const chainAddresses = ensure(ensure(msg.details, "details").addresses, "details.addresses");
  const addresses = chainAddresses.map(
    (chainAddress): ChainAddressPair => {
      return {
        blockchainId: ensure(chainAddress.chainID, "chainID") as BnsBlockchainId,
        address: Encoding.fromUtf8(ensure(chainAddress.address, "address")) as Address,
      };
    },
  );

  return {
    kind: TransactionKind.RegisterUsername,
    username: Encoding.fromUtf8(ensure(msg.id, "id")),
    addresses: addresses,
    ...base,
  };
}

function parseRemoveAddressFromUsernameTx(
  base: BaseTx,
  msg: codecImpl.username.IRemoveChainAddressMsg,
): RemoveAddressFromUsernameTx {
  return {
    ...base,
    kind: TransactionKind.RemoveAddressFromUsername,
    username: fromUtf8(ensure(msg.id, "id")),
    payload: {
      blockchainId: ensure(msg.chainID, "chainID") as BnsBlockchainId,
      address: fromUtf8(ensure(msg.address, "address")) as Address,
    },
  };
}
