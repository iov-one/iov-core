import { Address, Identity, TokenTicker, WithCreator } from "@iov/bcp";
import {
  ActionKind,
  bnsCodec,
  BnsConnection,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  Proposal,
  VoteOption,
  VoteTx,
} from "@iov/bns";
import { Encoding } from "@iov/encoding";
import BN from "bn.js";

import { ProposalOptions, ProposalType } from "./proposals";
import { groupByCallback, maxWithComparatorCallback } from "./utils";

const { toHex } = Encoding;

export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly identity: Identity;
  readonly guaranteeFundEscrowId?: Uint8Array;
  readonly rewardFundAddress?: Address;
}

export class Governor {
  private readonly connection: BnsConnection;
  private readonly identity: Identity;
  private readonly address: Address;
  private readonly guaranteeFundEscrowId?: Uint8Array;
  private readonly rewardFundAddress?: Address;

  public constructor({ connection, identity, guaranteeFundEscrowId, rewardFundAddress }: GovernorOptions) {
    this.connection = connection;
    this.identity = identity;
    this.address = bnsCodec.identityToAddress(this.identity);
    this.guaranteeFundEscrowId = guaranteeFundEscrowId;
    this.rewardFundAddress = rewardFundAddress;
  }

  public async getElectorates(): Promise<readonly Electorate[]> {
    const electorates = await this.connection.getElectorates();
    return electorates.filter(({ electors }) => Object.keys(electors).some(key => key === this.address));
  }

  public async getElectionRules(electorateId: number): Promise<readonly ElectionRule[]> {
    const electionRules = await this.connection.getElectionRules();
    const filteredRules = electionRules.filter(rule => rule.electorateId === electorateId);

    if (filteredRules.length === 0) {
      throw new Error("No election rule found for electorate");
    }

    const groupedRules = groupByCallback(filteredRules, rule => rule.id);
    return groupedRules.map(group =>
      maxWithComparatorCallback(group.values, (rule1, rule2) => rule1.version - rule2.version),
    );
  }

  public async getProposals(): Promise<readonly Proposal[]> {
    const electorates = await this.getElectorates();
    const proposals = await this.connection.getProposals();
    return proposals.filter(({ electorate }) => {
      const electorateId = new BN(electorate.id).toNumber();
      return electorates.some(({ id }) => id === electorateId);
    });
  }

  public async buildCreateProposalTx(options: ProposalOptions): Promise<CreateProposalTx & WithCreator> {
    const commonProperties = {
      kind: "bns/create_proposal" as const,
      creator: this.identity,
      author: this.address,
      title: options.title,
      description: options.description,
      startTime: Math.floor(options.startTime.valueOf() / 1000),
      electionRuleId: options.electionRuleId,
    };
    switch (options.type) {
      case ProposalType.AddCommitteeMember:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectorate,
            electorateId: options.committee,
            diffElectors: {
              [options.address]: { weight: options.weight },
            },
          },
        });
      case ProposalType.RemoveCommitteeMember:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectorate,
            electorateId: options.committee,
            diffElectors: {
              [options.address]: { weight: 0 },
            },
          },
        });
      case ProposalType.AmendElectionRuleThreshold:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectionRule,
            electionRuleId: options.targetElectionRuleId,
            threshold: options.threshold,
          },
        });
      case ProposalType.AmendElectionRuleQuorum:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectionRule,
            electionRuleId: options.targetElectionRuleId,
            quorum: options.quorum,
          },
        });
      case ProposalType.AddValidator:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.SetValidators,
            validatorUpdates: {
              [`ed25519_${toHex(options.pubkey.data)}`]: { power: options.power },
            },
          },
        });
      case ProposalType.RemoveValidator:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.SetValidators,
            validatorUpdates: {
              [`ed25519_${toHex(options.pubkey.data)}`]: { power: 0 },
            },
          },
        });
      case ProposalType.ReleaseGuaranteeFunds:
        if (!this.guaranteeFundEscrowId) {
          throw new Error("This Governor instance was not initialised with a guaranteeFundEscrowId");
        }
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.ReleaseEscrow,
            escrowId: this.guaranteeFundEscrowId,
            amount: options.amount,
          },
        });
      case ProposalType.DistributeFunds: {
        if (!this.rewardFundAddress) {
          throw new Error("This Governor instance was not initialised with a rewardFundAddress");
        }
        const rewardFundAddress = this.rewardFundAddress;
        const rewardFund = await this.connection.getAccount({ address: rewardFundAddress });
        if (!rewardFund) {
          throw new Error("Could not find guarantee fund account");
        }
        const fundTotal = rewardFund.balance.find(({ tokenTicker }) => tokenTicker === "CASH");
        if (!fundTotal) {
          throw new Error("Guarantee fund has no CASH balance");
        }
        const totalWeight = options.recipients.reduce((total, { weight }) => total + weight, 0);

        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.ExecuteProposalBatch,
            messages: options.recipients.map(({ address, weight }) => ({
              kind: ActionKind.Send,
              sender: rewardFundAddress,
              recipient: address,
              amount: {
                quantity: new BN(fundTotal.quantity)
                  .muln(weight)
                  .divn(totalWeight)
                  .toString(),
                fractionalDigits: 9,
                tokenTicker: "CASH" as TokenTicker,
              },
            })),
          },
        });
      }
      case ProposalType.AmendProtocol:
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.CreateTextResolution,
            resolution: options.text,
          },
        });
      default:
        throw new Error("Proposal type not yet supported");
    }
  }

  public async buildVoteTx(proposalId: number, selection: VoteOption): Promise<VoteTx & WithCreator> {
    return this.connection.withDefaultFee({
      kind: "bns/vote",
      creator: this.identity,
      proposalId: proposalId,
      selection: selection,
    });
  }
}
