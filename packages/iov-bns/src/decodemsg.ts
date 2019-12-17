import {
  Address,
  Hash,
  Preimage,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  UnsignedTransaction,
} from "@iov/bcp";

import {
  asIntegerNumber,
  decodeAmount,
  decodeChainAddressPair,
  decodeNumericId,
  decodeParticipants,
  decodeRawProposalOption,
  ensure,
} from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  BnsdTxMsg,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  Elector,
  Keyed,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  TransferUsernameTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  Vote,
  VoteOption,
  VoteTx,
} from "./types";
import { addressPrefix, encodeBnsAddress, IovBech32Prefix } from "./util";

// Token sends

function parseSendTransaction(base: UnsignedTransaction, msg: codecImpl.cash.ISendMsg): SendTransaction {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bcp/send",
    sender: encodeBnsAddress(prefix, ensure(msg.source, "source")),
    recipient: encodeBnsAddress(prefix, ensure(msg.destination, "destination")),
    amount: decodeAmount(ensure(msg.amount)),
    memo: msg.memo || undefined,
  };
}

// Atomic swaps

function parseSwapOfferTx(base: UnsignedTransaction, msg: codecImpl.aswap.ICreateMsg): SwapOfferTransaction {
  const hash = ensure(msg.preimageHash, "preimageHash");
  if (hash.length !== 32) {
    throw new Error("Hash must be 32 bytes (sha256)");
  }
  const prefix = addressPrefix(base.chainId);
  const parsed = {
    ...base,
    kind: "bcp/swap_offer" as const,
    hash: hash as Hash,
    sender: encodeBnsAddress(prefix, ensure(msg.source, "source")),
    recipient: encodeBnsAddress(prefix, ensure(msg.destination, "destination")),
    timeout: { timestamp: asIntegerNumber(ensure(msg.timeout, "timeout")) },
    amounts: (msg.amount || []).map(decodeAmount),
  };
  return msg.memo ? { ...parsed, memo: msg.memo } : parsed;
}

function parseSwapClaimTx(base: UnsignedTransaction, msg: codecImpl.aswap.IReleaseMsg): SwapClaimTransaction {
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
  msg: codecImpl.aswap.IReturnMsg,
): SwapAbortTransaction {
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
  msg: codecImpl.username.IRegisterTokenMsg,
): RegisterUsernameTx {
  const targets = ensure(msg.targets, "targets").map(decodeChainAddressPair);
  return {
    ...base,
    kind: "bns/register_username",
    username: ensure(msg.username, "username"),
    targets: targets,
  };
}

function parseUpdateTargetsOfUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.IChangeTokenTargetsMsg,
): UpdateTargetsOfUsernameTx {
  const targets = ensure(msg.newTargets, "newTargets").map(decodeChainAddressPair);
  return {
    ...base,
    kind: "bns/update_targets_of_username",
    username: ensure(msg.username, "username"),
    targets: targets,
  };
}

function parseTransferUsernameTx(
  base: UnsignedTransaction,
  msg: codecImpl.username.ITransferTokenMsg,
): TransferUsernameTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/transfer_username",
    username: ensure(msg.username, "username"),
    newOwner: encodeBnsAddress(prefix, ensure(msg.newOwner, "newOwner")),
  };
}

// Multisignature contracts

function parseCreateMultisignatureTx(
  base: UnsignedTransaction,
  msg: codecImpl.multisig.ICreateMsg,
): CreateMultisignatureTx {
  const prefix = addressPrefix(base.chainId);
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
  msg: codecImpl.multisig.IUpdateMsg,
): UpdateMultisignatureTx {
  const prefix = addressPrefix(base.chainId);
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

function parseCreateEscrowTx(base: UnsignedTransaction, msg: codecImpl.escrow.ICreateMsg): CreateEscrowTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/create_escrow",
    sender: encodeBnsAddress(prefix, ensure(msg.source, "source")),
    arbiter: encodeBnsAddress(prefix, ensure(msg.arbiter, "arbiter")),
    recipient: encodeBnsAddress(prefix, ensure(msg.destination, "destination")),
    amounts: ensure(msg.amount, "amount").map(decodeAmount),
    timeout: { timestamp: asIntegerNumber(ensure(msg.timeout, "timeout")) },
    memo: msg.memo !== null ? msg.memo : undefined,
  };
}

function parseReleaseEscrowTx(base: UnsignedTransaction, msg: codecImpl.escrow.IReleaseMsg): ReleaseEscrowTx {
  return {
    ...base,
    kind: "bns/release_escrow",
    escrowId: decodeNumericId(ensure(msg.escrowId, "escrowId")),
    amounts: ensure(msg.amount, "amount").map(decodeAmount),
  };
}

