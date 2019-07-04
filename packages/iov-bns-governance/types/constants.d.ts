import { CommitteeId } from "./proposals";
export interface CommitteeIds {
    readonly GOVERNING_BOARD: CommitteeId;
    readonly ECONOMIC_COMMITTEE: CommitteeId;
    readonly VALIDATOR_COMMITTEE: CommitteeId;
    readonly TECH_COMMITTEE: CommitteeId;
}
export declare const COMMITTEE_IDS: {
    readonly [chainId: string]: CommitteeIds;
};
