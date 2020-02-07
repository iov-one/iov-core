import {
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
  decodeAmount,
  decodeChainAddressPair,
  decodeFraction,
  decodeParticipants,
  decodeRawProposalOption,
  decodeVoteOption,
} from "./decodeobjects";
import { asIntegerNumber, decodeNumericId, ensure } from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  BnsdTxMsg,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  CreateTermDepositContractTx,
  DepositContractIdBytes,
  DepositIdBytes,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  TermDepositBonus,
  TermDepositConfiguration,
  TermDepositCustomRate,
  TermDepositReleaseTx,
  TermDepositTx,
  TransferUsernameTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  UpdateTermDepositConfigurationTx,
  VoteTx,
} from "./types";
import { addressPrefix, encodeBnsAddress, IovBech32Prefix } from "./util";

// Token sends

function decodeSendTransaction(base: UnsignedTransaction, msg: codecImpl.cash.ISendMsg): SendTransaction {
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

function decodeSwapOfferTx(base: UnsignedTransaction, msg: codecImpl.aswap.ICreateMsg): SwapOfferTransaction {
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

function decodeSwapClaimTx(
  base: UnsignedTransaction,
  msg: codecImpl.aswap.IReleaseMsg,
): SwapClaimTransaction {
  return {
    ...base,
    kind: "bcp/swap_claim",
    swapId: {
      data: ensure(msg.swapId) as SwapIdBytes,
    },
    preimage: ensure(msg.preimage) as Preimage,
  };
}

function decodeSwapAbortTransaction(
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

// Term Deposits
function decodeTermDepositCustomRate(
  prefix: IovBech32Prefix,
  customRate: codecImpl.termdeposit.ICustomRate,
): TermDepositCustomRate {
  return {
    address: encodeBnsAddress(prefix, ensure(customRate.address, "address")),
    rate: decodeFraction(ensure(customRate.rate, "rate")),
  };
}

function decodeTermDepositBonus(bonus: codecImpl.termdeposit.IDepositBonus): TermDepositBonus {
  return {
    lockinPeriod: ensure(bonus.lockinPeriod, "lockinPeriod"),
    bonus: decodeFraction(ensure(bonus.bonus, "bonus")),
  };
}

function decodeTermDepositConfiguration(
  prefix: IovBech32Prefix,
  patch: codecImpl.termdeposit.IConfiguration,
): TermDepositConfiguration {
  return {
    owner: encodeBnsAddress(prefix, ensure(patch.owner, "owner")),
    admin: encodeBnsAddress(prefix, ensure(patch.admin, "admin")),
    bonuses: ensure(patch.bonuses, "bonuses").map(decodeTermDepositBonus),
    baseRates: ensure(patch.baseRates, "baseRates").map(baseRate =>
      decodeTermDepositCustomRate(prefix, baseRate),
    ),
  };
}

function decodeUpdateTermDepositConfigurationTx(
  base: UnsignedTransaction,
  msg: codecImpl.termdeposit.IUpdateConfigurationMsg,
): UpdateTermDepositConfigurationTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/update_termdeposit_configuration",
    patch: decodeTermDepositConfiguration(prefix, ensure(msg.patch, "patch")),
  };
}

function decodeCreateTermDepositContractTx(
  base: UnsignedTransaction,
  msg: codecImpl.termdeposit.ICreateDepositContractMsg,
): CreateTermDepositContractTx {
  return {
    ...base,
    kind: "bns/create_termdeposit_contract",
    validSince: ensure(msg.validSince, "validSince"),
    validUntil: ensure(msg.validSince, "validUntil"),
  };
}

function decodeTermDepositTx(
  base: UnsignedTransaction,
  msg: codecImpl.termdeposit.IDepositMsg,
): TermDepositTx {
  const prefix = addressPrefix(base.chainId);
  return {
    ...base,
    kind: "bns/termdeposit_deposit",
    depositContractId: ensure(msg.depositContractId, "depositContractId") as DepositContractIdBytes,
    amount: decodeAmount(ensure(msg.amount, "amount")),
    depositor: encodeBnsAddress(prefix, ensure(msg.depositor, "address")),
  };
}

function decodeTermDepositReleaseTx(
  base: UnsignedTransaction,
  msg: codecImpl.termdeposit.IReleaseDepositMsg,
): TermDepositReleaseTx {
  return {
    ...base,
    kind: "bns/termdeposit_release",
    depositId: ensure(msg.depositId, "depositId") as DepositIdBytes,
  };
}

// Usernames

function decodeRegisterUsernameTx(
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

function decodeUpdateTargetsOfUsernameTx(
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

function decodeTransferUsernameTx(
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

function decodeCreateMultisignatureTx(
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

function decodeUpdateMultisignatureTx(
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

function decodeCreateEscrowTx(base: UnsignedTransaction, msg: codecImpl.escrow.ICreateMsg): CreateEscrowTx {
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

function decodeReleaseEscrowTx(
  base: UnsignedTransaction,
  msg: codecImpl.escrow.IReleaseMsg,
): ReleaseEscrowTx {
  return {
    ...base,
    kind: "bns/release_escrow",
    escrowId: decodeNumericId(ensure(msg.escrowId, "escrowId")),
    amounts: ensure(msg.amount, "amount").map(decodeAmount),
  };
}

function decodeReturnEscrowTx(base: UnsignedTransaction, msg: codecImpl.escrow.IReturnMsg): ReturnEscrowTx {
  return {
    ...base,
    kind: "bns/return_escrow",
    escrowId: decodeNumericId(ensure(msg.escrowId, "escrowId")),
  };
}

function decodeUpdateEscrowPartiesTx(
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

function decodeCreateProposalTx(
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

function decodeVoteTx(base: UnsignedTransaction, msg: codecImpl.gov.IVoteMsg): VoteTx {
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
  if (tx.cashSendMsg) return decodeSendTransaction(base, tx.cashSendMsg);

  // Atomic swaps
  if (tx.aswapCreateMsg) return decodeSwapOfferTx(base, tx.aswapCreateMsg);
  if (tx.aswapReleaseMsg) return decodeSwapClaimTx(base, tx.aswapReleaseMsg);
  if (tx.aswapReturnMsg) return decodeSwapAbortTransaction(base, tx.aswapReturnMsg);

  // Term Deposits
  if (tx.termdepositUpdateConfigurationMsg) {
    return decodeUpdateTermDepositConfigurationTx(base, tx.termdepositUpdateConfigurationMsg);
  }
  if (tx.termdepositCreateDepositContractMsg) {
    return decodeCreateTermDepositContractTx(base, tx.termdepositCreateDepositContractMsg);
  }
  if (tx.termdepositDepositMsg) {
    return decodeTermDepositTx(base, tx.termdepositDepositMsg);
  }
  if (tx.termdepositReleaseDepositMsg) {
    return decodeTermDepositReleaseTx(base, tx.termdepositReleaseDepositMsg);
  }

  // Usernames
  if (tx.usernameRegisterTokenMsg) return decodeRegisterUsernameTx(base, tx.usernameRegisterTokenMsg);
  if (tx.usernameChangeTokenTargetsMsg) {
    return decodeUpdateTargetsOfUsernameTx(base, tx.usernameChangeTokenTargetsMsg);
  }
  if (tx.usernameTransferTokenMsg) return decodeTransferUsernameTx(base, tx.usernameTransferTokenMsg);

  // Multisignature contracts
  if (tx.multisigCreateMsg) return decodeCreateMultisignatureTx(base, tx.multisigCreateMsg);
  if (tx.multisigUpdateMsg) return decodeUpdateMultisignatureTx(base, tx.multisigUpdateMsg);

  // Escrows
  if (tx.escrowCreateMsg) return decodeCreateEscrowTx(base, tx.escrowCreateMsg);
  if (tx.escrowReleaseMsg) return decodeReleaseEscrowTx(base, tx.escrowReleaseMsg);
  if (tx.escrowReturnMsg) return decodeReturnEscrowTx(base, tx.escrowReturnMsg);
  if (tx.escrowUpdatePartiesMsg) return decodeUpdateEscrowPartiesTx(base, tx.escrowUpdatePartiesMsg);

  // Governance
  if (tx.govCreateProposalMsg) return decodeCreateProposalTx(base, tx.govCreateProposalMsg);
  if (tx.govVoteMsg) return decodeVoteTx(base, tx.govVoteMsg);

  throw new Error("unknown message type in transaction");
}
