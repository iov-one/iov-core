import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import amino, { unmarshalTx } from "@tendermint/amino-js";
import axios, { AxiosInstance } from "axios";

import {
  AuthAccountsResponse,
  BlocksResponse,
  BroadcastMode,
  CosmosClient,
  NodeInfoResponse,
  PostTxsParams,
  PostTxsResponse,
  SearchTxsResponse,
  TxsResponse,
} from "./cosmosclient";
import { AminoTx } from "./types";

// These types are the same as for CosmosClient but snake_cased

interface GaiaAuthAccountsResponse {
  readonly result: {
    readonly value: amino.BaseAccount;
  };
}

interface GaiaNodeInfoResponse {
  readonly node_info: {
    readonly network: string;
  };
}

interface GaiaBlockMeta {
  readonly header: {
    readonly height: number;
    readonly time: string;
    readonly num_txs: number;
  };
  readonly block_id: {
    readonly hash: string;
  };
}

interface GaiaBlocksResponse {
  readonly block_meta: GaiaBlockMeta;
  readonly block: {
    readonly header: {
      readonly height: number;
    };
  };
}

export interface GaiaTxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly raw_log: string;
  readonly tx: AminoTx;
}

interface GaiaSearchTxsResponse {
  readonly total_count: string;
  readonly count: string;
  readonly page_number: string;
  readonly page_total: string;
  readonly limit: string;
  readonly txs: readonly GaiaTxsResponse[];
}

interface GaiaPostTxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly code?: number;
  readonly raw_log?: string;
}

type GaiaResponse =
  | GaiaAuthAccountsResponse
  | GaiaBlocksResponse
  | GaiaNodeInfoResponse
  | GaiaSearchTxsResponse
  | GaiaTxsResponse
  | GaiaPostTxsResponse;

function parseAuthAccountsResponse(response: GaiaAuthAccountsResponse): AuthAccountsResponse {
  return {
    ...response,
  };
}

function parseNodeInfoResponse(response: GaiaNodeInfoResponse): NodeInfoResponse {
  return {
    ...response,
    nodeInfo: response.node_info,
  };
}

function parseBlocksResponse(response: GaiaBlocksResponse): BlocksResponse {
  return {
    ...response,
    blockMeta: {
      ...response.block_meta,
      blockId: response.block_meta.block_id,
      header: {
        ...response.block_meta.header,
        numTxs: response.block_meta.header.num_txs,
      },
    },
  };
}

function parseTxsResponse(response: GaiaTxsResponse): TxsResponse {
  return {
    ...response,
    rawLog: response.raw_log,
  };
}

function parseSearchTxsResponse(response: GaiaSearchTxsResponse): SearchTxsResponse {
  return {
    ...response,
    totalCount: response.total_count,
    pageNumber: response.page_number,
    pageTotal: response.page_total,
    txs: response.txs.map(parseTxsResponse),
  };
}

function parsePostTxsResponse(response: GaiaPostTxsResponse): PostTxsResponse {
  return {
    ...response,
    rawLog: response.raw_log,
  };
}

export class RestClient implements CosmosClient {
  private readonly client: AxiosInstance;
  // From https://cosmos.network/rpc/#/ICS0/post_txs
  // The supported broadcast modes include "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
  private readonly mode: BroadcastMode;

  public constructor(url: string, mode: BroadcastMode = "block") {
    const headers = {
      post: { "Content-Type": "application/json" },
    };
    this.client = axios.create({
      baseURL: url,
      headers: headers,
    });
    this.mode = mode;
  }

  public async get(path: string): Promise<GaiaResponse> {
    const { data } = await this.client.get(path);
    if (data === null) {
      throw new Error("Received null response from server");
    }
    return data;
  }

  public async post(path: string, params: PostTxsParams): Promise<GaiaResponse> {
    const { data } = await this.client.post(path, params);
    if (data === null) {
      throw new Error("Received null response from server");
    }
    return data;
  }

  public async nodeInfo(): Promise<NodeInfoResponse> {
    const response = (await this.get("/node_info")) as any;
    if (!response.node_info || !response.node_info.network) {
      throw new Error("Unexpected response data format");
    }
    console.log(response);
    return parseNodeInfoResponse(response);
  }

  public async blocksLatest(): Promise<BlocksResponse> {
    const response = (await this.get("/blocks/latest")) as any;
    if (!response.block || !response.block_meta) {
      throw new Error("Unexpected response data format");
    }
    return parseBlocksResponse(response);
  }

  public async blocks(height: number): Promise<BlocksResponse> {
    const response = (await this.get(`/blocks/${height}`)) as any;
    if (!response.block || !response.block_meta) {
      throw new Error("Unexpected response data format");
    }
    return parseBlocksResponse(response);
  }

  public async authAccounts(address: Address, height?: string): Promise<AuthAccountsResponse> {
    const path =
      height === undefined ? `/auth/accounts/${address}` : `/auth/accounts/${address}?tx.height=${height}`;
    const response = (await this.get(path)) as any;
    if (response.result.type !== "cosmos-sdk/Account") {
      throw new Error("Unexpected response data format");
    }
    return parseAuthAccountsResponse(response);
  }

  public async txs(query: string): Promise<SearchTxsResponse> {
    const response = (await this.get(`/txs?${query}`)) as any;
    if (!response.txs) {
      throw new Error("Unexpected response data format");
    }
    return parseSearchTxsResponse(response);
  }

  public async txsById(id: TransactionId): Promise<TxsResponse> {
    const response = (await this.get(`/txs/${id}`)) as any;
    if (!response.tx) {
      throw new Error("Unexpected response data format");
    }
    return parseTxsResponse(response);
  }

  public async postTx(tx: PostableBytes): Promise<PostTxsResponse> {
    const unmarshalled = unmarshalTx(tx, true);
    const params = {
      tx: unmarshalled.value,
      mode: this.mode,
    };
    const response = (await this.post("/txs", params)) as any;
    if (!response.txhash) {
      throw new Error("Unexpected response data format");
    }
    return parsePostTxsResponse(response);
  }
}
