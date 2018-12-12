import BN = require("bn.js");

import { ChainId } from "@iov/base-types";
import {
  Address,
  Amount,
  BcpTicker,
  FullSignature,
  Nonce,
  SendTransaction,
  SignedTransaction,
  SwapIdBytes,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  asInt53,
  asNumber,
  BnsAddressBytes,
  BnsBlockchainNft,
  BnsUsernameNft,
  ChainAddressPair,
  decodeFullSig,
  ensure,
  Keyed,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  SetNameTx,
  SwapClaimTx,
  SwapCounterTx,
  SwapTimeoutTx,
} from "./types";
import { encodeBnsAddress, isHashIdentifier } from "./util";

const { fromUtf8 } = Encoding;

export function decodeBlockchainNft(nft: codecImpl.blockchain.IBlockchainToken): BnsBlockchainNft {
  const base = ensure(nft.base, "base");
  const id = ensure(base.id, "base.id");
  const owner = ensure(base.owner, "base.owner");

  const details = ensure(nft.details, "details");

  const chain = ensure(details.chain, "details.chain");
  const chainId = ensure(chain.chainID, "details.chain.chainID");
  const name = ensure(chain.name, "details.chain.name");
  const production = ensure(chain.production, "details.chain.production");
  const enabled = ensure(chain.enabled, "details.chain.enabled");
  const networkId = chain.networkID || undefined;
  const mainTickerId = chain.mainTickerID || undefined;

  const iov = ensure(details.iov, "details.iov");
  const codec = ensure(iov.codec, "details.iov.codec");
  const codecConfig = ensure(iov.codecConfig, "details.iov.codecConfig");

  return {
    id: fromUtf8(id),
    owner: owner as BnsAddressBytes,
    chain: {
      chainId: chainId as ChainId,
      name: name,
      production: production,
      enabled: enabled,
      networkId: networkId,
      mainTickerId:
        mainTickerId && mainTickerId.length > 0 ? (fromUtf8(mainTickerId) as TokenTicker) : undefined,
    },
    codecName: codec,
    codecConfig: codecConfig,
  };
}

export function decodeUsernameNft(nft: codecImpl.username.IUsernameToken): BnsUsernameNft {
  const base = ensure(nft.base, "base");
  const id = ensure(base.id, "base.id");
  const owner = ensure(base.owner, "base.owner");

  const details = ensure(nft.details, "details");
  const addresses = ensure(details.addresses, "details.addresses");

  return {
    id: fromUtf8(id),
    owner: owner as BnsAddressBytes,
    addresses: addresses.map(pair => ({
      chainId: fromUtf8(ensure(pair.chainID, "details.addresses[n].chainID")) as ChainId,
      address: fromUtf8(ensure(pair.address, "details.addresses[n].address")) as Address,
    })),
  };
}

export function decodeNonce(acct: codecImpl.sigs.IUserData & Keyed): Nonce {
  return asInt53(acct.sequence) as Nonce;
}

export function decodeToken(data: codecImpl.namecoin.IToken & Keyed): BcpTicker {
  return {
    tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
    tokenName: ensure(data.name),
  };
}

