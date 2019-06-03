import BN = require("bn.js");

import {
  Address,
  Amount,
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
  Token,
  TokenTicker,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Encoding, Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  asInt53,
  asIntegerNumber,
  BnsUsernameNft,
  ChainAddressPair,
  CreateMultisignatureTx,
  decodeFullSig,
  ensure,
  Keyed,
  Participant,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  UpdateMultisignatureTx,
} from "./types";
import {
  addressPrefix,
  encodeBnsAddress,
  hashFromIdentifier,
  identityToAddress,
  isHashIdentifier,
} from "./util";

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

export function decodeToken(data: codecImpl.currency.ITokenInfo & Keyed): Token {
  return {
    tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
    tokenName: ensure(data.name),
    fractionalDigits: 9, // fixed for all weave tokens
  };
}

export function decodeAmount(coin: codecImpl.coin.ICoin): Amount {
  const fractionalDigits = 9; // fixed for all tokens in BNS

  const wholeNumber = asIntegerNumber(coin.whole);
  if (wholeNumber < 0) {
    throw new Error("Component `whole` must not be negative");
  }

  const fractionalNumber = asIntegerNumber(coin.fractional);
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

// adds zeros to the right as needed to ensure given length
function rightPadZeros(short: string, length: number): string {
  if (short.length >= length) {
    return short;
  }
  return short + "0".repeat(length - short.length);
}

// we only allow up to 9 decimal places
const humanCoinFormat = new RegExp(/^(\d+)(\.\d{1,9})?\s*([A-Z]{3,4})$/);

export function decodeJsonAmount(json: string): Amount {
  const data = JSON.parse(json);
  if (typeof data === "string") {
    // parse eg. "1.23 IOV"
    const vals = humanCoinFormat.exec(data);
    if (vals === null) {
      throw new Error(`Invalid coin string: ${data}`);
    }
    const [, wholeStr, fracString, ticker] = vals;
    const coin = {
      whole: Int53.fromString(wholeStr).toNumber(),
      fractional: fracString ? Int53.fromString(rightPadZeros(fracString.slice(1), 9)).toNumber() : undefined,
      ticker: ticker as TokenTicker,
    };
    return decodeAmount(coin);
  } else if (typeof data === "object" && data !== null) {
    // parse a json coin representation
    return decodeAmount(data as codecImpl.coin.ICoin);
  }
  throw new Error("Impossible type for amount json");
}

export function decodeParticipants(
  prefix: "iov" | "tiov",
  // tslint:disable-next-line:readonly-array
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[] {
  const participants = ensure(maybeParticipants, "participants");
  participants.forEach((participant, i) => {
    ensure(participant.signature, `participants.$${i}.signature`);
    ensure(participant.power, `participants.$${i}.power`);
  });

  return participants.map(participant => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    power: participant.power!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    address: encodeBnsAddress(prefix, participant.signature!),
  }));
}

function parseAddAddressToUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.IAddChainAddressMsg,
): AddAddressToUsernameTx & WithCreator {
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

function parseSendTransaction(
  base: UnsignedTransaction,
  msg: codecImpl.cash.ISendMsg,
): SendTransaction & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bcp/send",
    sender: identityToAddress(base.creator),
    recipient: encodeBnsAddress(prefix, ensure(msg.dest, "recipient")),
    amount: decodeAmount(ensure(msg.amount)),
    memo: msg.memo || undefined,
  };
}

function parseSwapOfferTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.ICreateEscrowMsg,
): SwapOfferTransaction & WithCreator {
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
    timeout: { timestamp: asIntegerNumber(ensure(msg.timeout)) },
    amounts: (msg.amount || []).map(decodeAmount),
  };
}

function parseSwapClaimTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
  tx: codecImpl.app.ITx,
): SwapClaimTransaction & WithCreator {
  return {
    ...base,
    kind: "bcp/swap_claim",
    swapId: {
      data: ensure(msg.escrowId) as SwapIdBytes,
    },
    preimage: ensure(tx.preimage) as Preimage,
  };
}

function parseSwapAbortTransaction(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
): SwapAbortTransaction & WithCreator {
  return {
    ...base,
    kind: "bcp/swap_abort",
    swapId: {
      data: ensure(msg.escrowId) as SwapIdBytes,
    },
  };
}

function parseRegisterUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.IIssueTokenMsg,
): RegisterUsernameTx & WithCreator {
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
): RemoveAddressFromUsernameTx & WithCreator {
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

function parseCreateMultisignatureTx(
  base: UnsignedTransaction,
  msg: codecImpl.multisig.ICreateContractMsg,
): CreateMultisignatureTx & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bns/create_multisignature_contract",
    participants: decodeParticipants(prefix, msg.participants),
    activationThreshold: ensure(msg.activationThreshold, "activationThreshold"),
    adminThreshold: ensure(msg.adminThreshold, "adminThreshold"),
  };
}

function parseUpdateMultisignatureTx(
  base: UnsignedTransaction,
  msg: codecImpl.multisig.IUpdateContractMsg,
): UpdateMultisignatureTx & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bns/update_multisignature_contract",
    contractId: ensure(msg.contractId, "contractId"),
    participants: decodeParticipants(prefix, msg.participants),
    activationThreshold: ensure(msg.activationThreshold, "activationThreshold"),
    adminThreshold: ensure(msg.adminThreshold, "adminThreshold"),
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
  } else if (tx.createContractMsg) {
    return parseCreateMultisignatureTx(base, tx.createContractMsg);
  } else if (tx.updateContractMsg) {
    return parseUpdateMultisignatureTx(base, tx.updateContractMsg);
  }
  throw new Error("unknown message type in transaction");
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

export function parseTx(tx: codecImpl.app.ITx, chainId: ChainId): SignedTransaction {
  const sigs = ensure(tx.signatures, "signatures").map(decodeFullSig);
  const sig = ensure(sigs[0], "first signature");
  return {
    transaction: parseMsg(parseBaseTx(tx, sig, chainId), tx),
    primarySignature: sig,
    otherSignatures: sigs.slice(1),
  };
}
