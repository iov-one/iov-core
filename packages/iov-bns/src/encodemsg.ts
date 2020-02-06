import {
  Address,
  isTimestampTimeout,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { encodeAmount, encodeInt, encodeNumericId, encodeString } from "./encodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  BnsdTxMsg,
  ChainAddressPair,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  CreateTermDepositContractTx,
  isBnsTx,
  isCreateTextResolutionAction,
  isExecuteMigrationAction,
  isExecuteProposalBatchAction,
  isReleaseEscrowAction,
  isSendAction,
  isSetMsgFeeAction,
  isSetValidatorsAction,
  isUpdateElectionRuleAction,
  isUpdateElectorateAction,
  Participant,
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
  Validators,
  VoteOption,
  VoteTx,
} from "./types";
import { decodeBnsAddress } from "./util";

const maxMemoLength = 128;

function encodeMemo(data: string | undefined): string | null {
  if (data && Encoding.toUtf8(data).length > maxMemoLength) {
    throw new Error(`Invalid memo length: maximum ${maxMemoLength} bytes`);
  }
  return encodeString(data);
}

function encodeParticipants(
  participants: readonly Participant[],
  // tslint:disable-next-line:readonly-array
): codecImpl.multisig.IParticipant[] {
  return participants.map(
    (participant): codecImpl.multisig.IParticipant => ({
      signature: decodeBnsAddress(participant.address).data,
      weight: participant.weight,
    }),
  );
}

// Token sends

function encodeSendTransaction(tx: SendTransaction): BnsdTxMsg {
  return {
    cashSendMsg: codecImpl.cash.SendMsg.create({
      metadata: { schema: 1 },
      source: decodeBnsAddress(tx.sender).data,
      destination: decodeBnsAddress(tx.recipient).data,
      amount: encodeAmount(tx.amount),
      memo: encodeMemo(tx.memo),
    }),
  };
}

// Atomic swaps

function encodeSwapOfferTx(tx: SwapOfferTransaction): BnsdTxMsg {
  if (!isTimestampTimeout(tx.timeout)) {
    throw new Error("Got unsupported timeout type");
  }

  return {
    aswapCreateMsg: codecImpl.aswap.CreateMsg.create({
      metadata: { schema: 1 },
      source: decodeBnsAddress(tx.sender).data,
      preimageHash: tx.hash,
      destination: decodeBnsAddress(tx.recipient).data,
      amount: tx.amounts.map(encodeAmount),
      timeout: encodeInt(tx.timeout.timestamp),
      memo: encodeMemo(tx.memo),
    }),
  };
}

function encodeSwapClaimTx(tx: SwapClaimTransaction): BnsdTxMsg {
  return {
    aswapReleaseMsg: codecImpl.aswap.ReleaseMsg.create({
      metadata: { schema: 1 },
      swapId: tx.swapId.data,
      preimage: tx.preimage,
    }),
  };
}

function encodeSwapAbortTransaction(tx: SwapAbortTransaction): BnsdTxMsg {
  return {
    aswapReturnMsg: codecImpl.aswap.ReturnMsg.create({
      metadata: { schema: 1 },
      swapId: tx.swapId.data,
    }),
  };
}

// Term Deposit
function encodeTermDepositCustomRate(
  customRate: TermDepositCustomRate,
  // tslint:disable-next-line:readonly-array
): codecImpl.termdeposit.ICustomRate {
  return {
    address: decodeBnsAddress(customRate.address).data,
    rate: customRate.rate,
  };
}

function encodeTermDepositBonus(
  bonus: TermDepositBonus,
  // tslint:disable-next-line:readonly-array
): codecImpl.termdeposit.IDepositBonus {
  return {
    lockinPeriod: bonus.lockinPeriod,
    bonus: bonus.bonus,
  };
}

