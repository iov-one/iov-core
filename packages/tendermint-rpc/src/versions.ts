// This module exposes translators for multiple tendermint versions
// Pick a version that matches the server to properly encode the data types

import { JsonRpcRequest, JsonRpcSuccess, jsonRpcWith, throwIfError } from "./common";
import * as requests from "./requests";
import * as responses from "./responses";
import { RpcClient } from "./rpcclient";
import { v0_20 as v0_20_ } from "./v0-20";

// tslint:disable-next-line:variable-name
export const v0_20: Adaptor = v0_20_;

export interface Adaptor {
  readonly params: Params;
  readonly responses: Responses;
}

// Encoder is a generic that matches all methods of Params
export type Encoder<T extends requests.Request> = (req: T) => JsonRpcRequest;

// Decoder is a generic that matches all methods of Responses
export type Decoder<T extends responses.Response> = (res: JsonRpcSuccess) => T;

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
  readonly encodeTx: (req: requests.TxRequest) => JsonRpcRequest;
  readonly encodeTxSearch: (req: requests.TxSearchRequest) => JsonRpcRequest;
  readonly encodeValidators: (req: requests.ValidatorsRequest) => JsonRpcRequest;
}

export interface Responses {
  readonly decodeAbciInfo: (response: JsonRpcSuccess) => responses.AbciInfoResponse;
  readonly decodeAbciQuery: (response: JsonRpcSuccess) => responses.AbciQueryResponse;
  readonly decodeBroadcastTxSync: (response: JsonRpcSuccess) => responses.BroadcastTxSyncResponse;
  readonly decodeBroadcastTxAsync: (response: JsonRpcSuccess) => responses.BroadcastTxSyncResponse;
  readonly decodeBroadcastTxCommit: (response: JsonRpcSuccess) => responses.BroadcastTxCommitResponse;
}

// find adapter makes a status call with the client.
// if we cannot talk to the server or make sense of the response, throw an error
// otherwise, grab the tendermint version from the response and
// provide a compatible adaptor if available.
// throws an error if we don't support this version of tendermint
export const findAdaptor = async (client: RpcClient): Promise<Adaptor> => {
  const req = jsonRpcWith(requests.Method.STATUS);
  const response = await client.rpc(req);
  const result: any = throwIfError(response).result;

  if (!result || !result.node_info) {
    throw new Error("Unrecognized format for status response");
  }
  const version: string = result.node_info.version;
  if (version.startsWith("0.20.")) {
    return v0_20;
  }
  throw new Error(`Unsupported tendermint version: ${version}`);
};
