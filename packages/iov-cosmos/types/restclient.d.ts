import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import amino from "@tendermint/amino-js";
interface NodeInfo {
  readonly network: string;
}
interface NodeInfoResponse {
  readonly node_info: NodeInfo;
}
interface BlockMeta {
  readonly header: {
    readonly height: number;
    readonly time: string;
    readonly num_txs: number;
  };
  readonly block_id: {
    readonly hash: string;
  };
}
interface Block {
  readonly header: {
    readonly height: number;
  };
}
interface BlocksResponse {
  readonly block_meta: BlockMeta;
  readonly block: Block;
}
interface AuthAccountsResponse {
  readonly result: {
    readonly value: amino.BaseAccount;
  };
}
interface TxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly raw_log: string;
  readonly tx: amino.Tx;
}
interface PostTxsParams {}
interface PostTxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly code?: number;
  readonly raw_log?: string;
}
declare type RestClientResponse = NodeInfoResponse | BlocksResponse | AuthAccountsResponse | PostTxsResponse;
declare type BroadcastMode = "block" | "sync" | "async";
export declare class RestClient {
  private readonly baseUrl;
  private readonly postConfig;
  private readonly mode;
  constructor(url: string, mode?: BroadcastMode);
  get(path: string): Promise<RestClientResponse>;
  post(path: string, params: PostTxsParams): Promise<RestClientResponse>;
  nodeInfo(): Promise<NodeInfoResponse>;
  blocksLatest(): Promise<BlocksResponse>;
  blocks(height: number): Promise<BlocksResponse>;
  authAccounts(address: Address): Promise<AuthAccountsResponse>;
  txsById(id: TransactionId): Promise<TxsResponse>;
  postTx(tx: PostableBytes): Promise<PostTxsResponse>;
}
export {};