function parseReturnEscrowTx(base: UnsignedTransaction, msg: codecImpl.escrow.IReturnMsg): ReturnEscrowTx {
  return {
    ...base,
    kind: "bns/return_escrow",
    escrowId: decodeNumericId(ensure(msg.escrowId, "escrowId")),
  };
}

function parseUpdateEscrowPartiesTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IUpdatePartiesMsg,
): UpdateEscrowPartiesTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/update_escrow_parties",
    escrowId: decodeNumericId(ensure(msg.escrowId, "escrowId")),
    sender: msg.source ? encodeBnsAddress(prefix, msg.source) : undefined,
    arbiter: msg.arbiter ? encodeBnsAddress(prefix, msg.arbiter) : undefined,
    recipient: msg.destination ? encodeBnsAddress(prefix, msg.destination) : undefined,
  };
}

// Governance

function parseCreateProposalTx(
  base: UnsignedTransaction,
  msg: codecImpl.gov.ICreateProposalMsg,
): CreateProposalTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/create_proposal",
    title: ensure(msg.title, "title"),
    action: decodeRawProposalOption(prefix, ensure(msg.rawOption, "rawOption")),
    description: ensure(msg.description, "description"),
    electionRuleId: decodeNumericId(ensure(msg.electionRuleId, "electionRuleId")),
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

function decodeVoteId(
  prefix: IovBech32Prefix,
  id: Uint8Array,
): { readonly voterAddress: Address; readonly proposalId: number } {
  return {
    voterAddress: encodeBnsAddress(prefix, id.slice(0, 20)),
    proposalId: decodeNumericId(id.slice(20)),
  };
}

function decodeElector(prefix: IovBech32Prefix, elector: codecImpl.gov.IElector): Elector {
  return {
    address: encodeBnsAddress(prefix, ensure(elector.address, "address")),
    weight: ensure(elector.weight, "weight"),
  };
}

export function decodeVote(prefix: IovBech32Prefix, vote: codecImpl.gov.IVote & Keyed): Vote {
  const { proposalId } = decodeVoteId(prefix, vote._id);
  return {
    proposalId: proposalId,
    selection: decodeVoteOption(ensure(vote.voted, "voted")),
    elector: decodeElector(prefix, ensure(vote.elector, "elector")),
  };
}

function parseVoteTx(base: UnsignedTransaction, msg: codecImpl.gov.IVoteMsg): VoteTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/vote",
    proposalId: decodeNumericId(ensure(msg.proposalId, "proposalId")),
    selection: decodeVoteOption(ensure(msg.selected, "selected")),
    voter: msg.voter ? encodeBnsAddress(prefix, msg.voter) : null,
  };
}

export function decodeMsg(base: UnsignedTransaction, tx: BnsdTxMsg): UnsignedTransaction {
  // Token sends
  if (tx.cashSendMsg) return parseSendTransaction(base, tx.cashSendMsg);

  // Atomic swaps
  if (tx.aswapCreateMsg) return parseSwapOfferTx(base, tx.aswapCreateMsg);
  if (tx.aswapReleaseMsg) return parseSwapClaimTx(base, tx.aswapReleaseMsg);
  if (tx.aswapReturnMsg) return parseSwapAbortTransaction(base, tx.aswapReturnMsg);

  // Usernames
  if (tx.usernameRegisterTokenMsg) return parseRegisterUsernameTx(base, tx.usernameRegisterTokenMsg);
  if (tx.usernameChangeTokenTargetsMsg) {
    return parseUpdateTargetsOfUsernameTx(base, tx.usernameChangeTokenTargetsMsg);
  }
  if (tx.usernameTransferTokenMsg) return parseTransferUsernameTx(base, tx.usernameTransferTokenMsg);

  // Multisignature contracts
  if (tx.multisigCreateMsg) return parseCreateMultisignatureTx(base, tx.multisigCreateMsg);
  if (tx.multisigUpdateMsg) return parseUpdateMultisignatureTx(base, tx.multisigUpdateMsg);

  // Escrows
  if (tx.escrowCreateMsg) return parseCreateEscrowTx(base, tx.escrowCreateMsg);
  if (tx.escrowReleaseMsg) return parseReleaseEscrowTx(base, tx.escrowReleaseMsg);
  if (tx.escrowReturnMsg) return parseReturnEscrowTx(base, tx.escrowReturnMsg);
  if (tx.escrowUpdatePartiesMsg) return parseUpdateEscrowPartiesTx(base, tx.escrowUpdatePartiesMsg);

  // Governance
  if (tx.govCreateProposalMsg) return parseCreateProposalTx(base, tx.govCreateProposalMsg);
  if (tx.govVoteMsg) return parseVoteTx(base, tx.govVoteMsg);

  throw new Error("unknown message type in transaction");
}
