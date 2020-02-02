import { Address, Amount, ChainId, Token, TokenTicker } from "@iov/bcp";
import { Encoding, Uint32, Uint64 } from "@iov/encoding";
import BN from "bn.js";

import { weaveFractionalDigits } from "./constants";
import { asIntegerNumber, decodeNumericId, decodeString, ensure } from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  Account,
  AccountConfiguration,
  AccountMsgFee,
  ActionKind,
  BlockchainAddress,
  BnsAccountNft,
  BnsUsernameNft,
  CashConfiguration,
  ChainAddressPair,
  Domain,
  ElectionRule,
  Elector,
  Electorate,
  ElectorProperties,
  Electors,
  Fraction,
  Keyed,
  Participant,
  Proposal,
  ProposalAction,
  ProposalExecutorResult,
  ProposalResult,
  ProposalStatus,
  SendAction,
  TxFeeConfiguration,
  Validators,
  VersionedId,
  Vote,
  VoteOption,
} from "./types";
import { addressPrefix, encodeBnsAddress, IovBech32Prefix } from "./util";

export function decodeToken(data: codecImpl.currency.ITokenInfo & Keyed): Token {
  return {
    tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
    tokenName: ensure(data.name),
    fractionalDigits: weaveFractionalDigits,
  };
}

