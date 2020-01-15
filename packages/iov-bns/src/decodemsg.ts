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
  decodeParticipants,
  decodeRawProposalOption,
  decodeVoteOption,
} from "./decodeobjects";
import { asIntegerNumber, decodeNumericId, ensure } from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  AddAccountCertificateTx,
  BnsdTxMsg,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  DeleteAccountCertificateTx,
  DeleteAccountTx,
  DeleteAllAccountsTx,
  DeleteDomainTx,
  RegisterAccountTx,
  RegisterDomainTx,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  RenewAccountTx,
  RenewDomainTx,
  ReplaceAccountMsgFeesTx,
  ReplaceAccountTargetsTx,
  ReturnEscrowTx,
  TransferAccountTx,
  TransferDomainTx,
  TransferUsernameTx,
  UpdateAccountConfigurationTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  VoteTx,
} from "./types";
import { addressPrefix, encodeBnsAddress } from "./util";

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

// Accounts

function decodeUpdateAccountConfigurationTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IUpdateConfigurationMsg,
): UpdateAccountConfigurationTx {
  throw new Error("not implemented");
}

function decodeRegisterDomainTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IRegisterDomainMsg,
): RegisterDomainTx {
  throw new Error("not implemented");
}

function decodeTransferDomainTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.ITransferDomainMsg,
): TransferDomainTx {
  throw new Error("not implemented");
}

function decodeRenewDomainTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IRenewDomainMsg,
): RenewDomainTx {
  throw new Error("not implemented");
}

function decodeDeleteDomainTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IDeleteDomainMsg,
): DeleteDomainTx {
  throw new Error("not implemented");
}

function decodeRegisterAccountTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IRegisterAccountMsg,
): RegisterAccountTx {
  throw new Error("not implemented");
}

function decodeTransferAccountTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.ITransferAccountMsg,
): TransferAccountTx {
  throw new Error("not implemented");
}

function decodeReplaceAccountTargetsTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IReplaceAccountTargetsMsg,
): ReplaceAccountTargetsTx {
  throw new Error("not implemented");
}

function decodeDeleteAccountTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IDeleteAccountMsg,
): DeleteAccountTx {
  throw new Error("not implemented");
}

function decodeDeleteAllAccountsTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IFlushDomainMsg,
): DeleteAllAccountsTx {
  throw new Error("not implemented");
}

function decodeRenewAccountTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IRenewAccountMsg,
): RenewAccountTx {
  throw new Error("not implemented");
}

function decodeAddAccountCertificateTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IAddAccountCertificateMsg,
): AddAccountCertificateTx {
  throw new Error("not implemented");
}

function decodeReplaceAccountMsgFeesTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IReplaceAccountMsgFeesMsg,
): ReplaceAccountMsgFeesTx {
  throw new Error("not implemented");
}

function decodeDeleteAccountCertificateTx(
  _base: UnsignedTransaction,
  _msg: codecImpl.account.IDeleteAccountCertificateMsg,
): DeleteAccountCertificateTx {
  throw new Error("not implemented");
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

  // Usernames
  if (tx.usernameRegisterTokenMsg) return decodeRegisterUsernameTx(base, tx.usernameRegisterTokenMsg);
  if (tx.usernameChangeTokenTargetsMsg) {
    return decodeUpdateTargetsOfUsernameTx(base, tx.usernameChangeTokenTargetsMsg);
  }
  if (tx.usernameTransferTokenMsg) return decodeTransferUsernameTx(base, tx.usernameTransferTokenMsg);

  // Accounts
  if (tx.accountUpdateConfigurationMsg) {
    return decodeUpdateAccountConfigurationTx(base, tx.accountUpdateConfigurationMsg);
  }
  if (tx.accountRegisterDomainMsg) return decodeRegisterDomainTx(base, tx.accountRegisterDomainMsg);
  if (tx.accountTransferDomainMsg) return decodeTransferDomainTx(base, tx.accountTransferDomainMsg);
  if (tx.accountRenewDomainMsg) return decodeRenewDomainTx(base, tx.accountRenewDomainMsg);
  if (tx.accountDeleteDomainMsg) return decodeDeleteDomainTx(base, tx.accountDeleteDomainMsg);
  if (tx.accountRegisterAccountMsg) return decodeRegisterAccountTx(base, tx.accountRegisterAccountMsg);
  if (tx.accountTransferAccountMsg) return decodeTransferAccountTx(base, tx.accountTransferAccountMsg);
  if (tx.accountReplaceAccountTargetsMsg) {
    return decodeReplaceAccountTargetsTx(base, tx.accountReplaceAccountTargetsMsg);
  }
  if (tx.accountDeleteAccountMsg) return decodeDeleteAccountTx(base, tx.accountDeleteAccountMsg);
  if (tx.accountFlushDomainMsg) return decodeDeleteAllAccountsTx(base, tx.accountFlushDomainMsg);
  if (tx.accountRenewAccountMsg) return decodeRenewAccountTx(base, tx.accountRenewAccountMsg);
  if (tx.accountAddAccountCertificateMsg) {
    return decodeAddAccountCertificateTx(base, tx.accountAddAccountCertificateMsg);
  }
  if (tx.accountReplaceAccountMsgFeesMsg) {
    return decodeReplaceAccountMsgFeesTx(base, tx.accountReplaceAccountMsgFeesMsg);
  }
  if (tx.accountDeleteAccountCertificateMsg) {
    return decodeDeleteAccountCertificateTx(base, tx.accountDeleteAccountCertificateMsg);
  }

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
