import { Identity, WithCreator } from "@iov/bcp";
import { BnsConnection, BnsTx, ElectionRule, Electorate, Proposal, VoteOption } from "@iov/bns";
import { ProposalOptions } from "./proposals";
export interface GovernorOptions {
    readonly connection: BnsConnection;
    readonly identity: Identity;
}
export declare class Governor {
    private readonly connection;
    private readonly identity;
    private readonly address;
    constructor({ connection, identity }: GovernorOptions);
    getElectorates(): Promise<readonly Electorate[]>;
    getElectionRules(electorateId: number): Promise<readonly ElectionRule[]>;
    getProposals(): Promise<readonly Proposal[]>;
    createProposalTx(options: ProposalOptions): Promise<BnsTx & WithCreator>;
    createVoteTx(proposalId: number, selection: VoteOption): Promise<BnsTx & WithCreator>;
    createTallyTx(proposalId: number): Promise<BnsTx & WithCreator>;
}
