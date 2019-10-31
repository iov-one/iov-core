import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import amino from "@tendermint/amino-js";
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
declare type GaiaResponse =
  | GaiaAuthAccountsResponse
  | GaiaBlocksResponse
  | GaiaNodeInfoResponse
  | GaiaSearchTxsResponse
  | GaiaTxsResponse
  | GaiaPostTxsResponse;
export declare class RestClient implements CosmosClient {
  private readonly client;
  private readonly mode;
  constructor(url: string, mode?: BroadcastMode);
  get(path: string): Promise<GaiaResponse>;
  post(path: string, params: PostTxsParams): Promise<GaiaResponse>;
  nodeInfo(): Promise<NodeInfoResponse>;
  blocksLatest(): Promise<BlocksResponse>;
  blocks(height: number): Promise<BlocksResponse>;
  authAccounts(address: Address, height?: string): Promise<AuthAccountsResponse>;
  txs(query: string): Promise<SearchTxsResponse>;
  txsById(id: TransactionId): Promise<TxsResponse>;
  postTx(tx: PostableBytes): Promise<PostTxsResponse>;
}
export {};
