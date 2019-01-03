import { JsonRpcEvent, JsonRpcRequest, JsonRpcSuccess } from "./jsonrpc";
import * as requests from "./requests";
import * as responses from "./responses";
import { TxBytes, TxHash } from "./types";
export interface Adaptor {
    readonly params: Params;
    readonly responses: Responses;
    readonly hashTx: (tx: TxBytes) => TxHash;
}
export declare type Encoder<T extends requests.Request> = (req: T) => JsonRpcRequest;
export declare type Decoder<T extends responses.Response> = (res: JsonRpcSuccess) => T;
export interface Params {
    readonly encodeAbciInfo: (req: requests.AbciInfoRequest) => JsonRpcRequest;
    readonly encodeAbciQuery: (req: requests.AbciQueryRequest) => JsonRpcRequest;
    readonly encodeBlock: (req: requests.BlockRequest) => JsonRpcRequest;
    readonly encodeBlockchain: (req: requests.BlockchainRequest) => JsonRpcRequest;
    readonly encodeBlockResults: (req: requests.BlockResultsRequest) => JsonRpcRequest;
    readonly encodeBroadcastTx: (req: requests.BroadcastTxRequest) => JsonRpcRequest;
    readonly encodeCommit: (req: requests.CommitRequest) => JsonRpcRequest;
    readonly encodeGenesis: (req: requests.GenesisRequest) => JsonRpcRequest;
    readonly encodeHealth: (req: requests.HealthRequest) => JsonRpcRequest;
    readonly encodeStatus: (req: requests.StatusRequest) => JsonRpcRequest;
    readonly encodeSubscribe: (req: requests.SubscribeRequest) => JsonRpcRequest;
    readonly encodeTx: (req: requests.TxRequest) => JsonRpcRequest;
    readonly encodeTxSearch: (req: requests.TxSearchRequest) => JsonRpcRequest;
    readonly encodeValidators: (req: requests.ValidatorsRequest) => JsonRpcRequest;
}
export interface Responses {
    readonly decodeAbciInfo: (response: JsonRpcSuccess) => responses.AbciInfoResponse;
    readonly decodeAbciQuery: (response: JsonRpcSuccess) => responses.AbciQueryResponse;
    readonly decodeBlock: (response: JsonRpcSuccess) => responses.BlockResponse;
    readonly decodeBlockResults: (response: JsonRpcSuccess) => responses.BlockResultsResponse;
    readonly decodeBlockchain: (response: JsonRpcSuccess) => responses.BlockchainResponse;
    readonly decodeBroadcastTxSync: (response: JsonRpcSuccess) => responses.BroadcastTxSyncResponse;
    readonly decodeBroadcastTxAsync: (response: JsonRpcSuccess) => responses.BroadcastTxAsyncResponse;
    readonly decodeBroadcastTxCommit: (response: JsonRpcSuccess) => responses.BroadcastTxCommitResponse;
    readonly decodeCommit: (response: JsonRpcSuccess) => responses.CommitResponse;
    readonly decodeGenesis: (response: JsonRpcSuccess) => responses.GenesisResponse;
    readonly decodeHealth: (response: JsonRpcSuccess) => responses.HealthResponse;
    readonly decodeStatus: (response: JsonRpcSuccess) => responses.StatusResponse;
    readonly decodeTx: (response: JsonRpcSuccess) => responses.TxResponse;
    readonly decodeTxSearch: (response: JsonRpcSuccess) => responses.TxSearchResponse;
    readonly decodeValidators: (response: JsonRpcSuccess) => responses.ValidatorsResponse;
    readonly decodeNewBlockEvent: (response: JsonRpcEvent) => responses.NewBlockEvent;
    readonly decodeNewBlockHeaderEvent: (response: JsonRpcEvent) => responses.NewBlockHeaderEvent;
    readonly decodeTxEvent: (response: JsonRpcEvent) => responses.TxEvent;
}
/**
 * Returns an Adaptor implementation for a given tendermint version.
 * Throws when version is not supported.
 *
 * @param version full Tendermint version string, e.g. "0.20.1"
 */
export declare function adatorForVersion(version: string): Adaptor;