function encodeTermDepositConfiguration(
  configuration: TermDepositConfiguration,
  // tslint:disable-next-line:readonly-array
): codecImpl.termdeposit.IConfiguration {
  return {
    owner: decodeBnsAddress(configuration.owner).data,
    admin: decodeBnsAddress(configuration.admin).data,
    bonuses: configuration.bonuses.map(encodeTermDepositBonus),
    baseRates: configuration.baseRates.map(encodeTermDepositCustomRate),
  };
}

function encodeUpdateTermDepositConfigurationTx(tx: UpdateTermDepositConfigurationTx): BnsdTxMsg {
  return {
    termdepositUpdateConfigurationMsg: {
      metadata: { schema: 1 },
      patch: encodeTermDepositConfiguration(tx.patch),
    },
  };
}

function encodeCreateTermDepositContractTx(tx: CreateTermDepositContractTx): BnsdTxMsg {
  return {
    termdepositCreateDepositContractMsg: {
      metadata: { schema: 1 },
      validSince: tx.validSince,
      validUntil: tx.validUntil,
    },
  };
}

function encodeTermDepositTx(tx: TermDepositTx): BnsdTxMsg {
  return {
    termdepositDepositMsg: {
      metadata: { schema: 1 },
      depositContractId: tx.depositContractId,
      amount: encodeAmount(tx.amount),
      depositor: decodeBnsAddress(tx.depositor).data,
    },
  };
}

function encodeTermDepositReleaseTx(tx: TermDepositReleaseTx): BnsdTxMsg {
  return {
    termdepositReleaseDepositMsg: {
      metadata: { schema: 1 },
      depositId: tx.depositId,
    },
  };
}

// Usernames

function encodeChainAddressPair(pair: ChainAddressPair): codecImpl.username.IBlockchainAddress {
  return {
    blockchainId: pair.chainId,
    address: pair.address,
  };
}

function encodeRegisterUsernameTx(tx: RegisterUsernameTx): BnsdTxMsg {
  if (!tx.username.endsWith("*iov")) {
    throw new Error(
      "Starting with IOV-Core 0.16, the username property needs to be a full human readable address, including the namespace suffix (e.g. '*iov').",
    );
  }

  return {
    usernameRegisterTokenMsg: {
      metadata: { schema: 1 },
      username: tx.username,
      targets: tx.targets.map(encodeChainAddressPair),
    },
  };
}

function encodeUpdateTargetsOfUsernameTx(tx: UpdateTargetsOfUsernameTx): BnsdTxMsg {
  return {
    usernameChangeTokenTargetsMsg: {
      metadata: { schema: 1 },
      username: tx.username,
      newTargets: tx.targets.map(encodeChainAddressPair),
    },
  };
}

function encodeTransferUsernameTx(tx: TransferUsernameTx): BnsdTxMsg {
  return {
    usernameTransferTokenMsg: {
      metadata: { schema: 1 },
      username: tx.username,
      newOwner: decodeBnsAddress(tx.newOwner).data,
    },
  };
}

// Multisignature contracts