export function decodeAmount(coin: codecImpl.coin.ICoin): Amount {
  const wholeNumber = asIntegerNumber(coin.whole);
  if (wholeNumber < 0) {
    throw new Error("Component `whole` must not be negative");
  }

  const fractionalNumber = asIntegerNumber(coin.fractional);
  if (fractionalNumber < 0) {
    throw new Error("Component `fractional` must not be negative");
  }

  const quantity = new BN(wholeNumber)
    .imul(new BN(10 ** weaveFractionalDigits))
    .iadd(new BN(fractionalNumber))
    .toString();

  return {
    quantity: quantity,
    fractionalDigits: weaveFractionalDigits,
    tokenTicker: (coin.ticker || "") as TokenTicker,
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

export function decodeTxFeeConfiguration(config: codecImpl.txfee.IConfiguration): TxFeeConfiguration {
  return {
    baseFee: decodeAmount(ensure(config.baseFee, "baseFee")),
    freeBytes: ensure(config.freeBytes, "freeBytes"),
  };
}

// Usernames

export function decodeChainAddressPair(pair: codecImpl.username.IBlockchainAddress): ChainAddressPair {
  return {
    chainId: ensure(pair.blockchainId, "blockchainId") as ChainId,
    address: ensure(pair.address, "address") as Address,
  };
}

export function decodeUsernameNft(
  nft: codecImpl.username.IToken & Keyed,
  registryChainId: ChainId,
): BnsUsernameNft {
  const rawOwnerAddress = ensure(nft.owner, "owner");
  return {
    id: Encoding.fromUtf8(nft._id),
    owner: encodeBnsAddress(addressPrefix(registryChainId), rawOwnerAddress),
    targets: ensure(nft.targets, "targets").map(decodeChainAddressPair),
  };
}

// Accounts
export function decodeAccountConfiguration(
  prefix: IovBech32Prefix,
  patch: codecImpl.account.IConfiguration,
): AccountConfiguration {
  return {
    owner: encodeBnsAddress(prefix, ensure(patch.owner, "owner")),
    validDomain: ensure(patch.validDomain, "validDomain"),
    validName: ensure(patch.validName, "validName"),
    validBlockchainId: ensure(patch.validBlockchainId, "validBlockchainId"),
    validBlockchainAddress: ensure(patch.validBlockchainAddress, "validBlockchainAddress"),
    domainRenew: asIntegerNumber(ensure(patch.domainRenew, "domainRenew")),
  };
}

export function decodeAccountMsgFee(msgFee: codecImpl.account.IAccountMsgFee): AccountMsgFee {
  return {
    msgPath: ensure(msgFee.msgPath, "msgPath"),
    fee: decodeAmount(ensure(msgFee.fee, "fee")),
  };
}

export function decodeBlockchainAddress(
  blockchainAddress: codecImpl.account.IBlockchainAddress,
): BlockchainAddress {
  return {
    blockchainId: ensure(blockchainAddress.blockchainId, "blockchainId"),
    address: ensure(blockchainAddress.address, "address"),
  };
}

export function decodeAccountNft(
  nft: codecImpl.account.IAccount & Keyed,
  registryChainId: ChainId,
): BnsAccountNft {
  const rawOwnerAddress = ensure(nft.owner, "owner");
  return {
    id: Encoding.fromUtf8(nft._id),
    owner: encodeBnsAddress(addressPrefix(registryChainId), rawOwnerAddress),
    targets: ensure(nft.targets, "targets").map(decodeBlockchainAddress),
  };
}

export function decodeAccount(prefix: IovBech32Prefix, account: codecImpl.account.IAccount): Account {
  return {
    domain: ensure(account.domain, "domain"),
    name: ensure(account.name, "name"),
    owner: encodeBnsAddress(prefix, ensure(account.owner, "owner")),
    validUntil: asIntegerNumber(ensure(account.validUntil, "validUntil")),
    targets: ensure(account.targets, "targets").map(decodeBlockchainAddress),
    certificates: ensure(account.certificates, "certificates"),
  };
}

export function decodeDomain(prefix: IovBech32Prefix, domain: codecImpl.account.IDomain): Domain {
  return {
    domain: ensure(domain.domain, "domain"),
    admin: encodeBnsAddress(prefix, ensure(domain.admin, "admin")),
    validUntil: asIntegerNumber(ensure(domain.validUntil, "validUntil")),
    hasSuperuser: ensure(domain.hasSuperuser, "hasSuperuser"),
    msgFees: ensure(domain.msgFees, "msgFees").map(decodeAccountMsgFee),
    accountRenew: asIntegerNumber(ensure(domain.accountRenew, "accountRenew")),
  };
}

// Governance

function decodeVersionedIdArray(versionedId: Uint8Array): VersionedId {
  if (versionedId.length !== 12) throw new Error("Invalid ID length. Expected 12 bytes.");
  return {
    id: Uint64.fromBytesBigEndian(versionedId.slice(0, 8)).toNumber(),
    version: Uint32.fromBigEndianBytes(versionedId.slice(8, 12)).toNumber(),
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

export function decodeFraction(fraction: codecImpl.gov.IFraction): Fraction {
  const numerator = asIntegerNumber(fraction.numerator);
  const denominator = asIntegerNumber(fraction.denominator);
  if (denominator === 0) {
    throw new Error("Denominator must not be 0");
  }
  return { numerator: numerator, denominator: denominator };
}

export function decodeParticipants(
  prefix: IovBech32Prefix,
  // tslint:disable-next-line:readonly-array
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[] {
  const participants = ensure(maybeParticipants, "participants");
  return participants.map((participant, i) => ({
    weight: ensure(participant.weight, `participants.$${i}.weight`),
    address: encodeBnsAddress(prefix, ensure(participant.signature, `participants.$${i}.signature`)),
  }));
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

function decodeVersionedId(versionedId: codecImpl.orm.IVersionedIDRef): VersionedId {
  return {
    id: decodeNumericId(ensure(versionedId.id, "id")),
    version: ensure(versionedId.version, "version"),
  };
}

function decodeElectors(prefix: IovBech32Prefix, electors: readonly codecImpl.gov.IElector[]): Electors {
  const map: Electors = {};
  return electors.reduce((accumulator, elector) => {
    const address = encodeBnsAddress(prefix, ensure(elector.address, "address"));
    return {
      ...accumulator,
      [address]: { weight: ensure(elector.weight, "weight") },
    };
  }, map);
}

function decodeValidators(validators: readonly codecImpl.weave.IValidatorUpdate[]): Validators {
  const initialValidators: Validators = {};
  return validators.reduce((result, validator) => {
    if (!validator.pubKey || !validator.pubKey.data) {
      throw new Error("Validator is missing pubKey data");
    }
    const index = `ed25519_${Encoding.toHex(validator.pubKey.data)}`;
    return {
      ...result,
      [index]: { power: asIntegerNumber(validator.power) },
    };
  }, initialValidators);
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

export function decodeRawProposalOption(prefix: IovBech32Prefix, rawOption: Uint8Array): ProposalAction {
  const option = codecImpl.bnsd.ProposalOptions.decode(rawOption);
  if (option.govCreateTextResolutionMsg) {
    return {
      kind: ActionKind.CreateTextResolution,
      resolution: decodeString(option.govCreateTextResolutionMsg.resolution),
    };
  } else if (option.escrowReleaseMsg) {
    return {
      kind: ActionKind.ReleaseEscrow,
      escrowId: decodeNumericId(ensure(option.escrowReleaseMsg.escrowId, "escrowId")),
      amount: ensure(ensure(option.escrowReleaseMsg.amount, "amount").map(decodeAmount)[0], "amount.0"),
    };
  } else if (option.executeProposalBatchMsg) {
    return {
      kind: ActionKind.ExecuteProposalBatch,
      messages: ensure(option.executeProposalBatchMsg.messages, "messages").map(message => {
        if (!message.sendMsg) {
          throw new Error("Only send actions are currently supported in proposal batch");
        }
        const messageWithoutMemo: SendAction = {
          kind: ActionKind.Send,
          sender: encodeBnsAddress(prefix, ensure(message.sendMsg.source, "source")),
          recipient: encodeBnsAddress(prefix, ensure(message.sendMsg.destination, "destination")),
          amount: decodeAmount(ensure(message.sendMsg.amount, "amount")),
        };

        return message.sendMsg.memo
          ? {
              ...messageWithoutMemo,
              memo: message.sendMsg.memo,
            }
          : messageWithoutMemo;
      }),
    };
  } else if (option.govUpdateElectionRuleMsg) {
    return {
      kind: ActionKind.UpdateElectionRule,
      electionRuleId: decodeNumericId(
        ensure(option.govUpdateElectionRuleMsg.electionRuleId, "electionRuleId"),
      ),
      threshold: option.govUpdateElectionRuleMsg.threshold
        ? decodeFraction(option.govUpdateElectionRuleMsg.threshold)
        : undefined,
      quorum: option.govUpdateElectionRuleMsg.quorum
        ? decodeFraction(option.govUpdateElectionRuleMsg.quorum)
        : undefined,
      votingPeriod: ensure(option.govUpdateElectionRuleMsg.votingPeriod, "votingPeriod"),
    };
  } else if (option.govUpdateElectorateMsg) {
    return {
      kind: ActionKind.UpdateElectorate,
      electorateId: decodeNumericId(ensure(option.govUpdateElectorateMsg.electorateId, "electorateId")),
      diffElectors: decodeElectors(
        prefix,
        ensure(option.govUpdateElectorateMsg.diffElectors, "diffElectors"),
      ),
    };
  } else if (option.validatorsApplyDiffMsg) {
    return {
      kind: ActionKind.SetValidators,
      validatorUpdates: decodeValidators(
        ensure(option.validatorsApplyDiffMsg.validatorUpdates, "validatorUpdates"),
      ),
    };
  } else if (option.msgfeeSetMsgFeeMsg) {
    return {
      kind: ActionKind.SetMsgFee,
      msgPath: ensure(option.msgfeeSetMsgFeeMsg.msgPath, "msgPath"),
      fee: decodeAmount(ensure(option.msgfeeSetMsgFeeMsg.fee, "fee")),
    };
  } else if (option.datamigrationExecuteMigrationMsg) {
    return {
      kind: ActionKind.ExecuteMigration,
      id: ensure(option.datamigrationExecuteMigrationMsg.migrationId, "migrationId"),
    };
  } else {
    throw new Error("Unsupported ProposalOptions");
  }
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

export function decodeVoteOption(option: codecImpl.gov.VoteOption): VoteOption {
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

export function decodeVote(prefix: IovBech32Prefix, vote: codecImpl.gov.IVote & Keyed): Vote {
  const { proposalId } = decodeVoteId(prefix, vote._id);
  return {
    proposalId: proposalId,
    selection: decodeVoteOption(ensure(vote.voted, "voted")),
    elector: decodeElector(prefix, ensure(vote.elector, "elector")),
  };
}
