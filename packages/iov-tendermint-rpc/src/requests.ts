import { Tag, TxQuery } from "@iov/tendermint-types";

import { JsonRpcRequest, jsonRpcWith } from "./common";
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
  SUBSCRIBE = "subscribe",
  TX = "tx",
  TX_SEARCH = "tx_search",
  VALIDATORS = "validators",
  UNSUBSCRIBE = "unsubscribe",
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

export interface BlockRequest {
  readonly method: Method.BLOCK;
  readonly params: {
    readonly height?: number;
  };
}

export interface BlockchainRequest {
  readonly method: Method.BLOCKCHAIN;
  readonly params: {
    readonly minHeight?: number;
    readonly maxHeight?: number;
  };
}

export interface BlockResultsRequest {
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

export interface CommitRequest {
  readonly method: Method.COMMIT;
  readonly params: {
    readonly height?: number;
  };
}

export interface GenesisRequest {
  readonly method: Method.GENESIS;
}

export interface HealthRequest {
  readonly method: Method.HEALTH;
}

export interface StatusRequest {
  readonly method: Method.STATUS;
}

export interface SubscribeRequest {
  readonly method: Method.SUBSCRIBE;
  readonly type: SubscriptionEventType;
}

export interface SubscribeRequestQuery {
  readonly tags: ReadonlyArray<Tag>;
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

export interface ValidatorsRequest {
  readonly method: Method.VALIDATORS;
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

export const buildTxQuery = (query: TxQuery): QueryString => {
  const tags: ReadonlyArray<string> = query.tags.map(buildTagQuery);
  const opts: ReadonlyArray<string | false> = [
    !!query.height && `tx.height=${query.height}`,
    !!query.minHeight && `tx.height>${query.minHeight}`,
    !!query.maxHeight && `tx.height<${query.maxHeight}`,
  ];
  const result: string = [...tags, ...opts.filter(x => !!x)].join(" AND ");
  return result as QueryString;
};

export const buildTagQuery = (tag: Tag): string => `${tag.key}='${tag.value}'`;
