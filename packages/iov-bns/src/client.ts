import { Stream } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpData,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  IovReader,
  TokenTicker,
  TxReadCodec,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  buildTxQuery,
  Client as TendermintClient,
  getTxEventHeight,
  StatusResponse,
  txCommitSuccess,
  TxEvent,
  TxResponse,
} from "@iov/tendermint-rpc";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";

import { bnsCodec } from "./bnscodec";
import * as codecImpl from "./codecimpl";
import { InitData, Normalize } from "./normalize";
import { streamPromise } from "./stream";
import { Decoder, Keyed, Result } from "./types";

// queryByAddress is a type guard to use in the account-based queries
const queryByAddress = (query: BcpAccountQuery): query is BcpAddressQuery =>
  (query as BcpAddressQuery).address !== undefined;

// onChange returns a filter than only passes when the
// value is different than the last one
function onChange<T>(): (val: T) => boolean {
  // tslint:disable-next-line:no-let
  let oldVal: T | undefined;
  return (val: T): boolean => {
    if (val === oldVal) {
      return false;
    }
    oldVal = val;
    return true;
  };
}

// Client talks directly to the BNS blockchain and exposes the
// same interface we have with the BCP protocol.
// We can embed in iov-core process or use this in a BCP-relay
export class Client implements IovReader {
  public static fromOrToTag(addr: Address): Tag {
    const id = Uint8Array.from([...Encoding.toAscii("wllt:"), ...addr]);
    const key = Encoding.toHex(id).toUpperCase();
    const value = "s"; // "s" for "set"
    return { key, value };
  }

  public static nonceTag(addr: Address): Tag {
    const id = Uint8Array.from([...Encoding.toAscii("sigs:"), ...addr]);
    const key = Encoding.toHex(id).toUpperCase();
    const value = "s"; // "s" for "set"
    return { key, value };
  }

  public static async connect(url: string): Promise<Client> {
    const tm = await TendermintClient.connect(url);
    return new Client(tm, bnsCodec);
  }

  protected readonly tmClient: TendermintClient;
  protected readonly codec: TxReadCodec;
  protected readonly initData: Promise<InitData>;

  constructor(tmClient: TendermintClient, codec: TxReadCodec) {
    this.tmClient = tmClient;
    this.codec = codec;
    // Note: this just requests the data and doesn't wait for the result
    // the response is preloaded the first time we query an account
    this.initData = this.initialize();
  }

  public disconnect(): void {
    this.tmClient.disconnect();
  }

  // we store this info from the initialization, no need to query every time
  public async chainId(): Promise<ChainId> {
    const data = await this.initData;
    return data.chainId;
  }

  public async height(): Promise<number> {
    const status = await this.status();
    return status.syncInfo.latestBlockHeight;
  }

  public status(): Promise<StatusResponse> {
    return this.tmClient.status();
  }

  public async postTx(tx: PostableBytes): Promise<BcpTransactionResponse> {
    const txresp = await this.tmClient.broadcastTxCommit({ tx });
    if (!txCommitSuccess(txresp)) {
      const { checkTx, deliverTx } = txresp;
      throw new Error(JSON.stringify({ checkTx, deliverTx }, null, 2));
    }

    const message = txresp.deliverTx ? txresp.deliverTx.log : txresp.checkTx.log;
    return {
      metadata: {
        height: txresp.height,
        status: txCommitSuccess(txresp),
      },
      data: {
        message: message || "",
      },
    };
  }

