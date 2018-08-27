import { ReadonlyDate } from "readonly-date";

import { ChainId, PostableBytes, PublicKeyBundle, SignatureBundle } from "@iov/tendermint-types";

import { IpPortString } from "./encodings";

export type Response =
  | AbciInfoResponse
  | AbciQueryResponse
  | BlockResponse
  | BlockResultsResponse
  | BlockchainResponse
  | BroadcastTxAsyncResponse
  | BroadcastTxSyncResponse
  | BroadcastTxCommitResponse
  | CommitResponse
  | GenesisResponse
  | HealthResponse
  | StatusResponse
  | TxResponse
  | TxSearchResponse
  | ValidatorsResponse;

export interface AbciInfoResponse {
  readonly data?: string;
  readonly lastBlockHeight?: number;
  readonly lastBlockAppHash?: Uint8Array;
}

export interface AbciQueryResponse {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
  readonly height?: number;
  readonly index?: number;
  readonly code?: number; // non-falsy for errors
  readonly log?: string;
}

export interface BlockResponse {
  readonly blockMeta: BlockMeta;
  readonly block: Block;
}

export interface BlockResultsResponse {
  readonly height: number;
  readonly results: ReadonlyArray<TxData>;
  readonly endBlock: {
    readonly validatorUpdates: ReadonlyArray<Validator>;
    readonly consensusUpdates?: ConsensusParams;
    readonly tags?: ReadonlyArray<Tag>;
  };
}

export interface BlockchainResponse {
  readonly lastHeight: number;
  readonly blockMetas: ReadonlyArray<BlockMeta>;
}

export type BroadcastTxAsyncResponse = BroadcastTxSyncResponse;
export interface BroadcastTxSyncResponse extends TxData {
  readonly hash: Uint8Array;
}

export interface BroadcastTxCommitResponse {
  readonly height?: number;
  readonly hash: Uint8Array;
  readonly checkTx: TxData;
  readonly deliverTx?: TxData;
}

// note that deliverTx may be present but empty on failure
// code must be 0 on success
export const txCommitSuccess = (res: BroadcastTxCommitResponse): boolean =>
  res.checkTx.code === 0 && !!res.deliverTx && res.deliverTx.code === 0;

export interface CommitResponse {
  readonly header: Header;
  readonly commit: Commit;
  readonly canonical: boolean;
}

export interface GenesisResponse {
  readonly genesisTime: ReadonlyDate;
  readonly chainId: ChainId;
  readonly consensusParams: ConsensusParams;
  readonly validators: ReadonlyArray<Validator>;
  readonly appHash: Uint8Array;
  readonly appState: {};
}

export type HealthResponse = null;

export interface StatusResponse {
  readonly nodeInfo: NodeInfo;
  readonly syncInfo: SyncInfo;
  readonly validatorInfo: Validator;
}

export interface SubscriptionEvent {
  readonly blockHeight: number;
}

export interface TxResponse {
  readonly tx: PostableBytes;
  readonly txResult: TxData;
  readonly height: number;
  readonly index: number;
  readonly hash: Uint8Array;
  readonly proof?: TxProof;
}

export interface TxSearchResponse {
  readonly txs: ReadonlyArray<TxResponse>;
  readonly totalCount: number;
}

export interface ValidatorsResponse {
  readonly blockHeight: number;
  readonly results: ReadonlyArray<Validator>;
}

/**** Helper items used above ******/

export interface Tag {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

export interface TxData {
  readonly code: number;
  readonly log?: string;
  readonly data?: Uint8Array;
  readonly tags?: ReadonlyArray<Tag>;
}

export interface TxProof {
  readonly data: Uint8Array;
  readonly rootHash: Uint8Array;
  readonly total: number;
  readonly index: number;
  readonly proof: {
    readonly aunts: ReadonlyArray<Uint8Array>;
  };
}

export interface BlockMeta {
  readonly blockId: BlockId;
  readonly header: Header;
}

export interface BlockId {
  readonly hash: Uint8Array;
  readonly parts: {
    readonly total: number;
    readonly hash: Uint8Array;
  };
}

export interface Block {
  readonly header: Header;
  readonly lastCommit: Commit;
  readonly txs: ReadonlyArray<Uint8Array>;
  readonly evidence?: ReadonlyArray<Evidence>;
}

export interface Evidence {
  readonly type: string;
  readonly validator: Validator;
  readonly height: number;
  readonly time: number;
  readonly totalVotingPower: number;
}

export interface Commit {
  readonly blockId: BlockId;
  readonly precommits: ReadonlyArray<Vote>;
}

/**
 * raw values from https://github.com/tendermint/tendermint/blob/dfa9a9a30a666132425b29454e90a472aa579a48/types/vote.go#L44
 */
export const enum VoteType {
  PREVOTE = 1,
  PRECOMMIT = 2,
}

export interface Vote {
  readonly type: VoteType;
  readonly validatorAddress: Uint8Array;
  readonly validatorIndex: number;
  readonly height: number;
  readonly round: number;
  readonly timestamp: ReadonlyDate;
  readonly blockId: BlockId;
  readonly signature: SignatureBundle;
}

export interface Header {
  readonly chainId: ChainId;
  readonly height: number;
  readonly time: ReadonlyDate;
  readonly numTxs: number;
  readonly lastBlockId: BlockId;
  readonly totalTxs: number;

  // merkle roots for proofs
  readonly appHash: Uint8Array;
  readonly consensusHash: Uint8Array;
  readonly dataHash: Uint8Array;
  readonly evidenceHash: Uint8Array;
  readonly lastCommitHash: Uint8Array;
  readonly lastResultsHash: Uint8Array;
  readonly validatorsHash: Uint8Array;
}

export interface NodeInfo {
  readonly id: Uint8Array;
  readonly listenAddr: IpPortString;
  readonly network: ChainId;
  readonly version: string;
  readonly channels: string; // ???
  readonly moniker: string;
  readonly other: ReadonlyArray<string>;
}

export interface SyncInfo {
  readonly latestBlockHash: Uint8Array;
  readonly latestAppHash: Uint8Array;
  readonly latestBlockHeight: number;
  readonly latestBlockTime: ReadonlyDate;
  readonly syncing: boolean;
}

// this is in status
export interface Validator {
  readonly address?: Uint8Array;
  readonly pubkey: PublicKeyBundle;
  readonly votingPower: number;
  readonly accum?: number;
  readonly name?: string;
}

export interface ConsensusParams {
  readonly blockSizeParams: BlockSizeParams;
  readonly txSizeParams: TxSizeParams;
  readonly blockGossipParams: BlockGossipParams;
  readonly evidenceParams: EvidenceParams;
}

export interface BlockSizeParams {
  readonly maxBytes: number;
  readonly maxTxs: number;
  readonly maxGas: number;
}

export interface TxSizeParams {
  readonly maxBytes: number;
  readonly maxGas: number;
}

export interface BlockGossipParams {
  readonly blockPartSizeBytes: number;
}

export interface EvidenceParams {
  readonly maxAge: number;
}
