import { Address } from "@iov/bcp";
import { As } from "type-tagger";
export declare type CommitteeId = number & As<"committee">;
export interface CommitteeIds {
    readonly governingBoard: CommitteeId;
    readonly economicCommittee: CommitteeId;
    readonly validatorCommittee: CommitteeId;
    readonly techCommittee: CommitteeId;
}
export declare const committeeIds: {
    readonly [chainId: string]: CommitteeIds;
};
export declare const guaranteeFundEscrowIds: {
    readonly [chainId: string]: Uint8Array;
};
export declare const rewardFundAddresses: {
    readonly [chainId: string]: Address;
};
