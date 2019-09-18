import { Address, Identity, WithCreator } from "@iov/bcp";
import {
  ActionKind,
  bnsCodec,
  BnsConnection,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  Proposal,
  Vote,
  VoteOption,
  VoteTx,
} from "@iov/bns";
import { Encoding } from "@iov/encoding";
import BN from "bn.js";

import { ProposalOptions, ProposalType } from "./proposals";
import { groupByCallback, maxWithComparatorCallback } from "./utils";

const { toHex } = Encoding;

function compareByVersion<E extends { readonly version: number }>(element1: E, element2: E): number {
  return element1.version - element2.version;
}

export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly identity: Identity;
  readonly guaranteeFundEscrowId?: Uint8Array;
  readonly rewardFundAddress?: Address;
  readonly treasuryAddress?: Address;
}

export class Governor {
  public readonly address: Address;

  private readonly connection: BnsConnection;
  private readonly identity: Identity;
  private readonly guaranteeFundEscrowId?: Uint8Array;
  private readonly rewardFundAddress?: Address;
  private readonly treasuryAddress?: Address;

  public constructor({
    connection,
    identity,
    guaranteeFundEscrowId,
    rewardFundAddress,
    treasuryAddress,
  }: GovernorOptions) {
    this.connection = connection;
    this.identity = identity;
    this.address = bnsCodec.identityToAddress(this.identity);
    this.guaranteeFundEscrowId = guaranteeFundEscrowId;
    this.rewardFundAddress = rewardFundAddress;
    this.treasuryAddress = treasuryAddress;
  }

  /**
   * Returns a list of electorates that contain the current governor as one of the electors
   *
   * @param skipFiltering if set to true, the list is not filtered by electors anymore
   */
  public async getElectorates(skipFiltering: boolean = false): Promise<readonly Electorate[]> {
    const filterFunction = skipFiltering
      ? () => true
      : ({ electors }: Electorate) => Object.keys(electors).some(key => key === this.address);

    const all = await this.connection.getElectorates();
    const filtered = all.filter(filterFunction);
    const groupedById = groupByCallback(filtered, rule => rule.id);
    const maxVersion = groupedById.map(group => maxWithComparatorCallback(group.values, compareByVersion));
    return maxVersion;
  }

  public async getElectionRules(electorateId: number): Promise<readonly ElectionRule[]> {
    const electionRules = await this.connection.getElectionRules();
    const filteredRules = electionRules.filter(rule => rule.electorateId === electorateId);
    const groupedRules = groupByCallback(filteredRules, rule => rule.id);
    return groupedRules.map(group => maxWithComparatorCallback(group.values, compareByVersion));
  }

  public async getElectionRuleById(electionRuleId: number): Promise<ElectionRule> {
    const electionRules = (await this.connection.getElectionRules()).filter(
      ({ id }) => id === electionRuleId,
    );
    if (!electionRules.length) {
      throw new Error("Election rule not found");
    }
    const electionRule = maxWithComparatorCallback(electionRules, compareByVersion);
    return electionRule;
  }

  public async getProposals(): Promise<readonly Proposal[]> {
    const electorates = await this.getElectorates();
    const proposals = await this.connection.getProposals();
    return proposals.filter(({ electorate }) => {
      const electorateId = new BN(electorate.id).toNumber();
      return electorates.some(({ id }) => id === electorateId);
    });
  }

  public async getVotes(): Promise<readonly Vote[]> {
    return this.connection.getVotes(this.address);
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
      case ProposalType.AmendElectionRuleThreshold: {
        const { quorum, votingPeriod } = await this.getElectionRuleById(options.targetElectionRuleId);
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectionRule,
            electionRuleId: options.targetElectionRuleId,
            threshold: options.threshold,
            quorum: quorum,
            votingPeriod: votingPeriod,
          },
        });
      }
      case ProposalType.AmendElectionRuleQuorum: {
        const { threshold, votingPeriod } = await this.getElectionRuleById(options.targetElectionRuleId);
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectionRule,
            electionRuleId: options.targetElectionRuleId,
            threshold: threshold,
            quorum: options.quorum,
            votingPeriod: votingPeriod,
          },
        });
      }
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
          throw new Error("Could not find reward fund account");
        }
        const totalWeight = options.recipients.reduce((total, { weight }) => total + weight, 0);

        const messages = rewardFund.balance
          .map(amount => {
            const quantity = new BN(amount.quantity);
            return options.recipients.map(({ address, weight }) => ({
              kind: ActionKind.Send as ActionKind.Send,
              sender: rewardFundAddress,
              recipient: address,
              amount: {
                ...amount,
                quantity: quantity
                  .muln(weight)
                  .divn(totalWeight)
                  .toString(),
              },
            }));
          })
          .reduce((accumulator, next) => [...accumulator, ...next], []);

        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.ExecuteProposalBatch,
            messages: messages,
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
      case ProposalType.TreasurySend: {
        if (!this.treasuryAddress) {
          throw new Error("This Governor instance was not initialised with a treasuryAddress");
        }
        const treasuryAddress = this.treasuryAddress;
        const messages = options.recipients.map(({ address, amount }) => ({
          kind: ActionKind.Send as ActionKind.Send,
          sender: treasuryAddress,
          recipient: address,
          amount: amount,
        }));
        return this.connection.withDefaultFee({
          ...commonProperties,
          action: {
            kind: ActionKind.ExecuteProposalBatch,
            messages: messages,
          },
        });
      }
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
