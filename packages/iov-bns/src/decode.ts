import {
  Algorithm,
  ChainId,
  FullSignature,
  newNonEmptyArray,
  Nonce,
  PubkeyBundle,
  PubkeyBytes,
  SignatureBytes,
  SignedTransaction,
  Token,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Uint32, Uint64 } from "@iov/encoding";
import * as Long from "long";

import { decodeMsg } from "./decodemsg";
import {
  asIntegerNumber,
  decodeAmount,
  decodeChainAddressPair,
  decodeFraction,
  decodeNumericId,
  decodeRawProposalOption,
  ensure,
} from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  BnsUsernameNft,
  CashConfiguration,
  ElectionRule,
  Electorate,
  ElectorProperties,
  Keyed,
  MultisignatureTx,
  PrivkeyBundle,
  PrivkeyBytes,
  Proposal,
  ProposalExecutorResult,
  ProposalResult,
  ProposalStatus,
  VersionedId,
} from "./types";
import { addressPrefix, encodeBnsAddress, IovBech32Prefix } from "./util";

const { fromUtf8 } = Encoding;

function decodeVersionedId(versionedId: codecImpl.orm.IVersionedIDRef): VersionedId {
  return {
    id: decodeNumericId(ensure(versionedId.id, "id")),
    version: ensure(versionedId.version, "version"),
  };
}

function decodeVersionedIdArray(versionedId: Uint8Array): VersionedId {
  if (versionedId.length !== 12) throw new Error("Invalid ID length. Expected 12 bytes.");
  return {
    id: Uint64.fromBytesBigEndian(versionedId.slice(0, 8)).toNumber(),
    version: Uint32.fromBigEndianBytes(versionedId.slice(8, 12)).toNumber(),
  };
}

export function decodeUsernameNft(
  nft: codecImpl.username.IToken & Keyed,
  registryChainId: ChainId,
): BnsUsernameNft {
  const rawOwnerAddress = ensure(nft.owner, "owner");
  return {
    id: fromUtf8(nft._id),
    owner: encodeBnsAddress(addressPrefix(registryChainId), rawOwnerAddress),
    targets: ensure(nft.targets, "targets").map(decodeChainAddressPair),
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

function isZeroCoin({ whole, fractional }: codecImpl.coin.ICoin): boolean {
  return asIntegerNumber(whole) === 0 && asIntegerNumber(fractional) === 0;
}

export function decodeCashConfiguration(config: codecImpl.cash.IConfiguration): CashConfiguration {
  const minimalFee = ensure(config.minimalFee, "minimalFee");
  return {
    minimalFee: isZeroCoin(minimalFee) ? null : decodeAmount(minimalFee),
  };
}

export function decodeElectorate(
  prefix: IovBech32Prefix,
  electorate: codecImpl.gov.IElectorate & Keyed,
): Electorate {
  const { id } = decodeVersionedIdArray(electorate._id);

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
    id: id,
    version: asIntegerNumber(ensure(electorate.version, "version")),
    admin: encodeBnsAddress(prefix, ensure(electorate.admin, "admin")),
    title: ensure(electorate.title, "title"), // must not be an empty string
    electors: electors,
    totalWeight: asIntegerNumber(electorate.totalElectorateWeight),
  };
}

export function decodeElectionRule(
  prefix: IovBech32Prefix,
  rule: codecImpl.gov.IElectionRule & Keyed,
): ElectionRule {
  const { id } = decodeVersionedIdArray(rule._id);
  return {
    id: id,
    version: asIntegerNumber(ensure(rule.version, "version")),
    admin: encodeBnsAddress(prefix, ensure(rule.admin, "admin")),
    electorateId: decodeNumericId(ensure(rule.electorateId, "electorateId")),
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

export function decodeProposal(prefix: IovBech32Prefix, proposal: codecImpl.gov.IProposal & Keyed): Proposal {
  const voteState = ensure(proposal.voteState, "voteState");
  return {
    id: decodeNumericId(proposal._id),
    title: ensure(proposal.title, "title"),
    action: decodeRawProposalOption(prefix, ensure(proposal.rawOption, "rawOption")),
    description: ensure(proposal.description, "description"),
    electionRule: decodeVersionedId(ensure(proposal.electionRuleRef, "electionRuleRef")),
    electorate: decodeVersionedId(ensure(proposal.electorateRef, "electorateRef")),
    votingStartTime: asIntegerNumber(ensure(proposal.votingStartTime, "votingStartTime")),
    votingEndTime: asIntegerNumber(ensure(proposal.votingEndTime, "votingEndTime")),
    submissionTime: asIntegerNumber(ensure(proposal.submissionTime, "submissionTime")),
    author: encodeBnsAddress(prefix, ensure(proposal.author, "author")),
    state: {
      totalYes: asIntegerNumber(voteState.totalYes),
      totalNo: asIntegerNumber(voteState.totalNo),
      totalAbstain: asIntegerNumber(voteState.totalAbstain),
      totalElectorateWeight: asIntegerNumber(voteState.totalElectorateWeight),
    },
    status: decodeProposalStatus(ensure(proposal.status, "status")),
    result: decodeProposalResult(ensure(proposal.result, "result")),
    executorResult: decodeProposalExecutorResult(ensure(proposal.executorResult, "executorResult")),
  };
}

function parseBaseTx(tx: codecImpl.bnsd.ITx, chainId: ChainId): UnsignedTransaction {
  let base: UnsignedTransaction | (UnsignedTransaction & MultisignatureTx) = {
    kind: "",
    chainId: chainId,
  };
  if (tx.fees?.fees) {
    const prefix = addressPrefix(base.chainId);
    const payer = tx.fees.payer ? encodeBnsAddress(prefix, tx.fees.payer) : undefined;
    base = { ...base, fee: { tokens: decodeAmount(tx.fees.fees), payer: payer } };
  }
  if (tx.multisig?.length) {
    base = { ...base, multisig: tx.multisig.map(decodeNumericId) };
  }
  return base;
}

export function parseTx(tx: codecImpl.bnsd.ITx, chainId: ChainId): SignedTransaction {
  const signatures = ensure(tx.signatures, "signatures").map(decodeFullSig);
  let signaturesNonEmpty;
  try {
    signaturesNonEmpty = newNonEmptyArray(signatures);
  } catch (error) {
    throw new Error("Transaction has no signatures");
  }
  return {
    transaction: decodeMsg(parseBaseTx(tx, chainId), tx),
    signatures: signaturesNonEmpty,
  };
}
