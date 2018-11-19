import { JsonRpcRequest } from "../common";
import * as requests from "../requests";
/***** queries *****/
export declare class Params extends requests.DefaultParams {
    static encodeAbciQuery(req: requests.AbciQueryRequest): JsonRpcRequest;
    static encodeBlock(req: requests.BlockRequest): JsonRpcRequest;
    static encodeBlockchain(req: requests.BlockchainRequest): JsonRpcRequest;
    static encodeBlockResults(req: requests.BlockResultsRequest): JsonRpcRequest;
    static encodeBroadcastTx(req: requests.BroadcastTxRequest): JsonRpcRequest;
    static encodeCommit(req: requests.CommitRequest): JsonRpcRequest;
    static encodeSubscribe(req: requests.SubscribeRequest): JsonRpcRequest;
    static encodeTx(req: requests.TxRequest): JsonRpcRequest;
    static encodeTxSearch(req: requests.TxSearchRequest): JsonRpcRequest;
    static encodeValidators(req: requests.ValidatorsRequest): JsonRpcRequest;
}
