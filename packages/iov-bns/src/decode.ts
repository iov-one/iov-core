import BN = require("bn.js");

import {
  Address,
  Amount,
  BcpTicker,
  ChainId,
  FullSignature,
  Nonce,
  SendTransaction,
  SignedTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapTimeoutTransaction,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  asInt53,
  asNumber,
  BnsBlockchainNft,
  BnsUsernameNft,
  ChainAddressPair,
  decodeFullSig,
  ensure,
  Keyed,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
} from "./types";
import { addressPrefix, encodeBnsAddress, hashFromIdentifier, isHashIdentifier } from "./util";

const { fromUtf8 } = Encoding;

export function decodeBlockchainNft(
  nft: codecImpl.blockchain.IBlockchainToken,
  registryChainId: ChainId,
): BnsBlockchainNft {
  const base = ensure(nft.base, "base");
  const id = ensure(base.id, "base.id");
  const rawOwnerAddress = ensure(base.owner, "base.owner");

  const details = ensure(nft.details, "details");

  const chain = ensure(details.chain, "details.chain");
  const chainId = ensure(chain.chainId, "details.chain.chainId");
  const name = ensure(chain.name, "details.chain.name");
  const production = ensure(chain.production, "details.chain.production");
  const enabled = ensure(chain.enabled, "details.chain.enabled");
  const networkId = chain.networkId || undefined;
  const mainTickerId = chain.mainTickerId || undefined;

  const iov = ensure(details.iov, "details.iov");
  const codec = ensure(iov.codec, "details.iov.codec");
  const codecConfig = ensure(iov.codecConfig, "details.iov.codecConfig");

  return {
    id: fromUtf8(id),
    owner: encodeBnsAddress(addressPrefix(registryChainId), rawOwnerAddress),
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

export function decodeUsernameNft(
  nft: codecImpl.username.IUsernameToken,
  registryChainId: ChainId,
): BnsUsernameNft {
  const base = ensure(nft.base, "base");
  const id = ensure(base.id, "base.id");
  const rawOwnerAddress = ensure(base.owner, "base.owner");

  const details = ensure(nft.details, "details");
  const addresses = ensure(details.addresses, "details.addresses");

  return {
    id: fromUtf8(id),
    owner: encodeBnsAddress(addressPrefix(registryChainId), rawOwnerAddress),
    addresses: addresses.map(pair => ({
      chainId: fromUtf8(ensure(pair.blockchainId, "details.addresses[n].chainId")) as ChainId,
      address: ensure(pair.address, "details.addresses[n].address") as Address,
    })),
  };
}

export function decodeNonce(acct: codecImpl.sigs.IUserData & Keyed): Nonce {
  return asInt53(acct.sequence) as Nonce;
}

export function decodeToken(data: codecImpl.currency.ITokenInfo & Keyed): BcpTicker {
  return {
    tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
    tokenName: ensure(data.name),
    fractionalDigits: 9, // fixed for all weave tokens
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
  } else if (tx.createEscrowMsg) {
    return parseSwapOfferTx(base, tx.createEscrowMsg);
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
    kind: "bns/add_address_to_username",
    username: fromUtf8(ensure(msg.usernameId, "usernameId")),
    payload: {
      chainId: fromUtf8(ensure(msg.blockchainId, "blockchainId")) as ChainId,
      address: ensure(msg.address, "address") as Address,
    },
  };
}

function parseSendTransaction(base: UnsignedTransaction, msg: codecImpl.cash.ISendMsg): SendTransaction {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bcp/send",
    recipient: encodeBnsAddress(prefix, ensure(msg.dest, "recipient")),
    amount: decodeAmount(ensure(msg.amount)),
    memo: msg.memo || undefined,
  };
}

function parseSwapOfferTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.ICreateEscrowMsg,
): SwapOfferTransaction {
  const hashIdentifier = ensure(msg.arbiter, "arbiter");
  if (!isHashIdentifier(hashIdentifier)) {
    throw new Error("escrow not controlled by hashlock");
  }
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bcp/swap_offer",
    hash: hashFromIdentifier(hashIdentifier),
    recipient: encodeBnsAddress(prefix, ensure(msg.recipient, "recipient")),
    timeout: asNumber(msg.timeout),
    amounts: (msg.amount || []).map(decodeAmount),
  };
}

function parseSwapClaimTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
  tx: codecImpl.app.ITx,
): SwapClaimTransaction {
  return {
    ...base,
    kind: "bcp/swap_claim",
    swapId: ensure(msg.escrowId) as SwapIdBytes,
    preimage: ensure(tx.preimage),
  };
}

function parseSwapTimeoutTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
): SwapTimeoutTransaction {
  return {
    ...base,
    kind: "bcp/swap_timeout",
    swapId: ensure(msg.escrowId) as SwapIdBytes,
  };
}

function parseBaseTx(tx: codecImpl.app.ITx, sig: FullSignature, chainId: ChainId): UnsignedTransaction {
  const base: UnsignedTransaction = {
    kind: "",
    creator: {
      chainId: chainId,
      pubkey: sig.pubkey,
    },
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
  const chainId = ensure(chain.chainId, "details.chain.chainID");
  const name = ensure(chain.name, "details.chain.name");
  const production = ensure(chain.production, "details.chain.production");
  const enabled = ensure(chain.enabled, "details.chain.enabled");
  const networkId = chain.networkId || undefined;
  const mainTickerId = chain.mainTickerId || undefined;

  const iov = ensure(details.iov, "details.iov");
  const codec = ensure(iov.codec, "details.iov.codec");
  const codecConfig = ensure(iov.codecConfig, "details.iov.codecConfig");
  return {
    ...base,
    kind: "bns/register_blockchain",
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
        chainId: fromUtf8(ensure(chainAddress.blockchainId, "blockchainId")) as ChainId,
        address: ensure(chainAddress.address, "address") as Address,
      };
    },
  );

  return {
    ...base,
    kind: "bns/register_username",
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
    kind: "bns/remove_address_from_username",
    username: fromUtf8(ensure(msg.usernameId, "usernameId")),
    payload: {
      chainId: fromUtf8(ensure(msg.blockchainId, "blockchainId")) as ChainId,
      address: ensure(msg.address, "address") as Address,
    },
  };
}
