import { Identity, WithCreator } from "@iov/bcp";
import { BnsConnection, CreateProposalTx, ElectionRule, Electorate, Proposal, TallyTx, VoteOption, VoteTx } from "@iov/bns";
import { ProposalOptions } from "./proposals";
export interface GovernorOptions {
    readonly connection: BnsConnection;
    readonly identity: Identity;
    readonly guaranteeFundEscrowId: Uint8Array;
}
export declare class Governor {
    private readonly connection;
    private readonly identity;
    private readonly address;
    private readonly guaranteeFundEscrowId;
    constructor({ connection, identity, guaranteeFundEscrowId }: GovernorOptions);
    getElectorates(): Promise<readonly Electorate[]>;
    getElectionRules(electorateId: number): Promise<readonly ElectionRule[]>;
    getProposals(): Promise<readonly Proposal[]>;
    buildCreateProposalTx(options: ProposalOptions): Promise<CreateProposalTx & WithCreator>;
    buildVoteTx(proposalId: number, selection: VoteOption): Promise<VoteTx & WithCreator>;
    buildTallyTx(proposalId: number): Promise<TallyTx & WithCreator>;
}
