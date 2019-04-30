import { JsonRpcSuccessResponse } from "@iov/jsonrpc";
import { JsonRpcEvent } from "../jsonrpc";
import * as responses from "../responses";
/*** adaptor ***/
export declare class Responses {
    static decodeAbciInfo(response: JsonRpcSuccessResponse): responses.AbciInfoResponse;
    static decodeAbciQuery(response: JsonRpcSuccessResponse): responses.AbciQueryResponse;
    static decodeBlock(response: JsonRpcSuccessResponse): responses.BlockResponse;
    static decodeBlockResults(response: JsonRpcSuccessResponse): responses.BlockResultsResponse;
    static decodeBlockchain(response: JsonRpcSuccessResponse): responses.BlockchainResponse;
    static decodeBroadcastTxSync(response: JsonRpcSuccessResponse): responses.BroadcastTxSyncResponse;
    static decodeBroadcastTxAsync(response: JsonRpcSuccessResponse): responses.BroadcastTxAsyncResponse;
    static decodeBroadcastTxCommit(response: JsonRpcSuccessResponse): responses.BroadcastTxCommitResponse;
    static decodeCommit(response: JsonRpcSuccessResponse): responses.CommitResponse;
    static decodeGenesis(response: JsonRpcSuccessResponse): responses.GenesisResponse;
    static decodeHealth(): responses.HealthResponse;
    static decodeStatus(response: JsonRpcSuccessResponse): responses.StatusResponse;
    static decodeNewBlockEvent(event: JsonRpcEvent): responses.NewBlockEvent;
    static decodeNewBlockHeaderEvent(event: JsonRpcEvent): responses.NewBlockHeaderEvent;
    static decodeTxEvent(event: JsonRpcEvent): responses.TxEvent;
    static decodeTx(response: JsonRpcSuccessResponse): responses.TxResponse;
    static decodeTxSearch(response: JsonRpcSuccessResponse): responses.TxSearchResponse;
    static decodeValidators(response: JsonRpcSuccessResponse): responses.ValidatorsResponse;
}
