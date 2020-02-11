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
  AccountConfiguration,
  AccountMsgFee,
  AddAccountCertificateTx,
  BlockchainAddress,
  BnsdTxMsg,
  ChainAddressPair,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  DeleteAccountCertificateTx,
  DeleteAccountTx,
  DeleteAllAccountsTx,
  DeleteDomainTx,
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

// Accounts

function encodeAccountConfiguration(configuration: AccountConfiguration): codecImpl.account.IConfiguration {
  return {
    metadata: { schema: 1 },
    owner: decodeBnsAddress(configuration.owner).data,
    validDomain: configuration.validDomain,
    validName: configuration.validName,
    validBlockchainId: configuration.validBlockchainId,
    validBlockchainAddress: configuration.validBlockchainAddress,
    domainRenew: configuration.domainRenew,
  };
}

function encodeUpdateAccountConfigurationTx(tx: UpdateAccountConfigurationTx): BnsdTxMsg {
  return {
    accountUpdateConfigurationMsg: {
      metadata: { schema: 1 },
      patch: encodeAccountConfiguration(tx.configuration),
    },
  };
}

function encodeAccountMsgFee(msgFee: AccountMsgFee): codecImpl.account.IAccountMsgFee {
  return {
    msgPath: msgFee.msgPath,
    fee: encodeAmount(msgFee.fee),
  };
}

function encodeRegisterDomainTx(tx: RegisterDomainTx): BnsdTxMsg {
  return {
    accountRegisterDomainMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      admin: decodeBnsAddress(tx.admin).data,
      hasSuperuser: tx.hasSuperuser,
      thirdPartyToken: tx.broker ? decodeBnsAddress(tx.broker).data : null,
      msgFees: tx.msgFees.map(encodeAccountMsgFee),
      accountRenew: tx.accountRenew,
    },
  };
}

function encodeTransferDomainTx(tx: TransferDomainTx): BnsdTxMsg {
  return {
    accountTransferDomainMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      newAdmin: decodeBnsAddress(tx.newAdmin).data,
    },
  };
}

function encodeRenewDomainTx(tx: RenewDomainTx): BnsdTxMsg {
  return {
    accountRenewDomainMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
    },
  };
}

function encodeDeleteDomainTx(tx: DeleteDomainTx): BnsdTxMsg {
  return {
    accountDeleteDomainMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
    },
  };
}

function encodeBlockchainAddress(blockchainAddress: BlockchainAddress): codecImpl.account.IBlockchainAddress {
  return {
    blockchainId: blockchainAddress.blockchainId,
    address: blockchainAddress.address,
  };
}

function encodeRegisterAccountTx(tx: RegisterAccountTx): BnsdTxMsg {
  return {
    accountRegisterAccountMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
      owner: decodeBnsAddress(tx.owner).data,
      targets: tx.targets.map(encodeBlockchainAddress),
      thirdPartyToken: tx.broker ? decodeBnsAddress(tx.broker).data : null,
    },
  };
}

function encodeTransferAccountTx(tx: TransferAccountTx): BnsdTxMsg {
  return {
    accountTransferAccountMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
      newOwner: decodeBnsAddress(tx.newOwner).data,
    },
  };
}

function encodeReplaceAccountTargetsTx(tx: ReplaceAccountTargetsTx): BnsdTxMsg {
  return {
    accountReplaceAccountTargetsMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
      newTargets: tx.newTargets.map(encodeBlockchainAddress),
    },
  };
}

function encodeDeleteAccountTx(tx: DeleteAccountTx): BnsdTxMsg {
  return {
    accountDeleteAccountMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
    },
  };
}

function encodeDeleteAllAccountsTx(tx: DeleteAllAccountsTx): BnsdTxMsg {
  return {
    accountFlushDomainMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
    },
  };
}

function encodeRenewAccountTx(tx: RenewAccountTx): BnsdTxMsg {
  return {
    accountRenewAccountMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
    },
  };
}

function encodeAddAccountCertificateTx(tx: AddAccountCertificateTx): BnsdTxMsg {
  return {
    accountAddAccountCertificateMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
      certificate: tx.certificate,
    },
  };
}

function encodeReplaceAccountMsgFeesTx(tx: ReplaceAccountMsgFeesTx): BnsdTxMsg {
  return {
    accountReplaceAccountMsgFeesMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      newMsgFees: tx.newMsgFees.map(encodeAccountMsgFee),
    },
  };
}

function encodeDeleteAccountCertificateTx(tx: DeleteAccountCertificateTx): BnsdTxMsg {
  return {
    accountDeleteAccountCertificateMsg: {
      metadata: { schema: 1 },
      domain: tx.domain,
      name: tx.name,
      certificateHash: tx.certificateHash,
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

    // BNS: Usernames
    case "bns/register_username":
      return encodeRegisterUsernameTx(tx);
    case "bns/update_targets_of_username":
      return encodeUpdateTargetsOfUsernameTx(tx);
    case "bns/transfer_username":
      return encodeTransferUsernameTx(tx);

    // BNS: Accounts
    case "bns/update_account_configuration":
      return encodeUpdateAccountConfigurationTx(tx);
    case "bns/register_domain":
      return encodeRegisterDomainTx(tx);
    case "bns/transfer_domain":
      return encodeTransferDomainTx(tx);
    case "bns/renew_domain":
      return encodeRenewDomainTx(tx);
    case "bns/delete_domain":
      return encodeDeleteDomainTx(tx);
    case "bns/register_account":
      return encodeRegisterAccountTx(tx);
    case "bns/transfer_account":
      return encodeTransferAccountTx(tx);
    case "bns/replace_account_targets":
      return encodeReplaceAccountTargetsTx(tx);
    case "bns/delete_account":
      return encodeDeleteAccountTx(tx);
    case "bns/delete_all_accounts":
      return encodeDeleteAllAccountsTx(tx);
    case "bns/renew_account":
      return encodeRenewAccountTx(tx);
    case "bns/add_account_certificate":
      return encodeAddAccountCertificateTx(tx);
    case "bns/replace_account_msg_fees":
      return encodeReplaceAccountMsgFeesTx(tx);
    case "bns/delete_account_certificate":
      return encodeDeleteAccountCertificateTx(tx);

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
