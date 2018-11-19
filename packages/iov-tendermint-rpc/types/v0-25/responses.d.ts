import { JsonRpcEvent, JsonRpcSuccess } from "../common";
import { Base64String, DateTimeString, HexString, IntegerString, IpPortString } from "../encodings";
import * as responses from "../responses";
/*** adaptor ***/
export declare class Responses {
    static decodeAbciInfo(response: JsonRpcSuccess): responses.AbciInfoResponse;
    static decodeAbciQuery(response: JsonRpcSuccess): responses.AbciQueryResponse;
    static decodeBlock(response: JsonRpcSuccess): responses.BlockResponse;
    static decodeBlockResults(response: JsonRpcSuccess): responses.BlockResultsResponse;
    static decodeBlockchain(response: JsonRpcSuccess): responses.BlockchainResponse;
    static decodeBroadcastTxSync(response: JsonRpcSuccess): responses.BroadcastTxSyncResponse;
    static decodeBroadcastTxAsync(response: JsonRpcSuccess): responses.BroadcastTxAsyncResponse;
    static decodeBroadcastTxCommit(response: JsonRpcSuccess): responses.BroadcastTxCommitResponse;
    static decodeCommit(response: JsonRpcSuccess): responses.CommitResponse;
    static decodeGenesis(response: JsonRpcSuccess): responses.GenesisResponse;
    static decodeHealth(): responses.HealthResponse;
    static decodeStatus(response: JsonRpcSuccess): responses.StatusResponse;
    static decodeNewBlockEvent(event: JsonRpcEvent): responses.NewBlockEvent;
    static decodeNewBlockHeaderEvent(event: JsonRpcEvent): responses.NewBlockHeaderEvent;
    static decodeTxEvent(event: JsonRpcEvent): responses.TxEvent;
    static decodeTx(response: JsonRpcSuccess): responses.TxResponse;
    static decodeTxSearch(response: JsonRpcSuccess): responses.TxSearchResponse;
    static decodeValidators(response: JsonRpcSuccess): responses.ValidatorsResponse;
}
/**** results *****/
export interface AbciInfoResult {
    readonly response: RpcAbciInfoResponse;
}
export interface RpcAbciInfoResponse {
    readonly data?: string;
    readonly last_block_height?: IntegerString;
    readonly last_block_app_hash?: Base64String;
}
export interface AbciQueryResult {
    readonly response: RpcAbciQueryResponse;
}
export interface RpcAbciQueryResponse {
    readonly key: Base64String;
    readonly value?: Base64String;
    readonly proof?: Base64String;
    readonly height?: IntegerString;
    readonly index?: IntegerString;
    readonly code?: IntegerString;
    readonly log?: string;
}
export interface RpcBlockResponse {
    readonly block_meta: RpcBlockMeta;
    readonly block: RpcBlock;
}
export interface RpcBlockResultsResponse {
    readonly height: IntegerString;
    readonly results: {
        readonly DeliverTx: ReadonlyArray<RpcTxData>;
        readonly EndBlock: {
            readonly validator_updates?: ReadonlyArray<RpcValidatorUpdate>;
            readonly consensus_param_updates?: RpcConsensusParams;
            readonly tags?: ReadonlyArray<RpcTag>;
        };
    };
}
export interface RpcBlockchainResponse {
    readonly last_height: IntegerString;
    readonly block_metas: ReadonlyArray<RpcBlockMeta>;
}
export declare type RpcBroadcastTxAsyncResponse = RpcBroadcastTxSyncResponse;
export interface RpcBroadcastTxSyncResponse extends RpcTxData {
    readonly hash: HexString;
}
export interface RpcBroadcastTxCommitResponse {
    readonly height?: IntegerString;
    readonly hash: HexString;
    readonly check_tx: RpcTxData;
    readonly deliver_tx?: RpcTxData;
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
    readonly chain_id: string;
    readonly consensus_params: RpcConsensusParams;
    readonly validators: ReadonlyArray<RpcValidatorGenesis>;
    readonly app_hash: HexString;
    readonly app_state: {};
}
export declare type HealthResponse = null;
export interface RpcStatusResponse {
    readonly node_info: RpcNodeInfo;
    readonly sync_info: RpcSyncInfo;
    readonly validator_info: RpcValidatorInfo;
}
export interface RpcTxResponse {
    readonly tx: Base64String;
    readonly tx_result: RpcTxData;
    readonly height: IntegerString;
    readonly index: number;
    readonly hash: HexString;
    readonly proof?: RpcTxProof;
}
export interface RpcTxSearchResponse {
    readonly txs: ReadonlyArray<RpcTxResponse>;
    readonly total_count: IntegerString;
}
export interface RpcTxEvent {
    readonly tx: Base64String;
    readonly result: RpcTxData;
    readonly height: IntegerString;
    readonly index: number;
}
export interface RpcValidatorsResponse {
    readonly block_height: IntegerString;
    readonly validators: ReadonlyArray<RpcValidatorData>;
}
/**** Helper items used above ******/
export interface RpcTag {
    readonly key: Base64String;
    readonly value: Base64String;
}
export interface RpcTxData {
    readonly code?: IntegerString;
    readonly log?: string;
    readonly data?: Base64String;
    readonly tags?: ReadonlyArray<RpcTag>;
}
export interface RpcTxProof {
    readonly Data: Base64String;
    readonly RootHash: HexString;
    readonly Total: IntegerString;
    readonly Index: IntegerString;
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
        readonly total: IntegerString;
        readonly hash: HexString;
    };
}
export interface RpcBlock {
    readonly header: RpcHeader;
    readonly last_commit: RpcCommit;
    readonly data: {
        readonly txs?: ReadonlyArray<Base64String>;
    };
    readonly evidence?: {
        readonly evidence?: ReadonlyArray<RpcEvidence>;
    };
}
export interface RpcEvidence {
    readonly type: string;
    readonly validator: RpcValidatorUpdate;
    readonly height: IntegerString;
    readonly time: IntegerString;
    readonly totalVotingPower: IntegerString;
}
export interface RpcCommit {
    readonly block_id: RpcBlockId;
    readonly precommits: ReadonlyArray<RpcVote>;
}
export interface RpcVote {
    readonly type: number;
    readonly validator_address: HexString;
    readonly validator_index: IntegerString;
    readonly height: IntegerString;
    readonly round: IntegerString;
    readonly timestamp: DateTimeString;
    readonly block_id: RpcBlockId;
    readonly signature: RpcSignature;
}
export interface RpcHeader {
    readonly chain_id: string;
    readonly height: IntegerString;
    readonly time: DateTimeString;
    readonly num_txs: IntegerString;
    readonly last_block_id: RpcBlockId;
    readonly total_txs: IntegerString;
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
    readonly channels: string;
    readonly moniker: string;
    readonly other: ReadonlyArray<string>;
}
export interface RpcSyncInfo {
    readonly latest_block_hash: HexString;
    readonly latest_app_hash: HexString;
    readonly latest_block_height: IntegerString;
    readonly latest_block_time: DateTimeString;
    readonly syncing: boolean;
}
export interface RpcValidatorGenesis {
    readonly pub_key: RpcPubkey;
    readonly power: IntegerString;
    readonly name?: string;
}
export interface RpcValidatorUpdate {
    readonly address: HexString;
    readonly pub_key: RpcPubkey;
    readonly power: number;
}
export interface RpcValidatorData extends RpcValidatorUpdate {
    readonly accum?: IntegerString;
}
export interface RpcValidatorInfo {
    readonly address: HexString;
    readonly pub_key: RpcAminoPubkey;
    readonly voting_power: IntegerString;
}
export interface RpcConsensusParams {
    readonly block_size_params: RpcBlockSizeParams;
    readonly tx_size_params: RpcTxSizeParams;
    readonly block_gossip_params: RpcBlockGossipParams;
    readonly evidence_params: RpcEvidenceParams;
}
export interface RpcBlockSizeParams {
    readonly max_bytes: IntegerString;
    readonly max_txs: IntegerString;
    readonly max_gas: IntegerString;
}
export interface RpcTxSizeParams {
    readonly max_bytes: IntegerString;
    readonly max_gas: IntegerString;
}
export interface RpcBlockGossipParams {
    readonly block_part_size_bytes: IntegerString;
}
export interface RpcEvidenceParams {
    readonly max_age: IntegerString;
}
export interface RpcPubkey {
    readonly type: string;
    readonly value: HexString;
}
export interface RpcAminoPubkey {
    readonly type: string;
    readonly value: Base64String;
}
export declare type RpcSignature = Base64String;
