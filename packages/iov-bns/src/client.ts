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
  TokenTicker,
  TxReadCodec,
  Web4Read,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  buildTxQuery,
  Client as TendermintClient,
  StatusResponse,
  txCommitSuccess,
  TxResponse,
} from "@iov/tendermint-rpc";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";

import * as codecImpl from "./codecimpl";
import { InitData, Normalize } from "./normalize";
import { bnsCodec } from "./txcodec";
import { Decoder, Keyed, Result } from "./types";

// queryByAddress is a type guard to use in the account-based queries
const queryByAddress = (query: BcpAccountQuery): query is BcpAddressQuery =>
  (query as BcpAddressQuery).address !== undefined;

// Client talks directly to the BNS blockchain and exposes the
// same interface we have with the BCP protocol.
// We can embed in web4 process or use this in a BCP-relay
export class Client implements Web4Read {
  public static fromOrToTag(addr: Address): Tag {
    const id = Uint8Array.from([...Encoding.toAscii("wllt:"), ...addr]);
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

  protected async initialize(): Promise<InitData> {
    const status = await this.status();
    const chainId = status.nodeInfo.network;
    const all = await this.getAllTickers();
    const toKeyValue = (t: BcpTicker): [string, BcpTicker] => [t.tokenTicker, t];
    const tickers = new Map(all.data.map(toKeyValue));
    return { chainId, tickers };
  }

  protected async query(path: string, data: Uint8Array): Promise<QueryResponse> {
    const q = await this.tmClient.abciQuery({ path, data });
    if (!q.key) {
      return { height: q.height, results: [] };
    }
    const keys = codecImpl.app.ResultSet.decode(q.key).results;
    const values = codecImpl.app.ResultSet.decode(q.value).results;
    const results: ReadonlyArray<Result> = zip(keys, values);
    return { height: q.height, results };
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
