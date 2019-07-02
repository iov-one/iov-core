import { Identity, WithCreator } from "@iov/bcp";
import { BnsConnection, BnsTx, ElectionRule, Electorate, Proposal, VoteOption } from "@iov/bns";
import { CommitteeId, ProposalOptions } from "./proposals";
export declare const COMMITTEE_IDS: {
    testnet: {
        GOVERNING_BOARD: CommitteeId;
        ECONOMIC_COMMITTEE: CommitteeId;
        VALIDATOR_COMMITTEE: CommitteeId;
        TECH_COMMITTEE: CommitteeId;
    };
};
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
