import { JsonRpc } from "../common";
import { Base64String, HexString, QueryString } from "../encodings";
import { Method } from "../requests";

/***** queries *****/

export type JsonRpcRequest =
  | AbciInfoRequest
  | AbciQueryRequest
  | BlockRequest
  | BlockchainRequest
  | BlockResultsRequest
  | BroadcastTxRequest
  | CommitRequest
  | GenesisRequest
  | HealthRequest
  | StatusRequest
  | TxRequest
  | TxSearchRequest
  | ValidatorsRequest;

export interface AbciInfoRequest extends JsonRpc {
  readonly method: Method.ABCI_INFO;
}

export interface AbciQueryRequest extends JsonRpc {
  readonly method: Method.ABCI_QUERY;
  readonly params: AbciQueryParams;
}
export interface AbciQueryParams {
  readonly path: string;
  readonly data: HexString;
  readonly height?: number;
  readonly trusted?: boolean;
}

export interface BlockRequest extends JsonRpc {
  readonly method: Method.BLOCK;
  readonly params: {
    readonly height?: number;
  };
}

export interface BlockchainRequest extends JsonRpc {
  readonly method: Method.BLOCKCHAIN;
  readonly params: {
    readonly minHeight?: number;
    readonly maxHeight?: number;
  };
}

export interface BlockResultsRequest extends JsonRpc {
  readonly method: Method.BLOCK_RESULTS;
  readonly params: {
    readonly height?: number;
  };
}

export interface BroadcastTxRequest {
  readonly method: Method.BROADCAST_TX_ASYNC | Method.BROADCAST_TX_SYNC | Method.BROADCAST_TX_COMMIT;
  readonly params: {
    readonly tx: Base64String;
  };
}

export interface CommitRequest extends JsonRpc {
  readonly method: Method.COMMIT;
  readonly params: {
    readonly height?: number;
  };
}

export interface GenesisRequest extends JsonRpc {
  readonly method: Method.GENESIS;
}

export interface HealthRequest extends JsonRpc {
  readonly method: Method.HEALTH;
}

export interface StatusRequest extends JsonRpc {
  readonly method: Method.STATUS;
}

export interface TxRequest {
  readonly method: Method.TX;
  readonly params: {
    readonly hash: Base64String;
    readonly prove?: boolean;
  };
}

// TODO: clarify this type
export interface TxSearchRequest {
  readonly method: Method.TX_SEARCH;
  readonly params: {
    readonly query: QueryString;
    readonly prove?: boolean;
    readonly page?: number;
    readonly per_page?: number;
  };
}

export interface ValidatorsRequest extends JsonRpc {
  readonly method: Method.VALIDATORS;
  readonly params: {
    readonly height?: number;
  };
}
