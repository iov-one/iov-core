import BN = require("bn.js");
import * as Long from "long";

import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Hash,
  Nonce,
  Preimage,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
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
import { Encoding } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  BnsUsernameNft,
  CashConfiguration,
  ChainAddressPair,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  ElectorProperties,
  Fraction,
  Keyed,
  Participant,
  PrivkeyBundle,
  PrivkeyBytes,
  Proposal,
  ProposalExecutorResult,
  ProposalOption,
  ProposalResult,
  ProposalStatus,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  RemoveAddressFromUsernameTx,
  ReturnEscrowTx,
  TallyTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  VersionedId,
  VoteOption,
  VoteTx,
} from "./types";
import { addressPrefix, encodeBnsAddress, identityToAddress } from "./util";

const { fromUtf8 } = Encoding;

function decodeString(input: string | null | undefined): string {
  // weave encodes empty strings as null
  return input || "";
}

/**
 * Decodes a protobuf int field (int32/uint32/int64/uint64) into a JavaScript
 * number.
 */
export function asIntegerNumber(maybeLong: Long | number | null | undefined): number {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    if (!Number.isInteger(maybeLong)) {
      throw new Error("Number is not an integer.");
    }
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
}

export function ensure<T>(maybe: T | null | undefined, msg?: string): T {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
}

