import { Base64String, DateTimeString, HexString, IntegerString, IpPortString } from "../encodings";
import { JsonRpcEvent, JsonRpcSuccess } from "../jsonrpc";
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
    readonly last_block_height?: number;
    readonly last_block_app_hash?: Base64String;
}
export interface AbciQueryResult {
    readonly response: RpcAbciQueryResponse;
}
export interface RpcAbciQueryResponse {
    readonly key: Base64String;
    readonly value: Base64String;
    readonly height?: IntegerString;
    readonly index?: number;
    readonly code?: number;
    readonly log?: string;
}
export interface RpcBlockResponse {
    readonly block_meta: RpcBlockMeta;
    readonly block: RpcBlock;
}
export interface RpcBlockResultsResponse {
    readonly height: number;
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
    readonly last_height: number;
    readonly block_metas: ReadonlyArray<RpcBlockMeta>;
}
export declare type RpcBroadcastTxAsyncResponse = RpcBroadcastTxSyncResponse;
export interface RpcBroadcastTxSyncResponse extends RpcTxData {
    readonly hash: HexString;
}
export interface RpcBroadcastTxCommitResponse {
    readonly height?: number;
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
    readonly validators: ReadonlyArray<RpcValidatorData>;
}
/**** Helper items used above ******/
export interface RpcTag {
    readonly key: Base64String;
    readonly value: Base64String;
}
export interface RpcTxData {
    readonly code?: number;
    readonly log?: string;
    readonly data?: Base64String;
    readonly tags?: ReadonlyArray<RpcTag>;
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
        readonly txs?: ReadonlyArray<Base64String>;
    };
    readonly evidence?: {
        readonly evidence?: ReadonlyArray<RpcEvidence>;
    };
}
export interface RpcEvidence {
    readonly type: string;
    readonly validator: RpcValidatorUpdate;
    readonly height: number;
    readonly time: number;
    readonly totalVotingPower: number;
}
export interface RpcCommit {
    readonly block_id: RpcBlockId;
    readonly precommits: ReadonlyArray<RpcVote>;
}
export interface RpcVote {
    readonly type: responses.VoteType;
    readonly validator_address: HexString;
    readonly validator_index: number;
    readonly height: number;
    readonly round: number;
    readonly timestamp: DateTimeString;
    readonly block_id: RpcBlockId;
    readonly signature: RpcSignature;
}
export interface RpcHeader {
    readonly chain_id: string;
    readonly height: number;
    readonly time: DateTimeString;
    readonly num_txs: number;
    readonly last_block_id: RpcBlockId;
    readonly total_txs: number;
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
    readonly latest_block_height: number;
    readonly latest_block_time: DateTimeString;
    readonly syncing: boolean;
}
export interface RpcValidatorGenesis {
    readonly pub_key: RpcPubkey;
    readonly power: number;
    readonly name?: string;
}
export interface RpcValidatorUpdate {
    readonly address: Base64String;
    readonly pub_key: RpcPubkey;
    readonly power: number;
}
export interface RpcValidatorInfo {
    readonly address: HexString;
    readonly pub_key: RpcPubkey;
    readonly voting_power: number;
}
export interface RpcValidatorData extends RpcValidatorInfo {
    readonly accum?: number;
}
export interface RpcConsensusParams {
    readonly block_size_params: RpcBlockSizeParams;
    readonly tx_size_params: RpcTxSizeParams;
    readonly block_gossip_params: RpcBlockGossipParams;
    readonly evidence_params: RpcEvidenceParams;
}
export interface RpcBlockSizeParams {
    readonly max_bytes: number;
    readonly max_txs: number;
    readonly max_gas: number;
}
export interface RpcTxSizeParams {
    readonly max_bytes: number;
    readonly max_gas: number;
}
export interface RpcBlockGossipParams {
    readonly block_part_size_bytes: number;
}
export interface RpcEvidenceParams {
    readonly max_age: number;
}
export interface RpcPubkey {
    readonly type: string;
    readonly value: Base64String;
}
export interface RpcSignature {
    readonly type: string;
    readonly value: Base64String;
}
