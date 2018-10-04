import { Stream } from "xstream";

import { ChainId, PostableBytes, PublicKeyBundle, Tag, TxId, TxQuery } from "@iov/tendermint-types";

import { Address, SignedTransaction, TxCodec } from "./signables";
import { Nonce, TokenTicker, UnsignedTransaction } from "./transactions";

/*
Types defined to match
https://app.swaggerhub.com/apis/IOV.one/BOV/0.0.4#/basic/getAccounts
Only a subset currently implemented.
*/

export interface BcpQueryEnvelope<T> {
  readonly metadata: BcpQueryMetadata;
  readonly data: ReadonlyArray<T>;
}

// dummyEnvelope just adds some plausible metadata to make bcp happy
export function dummyEnvelope<T>(data: ReadonlyArray<T>): BcpQueryEnvelope<T> {
  return {
    metadata: {
      offset: 0,
      limit: 100,
    },
    data: data,
  };
}

export interface BcpQueryMetadata {
  readonly offset: number;
  readonly limit: number;
}

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
  /**
   * A name to be displayed to the user which allows differentiation
   * of multiple tokens that use the same ticker.
   *
   * For example "Holo (HOT)" and "Hydro Protocol (HOT)" get the token
   * names and "Holo" and "Hydro Protocol".
   */
  readonly tokenName: string;
}

export interface BcpTransactionResponse {
  readonly metadata: {
    // status says if it succeeds
    readonly status: boolean;
    readonly height?: number;
  };
  readonly data: {
    readonly message: string;
    readonly txid: TxId; // a unique identifier (hash of the data)
    readonly result: Uint8Array;
  };
}

export interface ConfirmedTransaction<T extends UnsignedTransaction = UnsignedTransaction>
  extends SignedTransaction<T> {
  readonly height: number; // the block it was written to
  readonly txid: TxId; // a unique identifier (hash of the data)
  // Data from executing tx (result, code, tags...)
  readonly result: Uint8Array;
  readonly log: string;
  // readonly tags: ReadonlyArray<Tag>;
}

export interface BcpAddressQuery {
  readonly address: Address;
}

export interface BcpValueNameQuery {
  readonly name: string;
}

export type BcpAccountQuery = BcpAddressQuery | BcpValueNameQuery;

// a type checker to use in the account-based queries
export function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery {
  return (query as BcpAddressQuery).address !== undefined;
}

// BcpConnection is a high-level interface to a blockchain node,
// abstracted over all blockchain types and communication channel.
// A direct connection or a proxy server should implement this.
// The implementation takes care to convert our internal types into
// the proper format for the blockchain.
//
// BcpConnection is the minimal interface needed to be supported by any blockchain
// that is compatible with the bcp spec and iov-core library. This supports
// getting account balances, sending tokens, and observing the blockchain state.
//
// There are other optional interfaces that extend this functionality with
// features like atomic swap, NFTs, etc which may be implemented by any connector
// to enable enhanced features in the clients
export interface BcpConnection {
  readonly disconnect: () => void;

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

  // chainId, and height return generic info
  readonly chainId: () => ChainId;
  readonly height: () => Promise<number>;

  // these emits the new blockHeight on every block,
  // so you can trigger a custom response
  readonly changeBlock: () => Stream<number>;

  // submitTx submits a signed tx as is notified on every state change
  readonly postTx: (tx: PostableBytes) => Promise<BcpTransactionResponse>;

  // one-off queries to view current state
  readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
  readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;
  readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
  readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;

  // these query the currenct value and update a new value every time it changes
  readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;
  readonly watchNonce: (account: BcpAccountQuery) => Stream<BcpNonce | undefined>;

  // searchTx searches for all tx that match these tags and subscribes to new ones
  readonly searchTx: (query: TxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
  // listenTx subscribes to all newly added transactions with these tags
  readonly listenTx: (tags: ReadonlyArray<Tag>) => Stream<ConfirmedTransaction>;
  // liveTx returns a stream for all historical transactions that match
  // the query, along with all new transactions arriving from listenTx
  readonly liveTx: (txQuery: TxQuery) => Stream<ConfirmedTransaction>;
}

export interface ChainConnector {
  readonly client: () => Promise<BcpConnection>;
  readonly codec: TxCodec;
}