function decodeVersionedId(versionedId: codecImpl.orm.IVersionedIDRef): VersionedId {
  return {
    id: ensure(versionedId.id, "id"),
    version: ensure(versionedId.version, "version"),
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

export function decodeNonce(sequence: Long | number | null | undefined): Nonce {
  return asIntegerNumber(sequence) as Nonce;
}

export function decodeUserData(userData: codecImpl.sigs.IUserData): { readonly nonce: Nonce } {
  return { nonce: decodeNonce(userData.sequence) };
}

export function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PubkeyBundle {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: publicKey.ed25519 as PubkeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
}

export function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivkeyBundle {
  if (privateKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: privateKey.ed25519 as PrivkeyBytes,
    };
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export function decodeSignature(signature: codecImpl.crypto.ISignature): SignatureBytes {
  if (signature.ed25519) {
    return signature.ed25519 as SignatureBytes;
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export function decodeFullSig(sig: codecImpl.sigs.IStdSignature): FullSignature {
  return {
    nonce: decodeNonce(sig.sequence),
    pubkey: decodePubkey(ensure(sig.pubkey)),
    signature: decodeSignature(ensure(sig.signature)),
  };
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

export function decodeCashConfiguration(config: codecImpl.cash.Configuration): CashConfiguration {
  const minimalFee = decodeAmount(ensure(config.minimalFee, "minimalFee"));
  return {
    minimalFee: minimalFee,
  };
}

export function decodeParticipants(
  prefix: "iov" | "tiov",
  // tslint:disable-next-line:readonly-array
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[] {
  const participants = ensure(maybeParticipants, "participants");
  return participants.map((participant, i) => ({
    weight: ensure(participant.weight, `participants.$${i}.weight`),
    address: encodeBnsAddress(prefix, ensure(participant.signature, `participants.$${i}.signature`)),
  }));
}

export function decodeElectorate(
  prefix: "iov" | "tiov",
  electorate: codecImpl.gov.IElectorate & Keyed,
): Electorate {
  const { id } = decodeVersionedId(codecImpl.orm.VersionedIDRef.decode(electorate._id));

  // tslint:disable-next-line: readonly-keyword
  const electors: { [index: string]: ElectorProperties } = {};
  ensure(electorate.electors).forEach((elector, i) => {
    const address = encodeBnsAddress(prefix, ensure(elector.address, `electors.$${i}.address`));
    // tslint:disable-next-line: no-object-mutation
    electors[address] = {
      weight: ensure(elector.weight, `electors.$${i}.weight`),
    };
  });

  return {
    id: new BN(id).toNumber(),
    version: asIntegerNumber(ensure(electorate.version, "version")),
    admin: encodeBnsAddress(prefix, ensure(electorate.admin, "admin")),
    title: ensure(electorate.title, "title"), // must not be an empty string
    electors: electors,
    totalWeight: asIntegerNumber(electorate.totalElectorateWeight),
  };
}

function decodeFraction(fraction: codecImpl.gov.IFraction): Fraction {
  const numerator = asIntegerNumber(fraction.numerator);
  const denominator = asIntegerNumber(fraction.denominator);
  if (denominator === 0) {
    throw new Error("Denominator must not be 0");
  }
  return { numerator: numerator, denominator: denominator };
}

export function decodeElectionRule(
  prefix: "iov" | "tiov",
  rule: codecImpl.gov.IElectionRule & Keyed,
): ElectionRule {
  const { id } = decodeVersionedId(codecImpl.orm.VersionedIDRef.decode(rule._id));
  const electorateId = new BN(ensure(rule.electorateId, "electorateId"));
  return {
    id: id,
    version: asIntegerNumber(ensure(rule.version, "version")),
    admin: encodeBnsAddress(prefix, ensure(rule.admin, "admin")),
    electorateId: electorateId.toNumber(),
    title: ensure(rule.title, "title"), // must not be an empty string
    votingPeriod: asIntegerNumber(ensure(rule.votingPeriod, "votingPeriod")),
    threshold: decodeFraction(ensure(rule.threshold, "threshold")),
    quorum: rule.quorum ? decodeFraction(rule.quorum) : null,
  };
}

function decodeProposalExecutorResult(result: codecImpl.gov.Proposal.ExecutorResult): ProposalExecutorResult {
  switch (result) {
    case codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_INVALID:
      throw new Error("PROPOSAL_EXECUTOR_RESULT_INVALID is not allowed");
    case codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
      return ProposalExecutorResult.NotRun;
    case codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
      return ProposalExecutorResult.Succeeded;
    case codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
      return ProposalExecutorResult.Failed;
    default:
      throw new Error("Received unknown value for proposal executor result");
  }
}

function decodeProposalResult(result: codecImpl.gov.Proposal.Result): ProposalResult {
  switch (result) {
    case codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_INVALID:
      throw new Error("PROPOSAL_RESULT_INVALID is not allowed");
    case codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED:
      return ProposalResult.Undefined;
    case codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_ACCEPTED:
      return ProposalResult.Accepted;
    case codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_REJECTED:
      return ProposalResult.Rejected;
    default:
      throw new Error("Received unknown value for proposal result");
  }
}

function decodeProposalStatus(status: codecImpl.gov.Proposal.Status): ProposalStatus {
  switch (status) {
    case codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_INVALID:
      throw new Error("PROPOSAL_STATUS_INVALID is not allowed");
    case codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED:
      return ProposalStatus.Submitted;
    case codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_CLOSED:
      return ProposalStatus.Closed;
    case codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_WITHDRAWN:
      return ProposalStatus.Withdrawn;
    default:
      throw new Error("Received unknown value for proposal status");
  }
}

function decodeRawProposalOption(rawOption: Uint8Array): ProposalOption {
  const option = codecImpl.app.ProposalOptions.decode(rawOption);
  // TODO: support other resolution types
  let out: ProposalOption;
  if (option.textResolutionMsg) out = decodeString(option.textResolutionMsg.resolution);
  else throw new Error("Unsupported ProposalOptions");

  return out;
}

export function decodeProposal(prefix: "iov" | "tiov", proposal: codecImpl.gov.IProposal): Proposal {
  return {
    title: ensure(proposal.title, "title"),
    option: decodeRawProposalOption(ensure(proposal.rawOption, "rawOption")),
    description: ensure(proposal.description, "description"),
    electionRule: decodeVersionedId(ensure(proposal.electionRuleRef, "electionRuleRef")),
    electorate: decodeVersionedId(ensure(proposal.electorateRef, "electorateRef")),
    votingStartTime: asIntegerNumber(ensure(proposal.votingStartTime, "votinStartTime")),
    votingEndTime: asIntegerNumber(ensure(proposal.votingEndTime, "votingEndTime")),
    submissionTime: asIntegerNumber(ensure(proposal.submissionTime, "submissionTime")),
    author: encodeBnsAddress(prefix, ensure(proposal.author, "author")),
    status: decodeProposalStatus(ensure(proposal.status, "status")),
    result: decodeProposalResult(ensure(proposal.result, "result")),
    executorResult: decodeProposalExecutorResult(ensure(proposal.executorResult, "executorResult")),
  };
}

// Token sends

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

// Atomic swaps

function parseSwapOfferTx(
  base: UnsignedTransaction,
  msg: codecImpl.aswap.ICreateSwapMsg,
): SwapOfferTransaction & WithCreator {
  const hash = ensure(msg.preimageHash, "preimageHash");
  if (hash.length !== 32) {
    throw new Error("Hash must be 32 bytes (sha256)");
  }
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bcp/swap_offer",
    hash: hash as Hash,
    recipient: encodeBnsAddress(prefix, ensure(msg.recipient, "recipient")),
    timeout: { timestamp: asIntegerNumber(ensure(msg.timeout, "timeout")) },
    amounts: (msg.amount || []).map(decodeAmount),
  };
}

function parseSwapClaimTx(
  base: UnsignedTransaction,
  msg: codecImpl.aswap.IReleaseSwapMsg,
): SwapClaimTransaction & WithCreator {
  return {
    ...base,
    kind: "bcp/swap_claim",
    swapId: {
      data: ensure(msg.swapId) as SwapIdBytes,
    },
    preimage: ensure(msg.preimage) as Preimage,
  };
}

function parseSwapAbortTransaction(
  base: UnsignedTransaction,
  msg: codecImpl.aswap.IReturnSwapMsg,
): SwapAbortTransaction & WithCreator {
  return {
    ...base,
    kind: "bcp/swap_abort",
    swapId: {
      data: ensure(msg.swapId) as SwapIdBytes,
    },
  };
}

// Usernames

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

// Multisignature contracts

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

// Escrows

function parseCreateEscrowTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.ICreateEscrowMsg,
): CreateEscrowTx & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bns/create_escrow",
    sender: encodeBnsAddress(prefix, ensure(msg.src, "src")),
    arbiter: encodeBnsAddress(prefix, ensure(msg.arbiter, "arbiter")),
    recipient: encodeBnsAddress(prefix, ensure(msg.recipient, "recipient")),
    amounts: ensure(msg.amount, "amount").map(decodeAmount),
    timeout: { timestamp: asIntegerNumber(ensure(msg.timeout, "timeout")) },
    memo: msg.memo !== null ? msg.memo : undefined,
  };
}

function parseReleaseEscrowTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReleaseEscrowMsg,
): ReleaseEscrowTx & WithCreator {
  return {
    ...base,
    kind: "bns/release_escrow",
    escrowId: ensure(msg.escrowId, "escrowId"),
    amounts: ensure(msg.amount, "amount").map(decodeAmount),
  };
}

function parseReturnEscrowTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReturnEscrowMsg,
): ReturnEscrowTx & WithCreator {
  return {
    ...base,
    kind: "bns/return_escrow",
    escrowId: ensure(msg.escrowId, "escrowId"),
  };
}

function parseUpdateEscrowPartiesTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IUpdateEscrowPartiesMsg,
): UpdateEscrowPartiesTx & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bns/update_escrow_parties",
    escrowId: ensure(msg.escrowId, "escrowId"),
    sender: msg.sender ? encodeBnsAddress(prefix, msg.sender) : undefined,
    arbiter: msg.arbiter ? encodeBnsAddress(prefix, msg.arbiter) : undefined,
    recipient: msg.recipient ? encodeBnsAddress(prefix, msg.recipient) : undefined,
  };
}

