import { ReadonlyDate } from "readonly-date";

import { IpPortString, TxBytes, TxHash, ValidatorPubkey, ValidatorSignature } from "./types";

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

/** No data in here because RPC method BroadcastTxAsync "returns right away, with no response" */
export interface BroadcastTxAsyncResponse {}

export interface BroadcastTxSyncResponse extends TxData {
  readonly hash: TxHash;
}

/**
 * Returns true iff transaction made it sucessfully into the transaction pool
 */
export function broadcastTxSyncSuccess(res: BroadcastTxSyncResponse): boolean {
  // code must be 0 on success
  return res.code === 0;
}

export interface BroadcastTxCommitResponse {
  readonly height?: number;
  readonly hash: TxHash;
  readonly checkTx: TxData;
  readonly deliverTx?: TxData;
}

/**
 * Returns true iff transaction made it sucessfully into a block
 * (i.e. sucess in `check_tx` and `deliver_tx` field)
 */
export function broadcastTxCommitSuccess(res: BroadcastTxCommitResponse): boolean {
  // code must be 0 on success
  // deliverTx may be present but empty on failure
  return res.checkTx.code === 0 && !!res.deliverTx && res.deliverTx.code === 0;
}

export interface CommitResponse {
  readonly header: Header;
  readonly commit: Commit;
  readonly canonical: boolean;
}

export interface GenesisResponse {
  readonly genesisTime: ReadonlyDate;
  readonly chainId: string;
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

/**
 * A transaction from RPC calls like search.
 *
 * Try to keep this compatible to TxEvent
 */
export interface TxResponse {
  readonly tx: TxBytes;
  readonly hash: TxHash;
  readonly height: number;
  readonly index: number;
  readonly result: TxData;
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

// Events

export interface NewBlockEvent extends Block {}

export interface NewBlockHeaderEvent extends Header {}

export interface TxEvent {
  readonly tx: TxBytes;
  readonly hash: TxHash;
  readonly height: number;
  readonly index: number;
  readonly result: TxData;
}

export const getTxEventHeight = (event: TxEvent): number => event.height;
export const getHeaderEventHeight = (event: NewBlockHeaderEvent): number => event.height;
export const getBlockEventHeight = (event: NewBlockEvent): number => event.header.height;

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
  // readonly fees?: any;
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
export enum VoteType {
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
  readonly signature: ValidatorSignature;
}

export interface Header {
  readonly chainId: string;
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
  readonly network: string;
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
  readonly pubkey: ValidatorPubkey;
  readonly votingPower: number;
  readonly accum?: number;
  readonly name?: string;
}

export interface ConsensusParams {
  readonly blockSizeParams: BlockSizeParams;
  readonly evidenceParams: EvidenceParams;
  // no longer exist in 0.25
  readonly txSizeParams?: TxSizeParams;
  readonly blockGossipParams?: BlockGossipParams;
}

export interface BlockSizeParams {
  readonly maxBytes: number;
  readonly maxGas: number;
  readonly maxTxs?: number; // no longer exists in 0.25
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
