import { JsonRpcEvent, JsonRpcSuccess } from "../jsonrpc";
import * as responses from "../responses";
export declare type HealthResponse = null;
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
