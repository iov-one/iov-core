import { JsonRpc } from "./common";
import { QueryString } from "./encodings";

// union type of all possible methods?
export const enum Method {
  ABCI_INFO = "abci_info",
  ABCI_QUERY = "abci_query",
  BLOCK = "block",
  BLOCKCHAIN = "blockchain",
  BLOCK_RESULTS = "block_results",
  BROADCAST_TX_ASYNC = "broadcast_tx_async",
  BROADCAST_TX_SYNC = "broadcast_tx_sync",
  BROADCAST_TX_COMMIT = "broadcast_tx_commit",
  COMMIT = "commit",
  GENESIS = "genesis",
  HEALTH = "health",
  STATUS = "status",
  TX = "tx",
  TX_SEARCH = "tx_search",
  VALIDATORS = "validators",
  // TODO: subscribe, unsubscribe, random commands
}

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

export interface AbciInfoRequest {
  readonly method: Method.ABCI_INFO;
}

export interface AbciQueryRequest {
  readonly method: Method.ABCI_QUERY;
  readonly params: AbciQueryParams;
}
export interface AbciQueryParams {
  readonly path: string;
  readonly data: Uint8Array;
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
  readonly params: BroadcastTxParams;
}
export interface BroadcastTxParams {
  readonly tx: Uint8Array;
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
  readonly params: TxParams;
}
export interface TxParams {
  readonly hash: Uint8Array;
  readonly prove?: boolean;
}

// TODO: clarify this type
export interface TxSearchRequest {
  readonly method: Method.TX_SEARCH;
  readonly params: TxSearchParams;
}
export interface TxSearchParams {
  readonly query: QueryString;
  readonly prove?: boolean;
  readonly page?: number;
  readonly per_page?: number;
}

export interface ValidatorsRequest extends JsonRpc {
  readonly method: Method.VALIDATORS;
  readonly params: {
    readonly height?: number;
  };
}