function encodeCreateMultisignatureTx(tx: CreateMultisignatureTx): BnsdTxMsg {
  return {
    multisigCreateMsg: {
      metadata: { schema: 1 },
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}

function encodeUpdateMultisignatureTx(tx: UpdateMultisignatureTx): BnsdTxMsg {
  return {
    multisigUpdateMsg: {
      metadata: { schema: 1 },
      contractId: tx.contractId,
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}

// Escrows

function encodeCreateEscrowTx(tx: CreateEscrowTx): BnsdTxMsg {
  return {
    escrowCreateMsg: {
      metadata: { schema: 1 },
      source: decodeBnsAddress(tx.sender).data,
      arbiter: decodeBnsAddress(tx.arbiter).data,
      destination: decodeBnsAddress(tx.recipient).data,
      amount: tx.amounts.map(encodeAmount),
      timeout: encodeInt(tx.timeout.timestamp),
      memo: encodeMemo(tx.memo),
    },
  };
}

function encodeReleaseEscrowTx(tx: ReleaseEscrowTx): BnsdTxMsg {
  return {
    escrowReleaseMsg: {
      metadata: { schema: 1 },
      escrowId: encodeNumericId(tx.escrowId),
      amount: tx.amounts.map(encodeAmount),
    },
  };
}

function encodeReturnEscrowTx(tx: ReturnEscrowTx): BnsdTxMsg {
  return {
    escrowReturnMsg: {
      metadata: { schema: 1 },
      escrowId: encodeNumericId(tx.escrowId),
    },
  };
}

function encodeUpdateEscrowPartiesTx(tx: UpdateEscrowPartiesTx): BnsdTxMsg {
  const numPartiesToUpdate = [tx.sender, tx.arbiter, tx.recipient].filter(Boolean).length;
  if (numPartiesToUpdate !== 1) {
    throw new Error(`Only one party can be updated at a time, got ${numPartiesToUpdate}`);
  }
  return {
    escrowUpdatePartiesMsg: {
      metadata: { schema: 1 },
      escrowId: encodeNumericId(tx.escrowId),
      source: tx.sender && decodeBnsAddress(tx.sender).data,
      arbiter: tx.arbiter && decodeBnsAddress(tx.arbiter).data,
      destination: tx.recipient && decodeBnsAddress(tx.recipient).data,
    },
  };
}

// Governance

// tslint:disable-next-line: readonly-array
function encodeValidators(validators: Validators): codecImpl.weave.IValidatorUpdate[] {
  return Object.entries(validators).map(([key, { power }]) => {
    const matches = key.match(/^ed25519_([0-9a-fA-F]{64})$/);
    if (!matches) {
      throw new Error("Got validators object key of unexpected format. Must be 'ed25519_<pubkey_hex>'");
    }

    return {
      pubKey: { data: Encoding.fromHex(matches[1]), type: "ed25519" },
      power: power,
    };
  });
}

function encodeCreateProposalTx(tx: CreateProposalTx): BnsdTxMsg {
  const { action } = tx;
  let option: codecImpl.bnsd.IProposalOptions;
  if (isCreateTextResolutionAction(action)) {
    option = {
      govCreateTextResolutionMsg: {
        metadata: { schema: 1 },
        resolution: action.resolution,
      },
    };
  } else if (isExecuteProposalBatchAction(action)) {
    option = {
      executeProposalBatchMsg: {
        messages: action.messages.map(message => {
          if (!isSendAction(message)) {
            throw new Error("Only send actions are currently supported in proposal batch");
          }
          return {
            sendMsg: {
              metadata: { schema: 1 },
              source: decodeBnsAddress(message.sender).data,
              destination: decodeBnsAddress(message.recipient).data,
              amount: encodeAmount(message.amount),
              memo: encodeMemo(message.memo),
            },
          };
        }),
      },
    };
  } else if (isReleaseEscrowAction(action)) {
    option = {
      escrowReleaseMsg: {
        metadata: { schema: 1 },
        escrowId: encodeNumericId(action.escrowId),
        amount: [encodeAmount(action.amount)],
      },
    };
  } else if (isSetValidatorsAction(action)) {
    option = {
      validatorsApplyDiffMsg: {
        metadata: { schema: 1 },
        validatorUpdates: encodeValidators(action.validatorUpdates),
      },
    };
  } else if (isUpdateElectorateAction(action)) {
    option = {
      govUpdateElectorateMsg: {
        metadata: { schema: 1 },
        electorateId: encodeNumericId(action.electorateId),
        diffElectors: Object.entries(action.diffElectors).map(([address, { weight }]) => ({
          address: decodeBnsAddress(address as Address).data,
          weight: weight,
        })),
      },
    };
  } else if (isUpdateElectionRuleAction(action)) {
    option = {
      govUpdateElectionRuleMsg: {
        metadata: { schema: 1 },
        electionRuleId: encodeNumericId(action.electionRuleId),
        threshold: action.threshold,
        quorum: action.quorum,
        votingPeriod: action.votingPeriod,
      },
    };
  } else if (isSetMsgFeeAction(action)) {
    option = {
      msgfeeSetMsgFeeMsg: {
        metadata: { schema: 1 },
        msgPath: action.msgPath,
        fee: encodeAmount(action.fee),
      },
    };
  } else if (isExecuteMigrationAction(action)) {
    if (!action.id) throw new Error("Migration ID must not be empty");
    option = {
      datamigrationExecuteMigrationMsg: {
        metadata: { schema: 1 },
        migrationId: action.id,
      },
    };
  } else {
    throw new Error("Got unsupported type of ProposalOption");
  }

  return {
    govCreateProposalMsg: {
      metadata: { schema: 1 },
      title: tx.title,
      rawOption: codecImpl.bnsd.ProposalOptions.encode(option).finish(),
      description: tx.description,
      electionRuleId: encodeNumericId(tx.electionRuleId),
      startTime: tx.startTime,
      author: decodeBnsAddress(tx.author).data,
    },
  };
}

function encodeVoteOption(option: VoteOption): codecImpl.gov.VoteOption {
  switch (option) {
    case VoteOption.Yes:
      return codecImpl.gov.VoteOption.VOTE_OPTION_YES;
    case VoteOption.No:
      return codecImpl.gov.VoteOption.VOTE_OPTION_NO;
    case VoteOption.Abstain:
      return codecImpl.gov.VoteOption.VOTE_OPTION_ABSTAIN;
  }
}

function encodeVoteTx(tx: VoteTx, strictMode: boolean): BnsdTxMsg {
  if (strictMode) {
    if (!tx.voter) throw new Error("In strict mode VoteTx.voter must be set");
  }
  return {
    govVoteMsg: {
      metadata: { schema: 1 },
      proposalId: encodeNumericId(tx.proposalId),
      selected: encodeVoteOption(tx.selection),
      voter: tx.voter ? decodeBnsAddress(tx.voter).data : undefined,
    },
  };
}

export function encodeMsg(tx: UnsignedTransaction, strictMode = true): BnsdTxMsg {
  if (!isBnsTx(tx)) {
    throw new Error("Transaction is not a BNS transaction");
  }

  switch (tx.kind) {
    // BCP: Token sends
    case "bcp/send":
      return encodeSendTransaction(tx);

    // BCP: Atomic swaps
    case "bcp/swap_offer":
      return encodeSwapOfferTx(tx);
    case "bcp/swap_claim":
      return encodeSwapClaimTx(tx);
    case "bcp/swap_abort":
      return encodeSwapAbortTransaction(tx);
    // BNS: Term Deposit
    case "bns/update_termdeposit_configuration":
      return encodeUpdateTermDepositConfigurationTx(tx);
    case "bns/create_termdeposit_contract":
      return encodeCreateTermDepositContractTx(tx);
    case "bns/termdeposit_deposit":
      return encodeTermDepositTx(tx);
    case "bns/termdeposit_release":
      return encodeTermDepositReleaseTx(tx);

    // BNS: Usernames
    case "bns/register_username":
      return encodeRegisterUsernameTx(tx);
    case "bns/update_targets_of_username":
      return encodeUpdateTargetsOfUsernameTx(tx);
    case "bns/transfer_username":
      return encodeTransferUsernameTx(tx);

    // BNS: Multisignature contracts
    case "bns/create_multisignature_contract":
      return encodeCreateMultisignatureTx(tx);
    case "bns/update_multisignature_contract":
      return encodeUpdateMultisignatureTx(tx);

    // BNS: Escrows
    case "bns/create_escrow":
      return encodeCreateEscrowTx(tx);
    case "bns/release_escrow":
      return encodeReleaseEscrowTx(tx);
    case "bns/return_escrow":
      return encodeReturnEscrowTx(tx);
    case "bns/update_escrow_parties":
      return encodeUpdateEscrowPartiesTx(tx);

    // BNS: Governance
    case "bns/create_proposal":
      return encodeCreateProposalTx(tx);
    case "bns/vote":
      return encodeVoteTx(tx, strictMode);

    default:
      throw new Error("Received transaction of unsupported kind.");
  }
}
