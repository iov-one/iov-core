import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import amino from "@tendermint/amino-js";
import { AminoTx } from "./types";
export declare type BroadcastMode = "block" | "sync" | "async";
export interface TxValue {
  readonly msg?: readonly amino.Msg[];
  readonly fee?: amino.StdFee;
  readonly signatures?: readonly amino.StdSignature[];
  readonly memo?: string;
}
export interface NodeInfo {
  readonly network: string;
}
export interface NodeInfoResponse {
  readonly nodeInfo: NodeInfo;
}
interface BlockMeta {
  readonly header: {
    readonly height: number;
    readonly time: string;
    readonly numTxs: number;
  };
  readonly blockId: {
    readonly hash: string;
  };
}
export interface Block {
  readonly header: {
    readonly height: number;
  };
}
export interface BlocksResponse {
  readonly blockMeta: BlockMeta;
  readonly block: Block;
}
export interface AuthAccountsResponse {
  readonly result: {
    readonly value: amino.BaseAccount;
  };
}
export interface TxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly rawLog: string;
  readonly tx: AminoTx;
}
export interface SearchTxsResponse {
  readonly totalCount: string;
  readonly count: string;
  readonly pageNumber: string;
  readonly pageTotal: string;
  readonly limit: string;
  readonly txs: readonly TxsResponse[];
}
export interface PostTxsParams {
  readonly tx: TxValue;
  readonly mode: BroadcastMode;
}
export interface PostTxsResponse {
  readonly height: string;
  readonly txhash: string;
  readonly code?: number;
  readonly rawLog?: string;
}
export declare type CosmosClientResponse =
  | NodeInfoResponse
  | BlocksResponse
  | AuthAccountsResponse
  | TxsResponse
  | SearchTxsResponse
  | PostTxsResponse;
export interface CosmosClient {
  readonly authAccounts: (address: Address, height?: string) => Promise<AuthAccountsResponse>;
  readonly blocks: (height: number) => Promise<BlocksResponse>;
  readonly blocksLatest: () => Promise<BlocksResponse>;
  readonly nodeInfo: () => Promise<NodeInfoResponse>;
  readonly postTx: (tx: PostableBytes) => Promise<PostTxsResponse>;
  readonly txs: (query: string) => Promise<SearchTxsResponse>;
  readonly txsById: (id: TransactionId) => Promise<TxsResponse>;
}
export {};
