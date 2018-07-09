import { Base64String, DateTimeString, HexString, IpPortString } from "../encodings";

/**** results *****/

export interface AbciInfoResult {
  readonly response: RpcAbciInfoResponse;
}
export interface RpcAbciInfoResponse {
  readonly data: string;
  readonly last_block_height: number;
  readonly last_block_app_hash: Base64String;
}

export interface AbciQueryResult {
  readonly response: RpcAbciQueryResponse;
}
export interface RpcAbciQueryResponse {
  readonly key: Base64String;
  readonly value: Base64String;
  readonly height: string; // (number encoded as string)
  readonly code: number; // only for errors
  readonly log: string;
}

export interface RpcBlockResponse {
  readonly block_meta: RpcBlockMeta;
  readonly block: RpcBlock;
}

export interface RpcBlockResultsResponse {
  readonly height: number;
  readonly results: ReadonlyArray<RpcTxResponse>;
}

export interface RpcBlockchainResponse {
  readonly last_height: number;
  readonly block_metas: ReadonlyArray<RpcBlockMeta>;
}

export type RpcBroadcastTxAsyncResponse = RpcBroadcastTxSyncResponse;
export interface RpcBroadcastTxSyncResponse extends RpcTxResponse {
  readonly hash: HexString;
}

export interface RpcBroadcastTxCommitResponse {
  readonly height?: number;
  readonly hash: HexString;
  readonly check_tx: RpcTxResponse;
  readonly deliver_tx?: RpcTxResponse;
}

export interface RpcCommitResponse {
  readonly SignedHeader: {
    readonly header: RpcHeader;
    readonly commit: RpcCommit;
  };
  readonly canonical: boolean;
}

export interface GenesisResult {
  readonly genesis: RpcGenesisResponse;
}
export interface RpcGenesisResponse {
  readonly genesis_time: DateTimeString;
  readonly chain_id: string; // ChainId;
  readonly consensus_params: ConsensusParams;
  readonly validators: ReadonlyArray<RpcValidatorGenesis>;
  readonly app_hash: string; // HexString, Base64String??
  readonly app_state: {};
}

export type HealthResponse = null;

// status
export interface StatusResult {
  readonly response: RpcStatusResponse;
}
export interface RpcStatusResponse {
  readonly node_info: RpcNodeInfo;
  readonly sync_info: RpcSyncInfo;
  readonly validator_info: RpcValidatorInfo;
}

export interface RpcTxResponse {
  readonly tx: Base64String;
  readonly tx_result: RpcTxData;
  readonly height: number;
  readonly index: number;
  readonly hash: HexString;
  readonly proof?: RpcTxProof;
}

export interface RpcTxSearchResponse {
  readonly txs: ReadonlyArray<RpcTxResponse>;
  readonly total_count: number;
}

export interface RpcValidatorsResponse {
  readonly block_height: number;
  readonly results: ReadonlyArray<RpcValidatorData>;
}

/**** Helper items used above ******/

export interface RpcTxData {
  readonly code: number;
  readonly log: string;
  readonly data: Base64String;
  readonly hash: HexString;
}

export interface RpcTxProof {
  readonly Data: Base64String;
  readonly RootHash: HexString;
  readonly Total: number;
  readonly Index: number;
  readonly Proof: {
    readonly aunts: ReadonlyArray<Base64String>;
  };
}

export interface RpcBlockMeta {
  readonly block_id: RpcBlockId;
  readonly header: RpcHeader;
}

export interface RpcBlockId {
  readonly hash: HexString;
  readonly parts: {
    readonly total: number;
    readonly hash: HexString;
  };
}

export interface RpcBlock {
  readonly header: RpcHeader;
  readonly last_commit: RpcCommit;
  readonly data: {
    readonly txs: ReadonlyArray<Base64String>; // TODO: HexString?
  };
  readonly evidence: {
    readonly evidence: ReadonlyArray<Evidence>;
  };
}

// TODO: what is this???
export type Evidence = any;

export interface RpcCommit {
  readonly block_id: RpcBlockId;
  readonly precommits: ReadonlyArray<RpcVote>;
}

export const enum VoteType {
  PREVOTE = 1,
  PRECOMMIT = 2,
}

export interface RpcVote {
  readonly type: VoteType;
  readonly validator_address: HexString;
  readonly validator_index: number;
  readonly height: number;
  readonly round: number;
  readonly timestamp: DateTimeString;
  readonly block_id: RpcBlockId;
  readonly signature: RpcSignature;
}

export interface RpcHeader {
  readonly chain_id: string; // ChainId
  readonly height: number;
  readonly time: DateTimeString;
  readonly num_txs: number;
  readonly last_block_id: RpcBlockId;
  readonly total_txs: number;

  // merkle roots for proofs
  readonly app_hash: HexString;
  readonly consensus_hash: HexString;
  readonly data_hash: HexString;
  readonly evidence_hash: HexString;
  readonly last_commit_hash: HexString;
  readonly last_results_hash: HexString;
  readonly validators_hash: HexString;
}

export interface RpcNodeInfo {
  readonly id: HexString;
  readonly listen_addr: IpPortString;
  readonly network: string;
  readonly version: string;
  readonly channels: string; // ???
  readonly moniker: string;
  readonly other: ReadonlyArray<string>;
  // [
  //   "amino_version=0.9.9",
  //   "p2p_version=0.5.0",
  //   "consensus_version=v1/0.2.2",
  //   "rpc_version=0.7.0/3",
  //   "tx_index=on",
  //   "rpc_addr=tcp://0.0.0.0:46657"
  // ]
}

export interface RpcSyncInfo {
  readonly latest_block_hash: HexString;
  readonly latest_app_hash: HexString;
  readonly latest_block_height: number;
  readonly latest_block_time: DateTimeString;
  readonly syncing: boolean;
}

// this is in genesis
export interface RpcValidatorGenesis {
  readonly pub_key: RpcPubKey;
  readonly power: number;
  readonly name: string;
}

// this is in status
export interface RpcValidatorInfo {
  readonly address: HexString;
  readonly pub_key: RpcPubKey;
  readonly voting_power: number;
}

export interface RpcValidatorData extends RpcValidatorInfo {
  readonly accum?: number;
}

export interface ConsensusParams {
  readonly block_size_params: BlockSizeParams;
  readonly tx_size_params: TxSizeParams;
  readonly block_gossip_params: BlockGossipParams;
  readonly evidence_params: EvidenceParams;
}

export interface BlockSizeParams {
  readonly max_bytes: number;
  readonly max_txs: number;
  readonly max_gas: number;
}

export interface TxSizeParams {
  readonly max_bytes: number;
  readonly max_gas: number;
}

export interface BlockGossipParams {
  readonly block_part_size_bytes: number;
}

export interface EvidenceParams {
  readonly max_age: number;
}

export interface RpcPubKey {
  readonly type: "AC26791624DE60"; // ed25519 public key
  readonly value: Base64String;
}

export interface RpcSignature {
  readonly type: "6BF5903DA1DB28"; // ed25519 signature
  readonly value: Base64String;
}
