import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import { unmarshalTx } from "@tendermint/amino-js";
import axios, { AxiosInstance } from "axios";

import {
  AuthAccountsResponse,
  Block,
  BlocksResponse,
  BroadcastMode,
  CosmosClient,
  NodeInfo,
  NodeInfoResponse,
  PostTxsParams,
  PostTxsResponse,
  SearchTxsResponse,
  TxsResponse,
} from "./cosmosclient";
import { AminoTx } from "./types";

// These types are the same as for CosmosClient but snake_cased

interface GaiaNodeInfoResponse {
  readonly node_info: NodeInfo;
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
  readonly block: Block;
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
  | AuthAccountsResponse
  | GaiaNodeInfoResponse
  | GaiaBlocksResponse
  | GaiaTxsResponse
  | GaiaSearchTxsResponse
  | GaiaPostTxsResponse;

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
    const responseData = (await this.get("/node_info")) as any;
    if (!responseData.node_info || !responseData.node_info.network) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      nodeInfo: responseData.node_info,
    };
  }

  public async blocksLatest(): Promise<BlocksResponse> {
    const responseData = (await this.get("/blocks/latest")) as any;
    if (!responseData.block || !responseData.block_meta) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      blockMeta: {
        ...responseData.block_meta,
        blockId: responseData.block_meta.block_id,
        header: {
          ...responseData.block_meta.header,
          numTxs: responseData.block_meta.header.num_txs,
        },
      },
    };
  }

  public async blocks(height: number): Promise<BlocksResponse> {
    const responseData = (await this.get(`/blocks/${height}`)) as any;
    if (!responseData.block || !responseData.block_meta) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      blockMeta: {
        ...responseData.block_meta,
        blockId: responseData.block_meta.block_id,
        header: {
          ...responseData.block_meta.header,
          numTxs: responseData.block_meta.header.num_txs,
        },
      },
    };
  }

  public async authAccounts(address: Address, height?: string): Promise<AuthAccountsResponse> {
    const path =
      height === undefined ? `/auth/accounts/${address}` : `/auth/accounts/${address}?tx.height=${height}`;
    const responseData = (await this.get(path)) as any;
    if (responseData.result.type !== "cosmos-sdk/Account") {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
    };
  }

  public async txs(query: string): Promise<SearchTxsResponse> {
    const responseData = (await this.get(`/txs?${query}`)) as any;
    if (!responseData.txs) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      totalCount: responseData.total_count,
      pageNumber: responseData.page_number,
      pageTotal: responseData.page_total,
      txs: responseData.txs.map((tx: GaiaTxsResponse) => ({
        ...tx,
        rawLog: tx.raw_log,
      })),
    };
  }

  public async txsById(id: TransactionId): Promise<TxsResponse> {
    const responseData = (await this.get(`/txs/${id}`)) as any;
    if (!responseData.tx) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      rawLog: responseData.raw_log,
    };
  }

  public async postTx(tx: PostableBytes): Promise<PostTxsResponse> {
    const unmarshalled = unmarshalTx(tx, true);
    const params = {
      tx: unmarshalled.value,
      mode: this.mode,
    };
    const responseData = (await this.post("/txs", params)) as any;
    if (!responseData.txhash) {
      throw new Error("Unexpected response data format");
    }
    return {
      ...responseData,
      rawLog: responseData.raw_log,
    };
  }
}
