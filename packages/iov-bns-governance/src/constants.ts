import { CommitteeId } from "./proposals";

export interface CommitteeIds {
  readonly GOVERNING_BOARD: CommitteeId;
  readonly ECONOMIC_COMMITTEE: CommitteeId;
  readonly VALIDATOR_COMMITTEE: CommitteeId;
  readonly TECH_COMMITTEE: CommitteeId;
}

export const COMMITTEE_IDS: { readonly [chainId: string]: CommitteeIds } = {
  // TODO: Constants to be finalised once the committees are actually on-chain. E.g.:
  // testnet: {
  //   GOVERNING_BOARD: 1 as CommitteeId,
  //   ECONOMIC_COMMITTEE: 2 as CommitteeId,
  //   VALIDATOR_COMMITTEE: 3 as CommitteeId,
  //   TECH_COMMITTEE: 4 as CommitteeId,
  // },
};