// Governance

function parseCreateProposalTx(
  base: UnsignedTransaction,
  msg: codecImpl.gov.ICreateProposalMsg,
): CreateProposalTx & WithCreator {
  const prefix = addressPrefix(base.creator.chainId);
  return {
    ...base,
    kind: "bns/create_proposal",
    title: ensure(msg.title, "title"),
    option: decodeRawProposalOption(ensure(msg.rawOption, "rawOption")),
    description: ensure(msg.description, "description"),
    electionRuleId: ensure(msg.electionRuleId, "electionRuleId"),
    startTime: asIntegerNumber(ensure(msg.startTime, "startTime")),
    author: encodeBnsAddress(prefix, ensure(msg.author, "author")),
  };
}

function decodeVoteOption(option: codecImpl.gov.VoteOption): VoteOption {
  switch (option) {
    case codecImpl.gov.VoteOption.VOTE_OPTION_INVALID:
      throw new Error("VOTE_OPTION_INVALID is not allowed");
    case codecImpl.gov.VoteOption.VOTE_OPTION_YES:
      return VoteOption.Yes;
    case codecImpl.gov.VoteOption.VOTE_OPTION_NO:
      return VoteOption.No;
    case codecImpl.gov.VoteOption.VOTE_OPTION_ABSTAIN:
      return VoteOption.Abstain;
    default:
      throw new Error("Received unknown value for vote option");
  }
}