  public async getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens", Encoding.toAscii(ticker));
    const parser = parseMap(codecImpl.namecoin.Token, 4);
    const data = res.results.map(parser).map(Normalize.token);
    return dummyEnvelope(data);
  }

  public async getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens?prefix", Uint8Array.from([]));
    const parser = parseMap(codecImpl.namecoin.Token, 4);
    const data = res.results.map(parser).map(Normalize.token);
    return dummyEnvelope(data);
  }

  public async getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    const res = queryByAddress(account)
      ? this.query("/wallets", account.address)
      : this.query("/wallets/name", Encoding.toAscii(account.name));
    const parser = parseMap(codecImpl.namecoin.Wallet, 5);
    const parsed = (await res).results.map(parser);
    const initData = await this.initData;
    const data = parsed.map(Normalize.account(initData));
    return dummyEnvelope(data);
  }

  public async getNonce(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    // getAddress will do a lookup from name -> address if needed
    // make this an async function so easier to switch on return value
    const getAddress = async (): Promise<Uint8Array | undefined> => {
      if (queryByAddress(account)) {
        return account.address;
      }
      const addrRes = await this.getAccount(account);
      if (addrRes.data.length === 0) {
        return undefined;
      }
      return addrRes.data[0].address;
    };

    const addr = await getAddress();
    if (!addr) {
      return dummyEnvelope([]);
    }
    const res = await this.query("/auth", addr);

    const parser = parseMap(codecImpl.sigs.UserData, 5);
    const data = res.results.map(parser).map(Normalize.nonce);
    return dummyEnvelope(data);
  }

  public async searchTx(txQuery: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    const query = buildTxQuery(txQuery);
    const res = await this.tmClient.txSearch({ query });
    const chainId = await this.chainId();
    const mapper = ({ tx, height }: TxResponse): ConfirmedTransaction => ({
      height,
      ...this.codec.parseBytes(tx, chainId),
    });
    return res.txs.map(mapper);
  }

  // listenTx returns a stream of all transactions that match
  // the tags from the present moment on
  public listenTx(tags: ReadonlyArray<Tag>): Stream<ConfirmedTransaction> {
    const streamId = Stream.fromPromise(this.chainId());
    const txs = this.tmClient.subscribeTx(tags);

    // destructuring ftw (or is it too confusing?)
    const mapper = ([{ height, tx }, chainId]: [TxEvent, ChainId]): ConfirmedTransaction => ({
      height,
      ...this.codec.parseBytes(tx, chainId),
    });
    return Stream.combine(txs, streamId).map(mapper);
  }

  // liveTx does a search and then subscribes to all future changes.
  // It returns a stream starting the array of all existing transactions
  // and then continuing with live feeds
  public liveTx(txQuery: TxQuery): Stream<ConfirmedTransaction> {
    const history = streamPromise(this.searchTx(txQuery));
    const updates = this.listenTx(txQuery.tags);
    return Stream.merge(history, updates);
  }

  // changeFeed emits the blockheight for every block where a
  // tx matching these tags is emitted
  public changeFeed(tags: ReadonlyArray<Tag>): Stream<number> {
    return this.tmClient
      .subscribeTx(tags)
      .map(getTxEventHeight)
      .filter(onChange<number>());
  }

  // changeBalance is a helper that triggers if the balance ever changes
  public changeBalance(addr: Address): Stream<number> {
    return this.changeFeed([Client.fromOrToTag(addr)]);
  }

  // changeNonce is a helper that triggers if the nonce every changes
  public changeNonce(addr: Address): Stream<number> {
    return this.changeFeed([Client.nonceTag(addr)]);
  }

  // watch account gets current balance and emits an update every time
  // it changes
  public watchAccount(account: BcpAccountQuery): Stream<BcpAccount | undefined> {
    if (!queryByAddress(account)) {
      throw new Error("watchAccount requires an address, not name, to watch");
    }
    // oneAccount normalizes the BcpEnvelope to just get the
    // one account we want, or undefined if nothing there
    const oneAccount = async (): Promise<BcpAccount | undefined> => {
      const acct = await this.getAccount(account);
      return acct.data.length < 1 ? undefined : acct.data[0];
    };

    return Stream.merge(
      Stream.fromPromise(oneAccount()),
      this.changeBalance(account.address)
        .map(() => Stream.fromPromise(oneAccount()))
        .flatten(),
    );
  }

  protected async initialize(): Promise<InitData> {
    const status = await this.status();
    const chainId = status.nodeInfo.network;
    const all = await this.getAllTickers();
    const toKeyValue = (t: BcpTicker): [string, BcpTicker] => [t.tokenTicker, t];
    const tickers = new Map(all.data.map(toKeyValue));
    return { chainId, tickers };
  }

  protected async query(path: string, data: Uint8Array): Promise<QueryResponse> {
    const response = await this.tmClient.abciQuery({ path, data });
    const keys = codecImpl.app.ResultSet.decode(response.key).results;
    const values = codecImpl.app.ResultSet.decode(response.value).results;
    const results: ReadonlyArray<Result> = zip(keys, values);
    return { height: response.height, results };
  }
}

/* Various helpers for parsing the results of querying abci */

export interface QueryResponse {
  readonly height?: number;
  readonly results: ReadonlyArray<Result>;
}

function parseMap<T extends {}>(decoder: Decoder<T>, sliceKey: number): (res: Result) => T & Keyed {
  const mapper = (res: Result): T & Keyed => {
    const val: T = decoder.decode(res.value);
    // bug: https://github.com/Microsoft/TypeScript/issues/13557
    // workaround from: https://github.com/OfficeDev/office-ui-fabric-react/blob/1dbfc5ee7c38e982282f13ef92884538e7226169/packages/foundation/src/createComponent.tsx#L62-L64
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign({}, val, { _id: res.key.slice(sliceKey) });
  };
  return mapper;
}

// dummyEnvelope just adds some plausible metadata to make bcp happy
function dummyEnvelope<T extends BcpData>(data: ReadonlyArray<T>): BcpQueryEnvelope<T> {
  return {
    metadata: {
      offset: 0,
      limit: 100,
    },
    data: data,
  };
}

/* maybe a bit abstract, but maybe we can reuse... */

interface Join<T, U> {
  readonly key: T;
  readonly value: U;
}

function zip<T, U>(keys: ReadonlyArray<T>, values: ReadonlyArray<U>): ReadonlyArray<Join<T, U>> {
  if (keys.length !== values.length) {
    throw Error("Got " + keys.length + " keys but " + values.length + " values");
  }
  return keys.map((key, i) => ({ key, value: values[i] }));
}