export function decodeAmount(coin: codecImpl.x.ICoin): Amount {
  const fractionalDigits = 9; // fixed for all tickers in BNS

  const wholeNumber = asNumber(coin.whole);
  if (wholeNumber < 0) {
    throw new Error("Component `whole` must not be negative");
  }

  const fractionalNumber = asNumber(coin.fractional);
  if (fractionalNumber < 0) {
    throw new Error("Component `fractional` must not be negative");
  }

  const quantity = new BN(wholeNumber)
    .imul(new BN(10 ** fractionalDigits))
    .iadd(new BN(fractionalNumber))
    .toString();

  return {
    quantity: quantity,
    fractionalDigits: fractionalDigits,
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

export function parseMsg(base: UnsignedTransaction, tx: codecImpl.app.ITx): UnsignedTransaction {
  if (tx.addUsernameAddressNftMsg) {
    return parseAddAddressToUsernameTx(base, tx.addUsernameAddressNftMsg);
  } else if (tx.sendMsg) {
    return parseSendTransaction(base, tx.sendMsg);
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
  base: UnsignedTransaction,
  msg: codecImpl.username.IAddChainAddressMsg,
): AddAddressToUsernameTx {
  return {
    ...base,
    domain: "bns",
    kind: "add_address_to_username",
    username: fromUtf8(ensure(msg.id, "id")),
    payload: {
      chainId: fromUtf8(ensure(msg.chainID, "chainID")) as ChainId,
      address: fromUtf8(ensure(msg.address, "address")) as Address,
    },
  };
}

function parseSendTransaction(base: UnsignedTransaction, msg: codecImpl.cash.ISendMsg): SendTransaction {
  return {
    // TODO: would we want to ensure these match?
    //    src: await keyToAddress(tx.signer),
    ...base,
    domain: "bcp",
    kind: "send",
    recipient: encodeBnsAddress(ensure(msg.dest, "recipient")),
    amount: decodeAmount(ensure(msg.amount)),
    memo: msg.memo || undefined,
  };
}

function parseSetNameTx(base: UnsignedTransaction, msg: codecImpl.namecoin.ISetWalletNameMsg): SetNameTx {
  return {
    ...base,
    domain: "bns",
    kind: "set_name",
    name: ensure(msg.name, "name"),
  };
}

function parseSwapCounterTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.ICreateEscrowMsg,
): SwapCounterTx {
  const hashCode = ensure(msg.arbiter, "arbiter");
  if (!isHashIdentifier(hashCode)) {
    throw new Error("escrow not controlled by hashlock");
  }
  return {
    ...base,
    domain: "bns",
    kind: "swap_counter",
    hashCode,
    recipient: encodeBnsAddress(ensure(msg.recipient, "recipient")),
    timeout: asNumber(msg.timeout),
    amount: (msg.amount || []).map(decodeAmount),
  };
}

function parseSwapClaimTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
  tx: codecImpl.app.ITx,
): SwapClaimTx {
  return {
    ...base,
    domain: "bns",
    kind: "swap_claim",
    swapId: ensure(msg.escrowId) as SwapIdBytes,
    preimage: ensure(tx.preimage),
  };
}

function parseSwapTimeoutTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
): SwapTimeoutTx {
  return {
    ...base,
    domain: "bns",
    kind: "swap_timeout",
    swapId: ensure(msg.escrowId) as SwapIdBytes,
  };
}

function parseBaseTx(tx: codecImpl.app.ITx, sig: FullSignature, chainId: ChainId): UnsignedTransaction {
  const base: UnsignedTransaction = {
    domain: "",
    kind: "",
    chainId: chainId,
    signer: sig.pubkey,
  };
  if (tx.fees && tx.fees.fees) {
    return { ...base, fee: decodeAmount(tx.fees.fees) };
  }
  return base;
}

function parseRegisterBlockchainTx(
  base: UnsignedTransaction,
  msg: codecImpl.blockchain.IIssueTokenMsg,
): RegisterBlockchainTx {
  const details = ensure(msg.details, "details");

  const chain = ensure(details.chain, "details.chain");
  const chainId = ensure(chain.chainID, "details.chain.chainID");
  const name = ensure(chain.name, "details.chain.name");
  const production = ensure(chain.production, "details.chain.production");
  const enabled = ensure(chain.enabled, "details.chain.enabled");
  const networkId = chain.networkID || undefined;
  const mainTickerId = chain.mainTickerID || undefined;

  const iov = ensure(details.iov, "details.iov");
  const codec = ensure(iov.codec, "details.iov.codec");
  const codecConfig = ensure(iov.codecConfig, "details.iov.codecConfig");
  return {
    ...base,
    domain: "bns",
    kind: "register_blockchain",
    chain: {
      chainId: chainId as ChainId,
      name: name,
      production: production,
      enabled: enabled,
      networkId: networkId,
      mainTickerId:
        mainTickerId && mainTickerId.length > 0 ? (fromUtf8(mainTickerId) as TokenTicker) : undefined,
    },
    codecName: codec,
    codecConfig: codecConfig,
  };
}

function parseRegisterUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.IIssueTokenMsg,
): RegisterUsernameTx {
  const chainAddresses = ensure(ensure(msg.details, "details").addresses, "details.addresses");
  const addresses = chainAddresses.map(
    (chainAddress): ChainAddressPair => {
      return {
        chainId: fromUtf8(ensure(chainAddress.chainID, "chainID")) as ChainId,
        address: fromUtf8(ensure(chainAddress.address, "address")) as Address,
      };
    },
  );

  return {
    ...base,
    domain: "bns",
    kind: "register_username",
    username: Encoding.fromUtf8(ensure(msg.id, "id")),
    addresses: addresses,
  };
}

function parseRemoveAddressFromUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.IRemoveChainAddressMsg,
): RemoveAddressFromUsernameTx {
  return {
    ...base,
    domain: "bns",
    kind: "remove_address_from_username",
    username: fromUtf8(ensure(msg.id, "id")),
    payload: {
      chainId: fromUtf8(ensure(msg.chainID, "chainID")) as ChainId,
      address: fromUtf8(ensure(msg.address, "address")) as Address,
    },
  };
}