function parseVoteTx(base: UnsignedTransaction, msg: codecImpl.gov.IVoteMsg): VoteTx & WithCreator {
  return {
    ...base,
    kind: "bns/vote",
    proposalId: ensure(msg.proposalId, "proposalId"),
    selection: decodeVoteOption(ensure(msg.selected, "selected")),
  };
}

function parseTallyTx(base: UnsignedTransaction, msg: codecImpl.gov.ITallyMsg): TallyTx & WithCreator {
  return {
    ...base,
    kind: "bns/tally",
    proposalId: ensure(msg.proposalId, "proposalId"),
  };
}

export function parseMsg(base: UnsignedTransaction, tx: codecImpl.app.ITx): UnsignedTransaction {
  // Token sends
  if (tx.sendMsg) return parseSendTransaction(base, tx.sendMsg);

  // Atomic swaps
  if (tx.createSwapMsg) return parseSwapOfferTx(base, tx.createSwapMsg);
  if (tx.releaseSwapMsg) return parseSwapClaimTx(base, tx.releaseSwapMsg);
  if (tx.returnSwapMsg) return parseSwapAbortTransaction(base, tx.returnSwapMsg);

  // Usernames
  if (tx.issueUsernameNftMsg) return parseRegisterUsernameTx(base, tx.issueUsernameNftMsg);
  if (tx.addUsernameAddressNftMsg) return parseAddAddressToUsernameTx(base, tx.addUsernameAddressNftMsg);
  if (tx.removeUsernameAddressMsg) return parseRemoveAddressFromUsernameTx(base, tx.removeUsernameAddressMsg);

  // Multisignature contracts
  if (tx.createContractMsg) return parseCreateMultisignatureTx(base, tx.createContractMsg);
  if (tx.updateContractMsg) return parseUpdateMultisignatureTx(base, tx.updateContractMsg);

  // Escrows
  if (tx.createEscrowMsg) return parseCreateEscrowTx(base, tx.createEscrowMsg);
  if (tx.releaseEscrowMsg) return parseReleaseEscrowTx(base, tx.releaseEscrowMsg);
  if (tx.returnEscrowMsg) return parseReturnEscrowTx(base, tx.returnEscrowMsg);
  if (tx.updateEscrowMsg) return parseUpdateEscrowPartiesTx(base, tx.updateEscrowMsg);

  // Governance
  if (tx.createProposalMsg) return parseCreateProposalTx(base, tx.createProposalMsg);
  if (tx.voteMsg) return parseVoteTx(base, tx.voteMsg);
  if (tx.tallyMsg) return parseTallyTx(base, tx.tallyMsg);

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
