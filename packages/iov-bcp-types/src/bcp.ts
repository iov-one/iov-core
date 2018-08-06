import { ChainId, PostableBytes, PublicKeyBundle, TxQuery } from "@iov/tendermint-types";

import { Address, SignedTransaction } from "./signables";
import { Nonce, TokenTicker } from "./transactions";

/*
Types defined to match
https://app.swaggerhub.com/apis/IOV.one/BOV/0.0.4#/basic/getAccounts

Only a subset currently implemented.
*/

export interface BcpQueryEnvelope<T extends BcpData> {
  readonly metadata: BcpQueryMetadata;
  readonly data: ReadonlyArray<T>;
}

export interface BcpQueryMetadata {
  readonly offset: number;
  readonly limit: number;
}

export type BcpData = BcpAccount | BcpNonce | BcpTicker;

export interface BcpAccount {
  readonly address: Address;
  readonly name?: string;
  readonly balance: ReadonlyArray<BcpCoin>;
}

export interface BcpCoin extends BcpTicker {
  readonly whole: number;
  readonly fractional: number;
}

export interface BcpNonce {
  readonly address: Address;
  readonly publicKey: PublicKeyBundle;
  readonly nonce: Nonce;
}

export interface BcpTicker {
  readonly tokenTicker: TokenTicker;
  readonly sigFigs: number;
  readonly tokenName?: string;
}

export interface BcpTransactionResponse {
  readonly metadata: {
    // status says if it succeeds
    readonly status: boolean;
  };
  readonly data: {
    readonly message: string;
  };
}

export interface BcpAddressQuery {
  readonly address: Address;
}

export interface BcpValueNameQuery {
  readonly name: string;
}

export type BcpAccountQuery = BcpAddressQuery | BcpValueNameQuery;

// CoreReader is a high-level interface to a blockchain node,
// abstracted over all blockchain types and communication channel.
// A direct connection or a proxy server should implement this.
// The implementation takes care to convert our internal types into
// the proper format for the blockchain.
//
// The CoreReader will most likely contain some private state to maintain
// the connection, subscription, and such.
export interface CoreReader {
  // // headers returns all headers in that range.
  // // If max is underfined, subscribe to all new headers
  // // If max is defined, but higher than current height,
  // // subscribe to all new headers until max.
  // readonly headers: (min?: number, max?: number) => Stream<Header>;

  // // block will query for one block if height is provider,
  // // returning it immediately if available, or as soon as it
  // // is produced, if in the future.
  // // If not height is provided, it will get most recent block
  // readonly block: (height?: number) => Promise<Block>;
  // // streamBlocks starts sending a stream of blocks from now on
  // readonly streamBlocks: () => Stream<Block>;

  // submitTx submits a signed tx as is notified on every state change
  readonly postTx: (tx: PostableBytes) => Promise<BcpTransactionResponse>;

  readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
  readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;

  readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
  readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;

  readonly chainId: () => Promise<ChainId>;
  readonly height: () => Promise<number>;
  // TODO----
  // various types of queries to get a stream of accounts...
  // streams current data and all changes
  // readonly watchAccount: (query: AccountQuery) => Stream<Account>;
  // readonly watchNonce: (query: AccountQuery) => Stream<AccountNonce>;

  // searchTx searches for all tx that match these tags and subscribes to new ones
  // watchTx is a subset, searching by TxID, not tags
  readonly searchTx: (query: TxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
}

export interface ConfirmedTransaction extends SignedTransaction {
  readonly height: number; // the block it was write on
  // TODO: TxData (result, code, tags...)
  // readonly tags: ReadonlyArray<Tag>;
  // readonly result?: Uint8Array;
  // readonly log?: string;
}
