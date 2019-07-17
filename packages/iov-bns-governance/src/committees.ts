import { As } from "type-tagger";

export type CommitteeId = number & As<"committee">;

export interface CommitteeIds {
  readonly governingBoard: CommitteeId;
  readonly economicCommittee: CommitteeId;
  readonly validatorCommittee: CommitteeId;
  readonly techCommittee: CommitteeId;
}

export const committeeIds: { readonly [chainId: string]: CommitteeIds } = {
  // TODO: Constants to be finalised once the committees are actually on-chain. E.g.:
  // testnet: {
  //   governingBoard: 1 as CommitteeId,
  //   economicCommittee: 2 as CommitteeId,
  //   validatorCommittee: 3 as CommitteeId,
  //   techCommittee: 4 as CommitteeId,
  // },
};

export const guaranteeFundEscrowIds: { readonly [chainId: string]: Uint8Array } = {
  // TODO: Constants to be finalised once the guarantee funds are set up in the actual genesis blocks. E.g.:
  // testnet: Encoding.fromHex("abcd"),
};
