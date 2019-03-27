import BN = require("bn.js");

import {
  Address,
  Amount,
  BcpTicker,
  ChainId,
  FullSignature,
  Nonce,
  Preimage,
  SendTransaction,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  asInt53,
  asNumber,
  BnsUsernameNft,
  ChainAddressPair,
  decodeFullSig,
  ensure,
  Keyed,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
} from "./types";
import { addressPrefix, encodeBnsAddress, hashFromIdentifier, isHashIdentifier } from "./util";

const { fromUtf8 } = Encoding;

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
  return asInt53(acct.sequence).toNumber() as Nonce;
}

export function decodeToken(data: codecImpl.currency.ITokenInfo & Keyed): BcpTicker {
  return {
    tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
    tokenName: ensure(data.name),
    fractionalDigits: 9, // fixed for all weave tokens
  };
}

export function decodeAmount(coin: codecImpl.coin.ICoin): Amount {
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
    return parseSwapAbortTransaction(base, tx.returnEscrowMsg);
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
    timeout: { timestamp: asNumber(ensure(msg.timeout).seconds) },
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
    preimage: ensure(tx.preimage) as Preimage,
  };
}

function parseSwapAbortTransaction(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
): SwapAbortTransaction {
  return {
    ...base,
    kind: "bcp/swap_abort",
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
    return { ...base, fee: { tokens: decodeAmount(tx.fees.fees) } };
  }
  return base;
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

const humanCoinFormat = new RegExp(/^(\d+)(\.\d+)?\s*([A-Z]{3,4})$/);

// adds zeros to the right as needed to ensure given length
function rightPadZeros(short: string, length: number): string {
  if (short.length >= length) {
    return short;
  }
  return short + "0".repeat(length - short.length);
}

export function decodeJsonAmount(json: string): Amount {
  const data = JSON.parse(json);
  if (typeof data === "string") {
    // parse "1.23 IOV", ".001CASH", "12   FOO"
    const vals = humanCoinFormat.exec(data);
    if (vals === null) {
      throw new Error(`Invalid coin string: ${data}`);
    }
    const [, wholeStr, fracString, ticker] = vals;
    const coin = {
      whole: wholeStr ? Int53.fromString(wholeStr).toNumber() : undefined,
      fractional: fracString ? Int53.fromString(rightPadZeros(fracString.slice(1), 9)).toNumber() : undefined,
      ticker: ticker as TokenTicker,
    };
    return decodeAmount(coin);
  } else if (typeof data === "object" && data !== null) {
    return decodeAmount(data as codecImpl.coin.ICoin);
  }
  throw new Error("Impossible type for amount json");
}
