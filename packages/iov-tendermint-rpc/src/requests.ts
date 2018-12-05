import { As } from "type-tagger";

import { JsonRpcRequest, jsonRpcWith } from "./common";

/**
 * RPC methods as documented in https://tendermint.com/rpc/
 *
 * Enum raw value must match the spelling in the "shell" example call (snake_case)
 */
export const enum Method {
  AbciInfo = "abci_info",
  AbciQuery = "abci_query",
  Block = "block",
  Blockchain = "blockchain",
  BlockResults = "block_results",
  BroadcastTxAsync = "broadcast_tx_async",
  BroadcastTxSync = "broadcast_tx_sync",
  BroadcastTxCommit = "broadcast_tx_commit",
  Commit = "commit",
  Genesis = "genesis",
  Health = "health",
  Status = "status",
  Subscribe = "subscribe",
  Tx = "tx",
  TxSearch = "tx_search",
  Validators = "validators",
  Unsubscribe = "unsubscribe",
}

export type Request =
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

/**
 * Raw values must match the tendermint event name
 *
 * @see https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants
 */
export enum SubscriptionEventType {
  NewBlock = "NewBlock",
  NewBlockHeader = "NewBlockHeader",
  Tx = "Tx",
}

export interface AbciInfoRequest {
  readonly method: Method.AbciInfo;
}

export interface AbciQueryRequest {
  readonly method: Method.AbciQuery;
  readonly params: AbciQueryParams;
}
export interface AbciQueryParams {
  readonly path: string;
  readonly data: Uint8Array;
  readonly height?: number;
  readonly trusted?: boolean;
}

export interface BlockRequest {
  readonly method: Method.Block;
  readonly params: {
    readonly height?: number;
  };
}

export interface BlockchainRequest {
  readonly method: Method.Blockchain;
  readonly params: BlockchainRequestParams;
}
export interface BlockchainRequestParams {
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface BlockResultsRequest {
  readonly method: Method.BlockResults;
  readonly params: {
    readonly height?: number;
  };
}

export interface BroadcastTxRequest {
  readonly method: Method.BroadcastTxAsync | Method.BroadcastTxSync | Method.BroadcastTxCommit;
  readonly params: BroadcastTxParams;
}
export interface BroadcastTxParams {
  readonly tx: Uint8Array;
}

export interface CommitRequest {
  readonly method: Method.Commit;
  readonly params: {
    readonly height?: number;
  };
}

export interface GenesisRequest {
  readonly method: Method.Genesis;
}

export interface HealthRequest {
  readonly method: Method.Health;
}

export interface StatusRequest {
  readonly method: Method.Status;
}

export interface SubscribeRequest {
  readonly method: Method.Subscribe;
  readonly query: {
    readonly type: SubscriptionEventType;
    readonly raw?: QueryString;
  };
}

export type QueryString = string & As<"query">;

export interface QueryTag {
  readonly key: string;
  readonly value: string;
}

export interface TxRequest {
  readonly method: Method.Tx;
  readonly params: TxParams;
}
export interface TxParams {
  readonly hash: Uint8Array;
  readonly prove?: boolean;
}

// TODO: clarify this type
export interface TxSearchRequest {
  readonly method: Method.TxSearch;
  readonly params: TxSearchParams;
}
export interface TxSearchParams {
  readonly query: QueryString;
  readonly prove?: boolean;
  readonly page?: number;
  readonly per_page?: number;
}

export interface ValidatorsRequest {
  readonly method: Method.Validators;
  readonly params: {
    readonly height?: number;
  };
}

// DefaultParams provides pass-through for calls with no params
export class DefaultParams {
  public static encodeAbciInfo(req: AbciInfoRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeGenesis(req: GenesisRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeHealth(req: HealthRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeStatus(req: StatusRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }
}

export interface BuildQueryComponents {
  readonly tags?: ReadonlyArray<QueryTag>;
  readonly raw?: QueryString;
}

export function buildQuery(components: BuildQueryComponents): QueryString {
  const tags = components.tags ? components.tags : [];
  const tagComponents = tags.map(tag => `${tag.key}='${tag.value}'`);
  const rawComponents = components.raw ? [components.raw] : [];

  return [...tagComponents, ...rawComponents].join(" AND ") as QueryString;
}
