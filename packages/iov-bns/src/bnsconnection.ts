import equal from "fast-deep-equal";
import { Producer, Stream, Subscription } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpAtomicSwap,
  BcpAtomicSwapConnection,
  BcpBlockInfo,
  BcpBlockInfoInBlock,
  BcpPubkeyQuery,
  BcpQueryEnvelope,
  BcpQueryTag,
  BcpSwapQuery,
  BcpTicker,
  BcpTransactionState,
  BcpTxQuery,
  BlockHeader,
  BlockId,
  ChainId,
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  isPubkeyQuery,
  isQueryBySwapId,
  isQueryBySwapRecipient,
  isQueryBySwapSender,
  Nonce,
  OpenSwap,
  PostableBytes,
  PostTxResponse,
  PublicKeyBundle,
  SwapClaimTransaction,
  SwapState,
  SwapTimeoutTransaction,
  TokenTicker,
  TransactionId,
  TxReadCodec,
} from "@iov/bcp-types";
import { Encoding, Int53, Uint53 } from "@iov/encoding";
import { concat, DefaultValueProducer, fromListPromise, toListPromise, ValueAndUpdates } from "@iov/stream";
import {
  broadcastTxSyncSuccess,
  Client as TendermintClient,
  getTxEventHeight,
  StatusResponse,
  TxResponse,
} from "@iov/tendermint-rpc";

import { bnsCodec } from "./bnscodec";
import { ChainData, Context } from "./context";
import { decodeBlockchainNft, decodeNonce, decodeToken, decodeUsernameNft } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { bnsFromOrToTag, bnsNonceTag, bnsSwapQueryTags } from "./tags";
import {
  BnsBlockchainNft,
  BnsBlockchainsQuery,
  BnsUsernameNft,
  BnsUsernamesQuery,
  decodePubkey,
  Decoder,
  isBnsBlockchainsByChainIdQuery,
  isBnsUsernamesByChainAndAddressQuery,
  isBnsUsernamesByOwnerAddressQuery,
  isBnsUsernamesByUsernameQuery,
  Keyed,
  Result,
} from "./types";
import {
  arraysEqual,
  buildTxQuery,
  decodeBnsAddress,
  hashIdentifier,
  identityToAddress,
  isConfirmedWithSwapClaimOrTimeoutTransaction,
  isConfirmedWithSwapCounterTransaction,
} from "./util";

const { toAscii, toHex, toUtf8 } = Encoding;

// https://github.com/tendermint/tendermint/blob/v0.25.0/rpc/lib/types/types.go#L143
const tendermintInternalError = -32603;

interface TendermintRpcError {
  readonly code: number;
  readonly message: string;
  readonly data: string;
}

function parseTendermintRpcError(errorString: string): TendermintRpcError {
  const parsed = JSON.parse(errorString);
  if (typeof parsed.code !== "number") {
    throw new Error("Could not parse `code` property");
  }
  if (typeof parsed.message !== "string") {
    throw new Error("Could not parse `message` property");
  }
  if (typeof parsed.data !== "string") {
    throw new Error("Could not parse `data` property");
  }
  return parsed;
}

/**
 * Returns a filter that only passes when the
 * value is different than the last one
 */
function onChange<T>(): (val: T) => boolean {
  let oldVal: T | undefined;
  return (val: T): boolean => {
    if (val === oldVal) {
      return false;
    }
    oldVal = val;
    return true;
  };
}

/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export class BnsConnection implements BcpAtomicSwapConnection {
  public static async establish(url: string): Promise<BnsConnection> {
    const tm = await TendermintClient.connect(url);
    const chainData = await this.initialize(tm);
    return new BnsConnection(tm, bnsCodec, chainData);
  }

  private static async initialize(tmClient: TendermintClient): Promise<ChainData> {
    const status = await tmClient.status();
    const chainId = status.nodeInfo.network as ChainId;

    // inlining getAllTickers
    const res = await performQuery(tmClient, "/tokens?prefix", Uint8Array.from([]));
    const parser = createParser(codecImpl.namecoin.Token, "tkn:");
    const data = res.results.map(parser).map(decodeToken);

    const toKeyValue = (t: BcpTicker): [string, BcpTicker] => [t.tokenTicker, t];
    const tickers = new Map(data.map(toKeyValue));
    return { chainId, tickers };
  }

  private readonly tmClient: TendermintClient;
  private readonly codec: TxReadCodec;
  private readonly chainData: ChainData;
  private readonly context: Context;

  /**
   * Private constructor to hide package private types from the public interface
   *
   * Use BnsConnection.establish to get a BnsConnection.
   */
  private constructor(tmClient: TendermintClient, codec: TxReadCodec, chainData: ChainData) {
    this.tmClient = tmClient;
    this.codec = codec;
    this.chainData = chainData;
    this.context = new Context(chainData);
  }

  public disconnect(): void {
    this.tmClient.disconnect();
  }

  /**
   * The chain ID this connection is connected to
   *
   * We store this info from the initialization, no need to query every time
   */
  public chainId(): ChainId {
    return this.chainData.chainId;
  }

  public async height(): Promise<number> {
    const status = await this.status();
    return status.syncInfo.latestBlockHeight;
  }

  public status(): Promise<StatusResponse> {
    return this.tmClient.status();
  }

  public async postTx(tx: PostableBytes): Promise<PostTxResponse> {
    const postResponse = await this.tmClient.broadcastTxSync({ tx });
    if (!broadcastTxSyncSuccess(postResponse)) {
      throw new Error(JSON.stringify(postResponse, null, 2));
    }
    const transactionId = Encoding.toHex(postResponse.hash).toUpperCase() as TransactionId;

    // can be undefined as we cannot guarantee it assigned before the caller unsubscribes from the stream
    let blockHeadersSubscription: Subscription | undefined;

    const firstEvent: BcpBlockInfo = { state: BcpTransactionState.Pending };
    let lastEventSent: BcpBlockInfo = firstEvent;
    const blockInfoProducer = new DefaultValueProducer<BcpBlockInfo>(firstEvent, {
      onStarted: async () => {
        try {
          // we utilize liveTx to implement a _search or watch_ mechanism since we do not know
          // if the transaction is already committed when the producer is started
          const searchResult = await toListPromise(this.liveTx({ id: transactionId }), 1);
          const transactionHeight = searchResult[0].height;
          const transactionResult = searchResult[0].result;

          // Don't do any heavy work (like subscribing to block headers) before we got the
          // search result. For some transactions this will never resolve.

          {
            const inBlockEvent: BcpBlockInfoInBlock = {
              state: BcpTransactionState.InBlock,
              height: transactionHeight,
              confirmations: 1,
              result: transactionResult,
            };
            blockInfoProducer.update(inBlockEvent);
            lastEventSent = inBlockEvent;
          }

          blockHeadersSubscription = this.watchBlockHeaders().subscribe({
            next: async blockHeader => {
              const event: BcpBlockInfo = {
                state: BcpTransactionState.InBlock,
                height: transactionHeight,
                confirmations: blockHeader.height - transactionHeight + 1,
                result: transactionResult,
              };

              if (!equal(event, lastEventSent)) {
                blockInfoProducer.update(event);
                lastEventSent = event;
              }
            },
            complete: () => blockInfoProducer.error("Block header stream stopped. This must not happen."),
            error: error => blockInfoProducer.error(error),
          });
        } catch (error) {
          blockInfoProducer.error(error);
        }
      },
      onStop: () => {
        if (blockHeadersSubscription) {
          blockHeadersSubscription.unsubscribe();
        }
      },
    });

    return {
      blockInfo: new ValueAndUpdates(blockInfoProducer),
      transactionId: Encoding.toHex(postResponse.hash).toUpperCase() as TransactionId,
      log: postResponse.log,
    };
  }

  public async getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens", Encoding.toAscii(ticker));
    const parser = createParser(codecImpl.namecoin.Token, "tkn:");
    const data = res.results.map(parser).map(decodeToken);
    return dummyEnvelope(data);
  }

  public async getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens?prefix", Uint8Array.from([]));
    const parser = createParser(codecImpl.namecoin.Token, "tkn:");
    const data = res.results.map(parser).map(decodeToken);
    // Sort by ticker
    data.sort((a, b) => a.tokenTicker.localeCompare(b.tokenTicker));
    return dummyEnvelope(data);
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    let response: QueryResponse;
    if (isAddressQuery(query)) {
      response = await this.query("/wallets", decodeBnsAddress(query.address).data);
    } else if (isPubkeyQuery(query)) {
      const address = identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey });
      response = await this.query("/wallets", decodeBnsAddress(address).data);
    } else {
      response = await this.query("/wallets/name", Encoding.toAscii(query.name));
    }

    const parser = createParser(codecImpl.namecoin.Wallet, "wllt:");
    const walletDatas = response.results.map(parser).map(iwallet => this.context.wallet(iwallet));

    if (walletDatas.length === 0) {
      return dummyEnvelope([]);
    }
    const walletData = walletDatas[0];

    const walletAddress = walletData.address;

    let pubkey: PublicKeyBundle | undefined;
    if (isPubkeyQuery(query)) {
      pubkey = query.pubkey;
    } else {
      const res = await this.query("/auth", decodeBnsAddress(walletAddress).data);
      const userDataParser = createParser(codecImpl.sigs.UserData, "sigs:");
      const ipubkeys = res.results.map(userDataParser).map(ud => ud.pubkey);
      const ipubkey = ipubkeys.length >= 1 ? ipubkeys[0] : undefined;
      pubkey = ipubkey ? decodePubkey(ipubkey) : undefined;
    }

    return dummyEnvelope([
      {
        ...walletData,
        pubkey: pubkey,
      },
    ]);
  }

  public async getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;
    const response = await this.query("/auth", decodeBnsAddress(address).data);
    const parser = createParser(codecImpl.sigs.UserData, "sigs:");
    const nonces = response.results.map(parser).map(decodeNonce);

    switch (nonces.length) {
      case 0:
        return new Int53(0) as Nonce;
      case 1:
        return nonces[0];
      default:
        throw new Error(`Got unexpected number of nonce results: ${nonces.length}`);
    }
  }

  /**
   * All matching swaps that are open (from app state)
   */
  public async getSwapFromState(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>> {
    const doQuery = (): Promise<QueryResponse> => {
      if (isQueryBySwapId(query)) {
        return this.query("/escrows", query.swapid);
      } else if (isQueryBySwapSender(query)) {
        return this.query("/escrows/sender", decodeBnsAddress(query.sender).data);
      } else if (isQueryBySwapRecipient(query)) {
        return this.query("/escrows/recipient", decodeBnsAddress(query.recipient).data);
      } else {
        // if (isQueryBySwapHash(query))
        return this.query("/escrows/arbiter", hashIdentifier(query.hashlock));
      }
    };

    const res = await doQuery();
    const parser = createParser(codecImpl.escrow.Escrow, "esc:");
    const data = res.results.map(parser).map(escrow => this.context.swapOffer(escrow));
    return dummyEnvelope(data);
  }

  /**
   * All matching swaps that are open (in app state)
   *
   * To get claimed and returned, we need to look at the transactions.... TODO
   */
  public async getSwap(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>> {
    // we need to combine them all to see all transactions that affect the query
    const setTxs: ReadonlyArray<ConfirmedTransaction> = await this.searchTx({
      tags: [bnsSwapQueryTags(query, true)],
    });
    const delTxs: ReadonlyArray<ConfirmedTransaction> = await this.searchTx({
      tags: [bnsSwapQueryTags(query, false)],
    });

    // tslint:disable-next-line:readonly-array
    const offers: OpenSwap[] = setTxs
      .filter(isConfirmedWithSwapCounterTransaction)
      .map(tx => this.context.swapOfferFromTx(tx));

    // setTxs (esp on secondary index) may be a claim/timeout, delTxs must be a claim/timeout
    const release: ReadonlyArray<SwapClaimTransaction | SwapTimeoutTransaction> = [...setTxs, ...delTxs]
      .filter(isConfirmedWithSwapClaimOrTimeoutTransaction)
      .map(x => x.transaction);

    // tslint:disable-next-line:readonly-array
    const settled: BcpAtomicSwap[] = [];
    for (const rel of release) {
      const idx = offers.findIndex(x => arraysEqual(x.data.id, rel.swapId));
      const done = this.context.settleAtomicSwap(offers[idx], rel);
      offers.splice(idx, 1);
      settled.push(done);
    }

    return dummyEnvelope([...offers, ...settled]);
  }

  /**
   * Emits currentState (getSwap) as a stream, then sends updates for any matching swap
   *
   * This includes an open swap beind claimed/expired as well as a new matching swap being offered
   */
  public watchSwap(query: BcpSwapQuery): Stream<BcpAtomicSwap> {
    // we need to combine them all to see all transactions that affect the query
    const setTxs = this.liveTx({ tags: [bnsSwapQueryTags(query, true)] });
    const delTxs = this.liveTx({ tags: [bnsSwapQueryTags(query, false)] });

    const offers: Stream<OpenSwap> = setTxs
      .filter(isConfirmedWithSwapCounterTransaction)
      .map(tx => this.context.swapOfferFromTx(tx));

    // setTxs (esp on secondary index) may be a claim/timeout, delTxs must be a claim/timeout
    const releases: Stream<SwapClaimTransaction | SwapTimeoutTransaction> = Stream.merge(setTxs, delTxs)
      .filter(isConfirmedWithSwapClaimOrTimeoutTransaction)
      .map(confirmed => confirmed.transaction);

    // combine them and keep track of internal state in the mapper....
    // tslint:disable-next-line:readonly-array
    const open: OpenSwap[] = [];
    const combiner = (evt: OpenSwap | SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap => {
      switch (evt.kind) {
        case SwapState.Open:
          open.push(evt);
          return evt;
        default:
          // event is a swap claim/timeout, resolve an open swap and return new state
          const idx = open.findIndex(x => arraysEqual(x.data.id, evt.swapId));
          const done = this.context.settleAtomicSwap(open[idx], evt);
          open.splice(idx, 1);
          return done;
      }
    };

    return Stream.merge(offers, releases).map(combiner);
  }

  public async searchTx(txQuery: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    // this will paginate over all transactions, even if multiple pages.
    // FIXME: consider making a streaming interface here, but that will break clients
    const res = await this.tmClient.txSearchAll({ query: buildTxQuery(txQuery) });
    const chainId = await this.chainId();
    const currentHeight = await this.height();
    const mapper = ({ tx, hash, height, txResult }: TxResponse): ConfirmedTransaction => ({
      height: height,
      confirmations: currentHeight - height + 1,
      transactionId: Encoding.toHex(hash).toUpperCase() as TransactionId,
      log: txResult.log,
      result: txResult.data,
      ...this.codec.parseBytes(new Uint8Array(tx) as PostableBytes, chainId),
    });
    return res.txs.map(mapper);
  }

  /**
   * A stream of all transactions that match the tags from the present moment on
   */
  public listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction> {
    const chainId = this.chainId();
    const rawQuery = buildTxQuery(query);
    return this.tmClient
      .subscribeTx(rawQuery)
      .filter(transaction => {
        // Filter out events of transactions that did not make it into a block (like commit error events)
        const inBlock = transaction.result.code === 0;
        return inBlock;
      })
      .map(
        (transaction): ConfirmedTransaction => ({
          height: transaction.height,
          confirmations: 1, // assuming block height is current height when listening to events
          transactionId: Encoding.toHex(transaction.hash).toUpperCase() as TransactionId,
          log: transaction.result.log,
          result: transaction.result.data,
          ...this.codec.parseBytes(new Uint8Array(transaction.tx) as PostableBytes, chainId),
        }),
      );
  }

  /**
   * Does a search and then subscribes to all future changes.
   *
   * It returns a stream starting the array of all existing transactions
   * and then continuing with live feeds
   */
  public liveTx(txQuery: BcpTxQuery): Stream<ConfirmedTransaction> {
    const historyStream = fromListPromise(this.searchTx(txQuery));
    const updatesStream = this.listenTx(txQuery);
    const combinedStream = concat(historyStream, updatesStream);

    // remove duplicates
    const alreadySent = new Set<TransactionId>();
    const deduplicatedStream = combinedStream
      .filter(ct => !alreadySent.has(ct.transactionId))
      .debug(ct => alreadySent.add(ct.transactionId));

    return deduplicatedStream;
  }

  /**
   * Emits the blockheight for every block where a tx matching these tags is emitted
   */
  public changeTx(tags: ReadonlyArray<BcpQueryTag>): Stream<number> {
    return this.tmClient
      .subscribeTx(buildTxQuery({ tags: tags }))
      .map(getTxEventHeight)
      .filter(onChange<number>());
  }

  /**
   * A helper that triggers if the balance ever changes
   */
  public changeBalance(addr: Address): Stream<number> {
    return this.changeTx([bnsFromOrToTag(addr)]);
  }

  /**
   * A helper that triggers if the nonce every changes
   */
  public changeNonce(addr: Address): Stream<number> {
    return this.changeTx([bnsNonceTag(addr)]);
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    try {
      // tslint:disable-next-line:no-unused-expression
      new Uint53(height);
    } catch {
      throw new Error("Height must be a non-negative safe integer");
    }

    const { blockMetas } = await this.tmClient.blockchain(height, height).catch(originalError => {
      let parsedError: TendermintRpcError;
      try {
        parsedError = parseTendermintRpcError(originalError.message);
      } catch {
        // we cannot parse the error
        throw originalError;
      }

      if (
        parsedError.code === tendermintInternalError &&
        parsedError.data.match(new RegExp(`^min height ${height} can't be greater than max height [0-9]+$`))
      ) {
        // What we requested is greater than the current height
        throw new Error(`Header ${height} doesn't exist yet`);
      }

      // we got an unknown error
      throw originalError;
    });
    if (blockMetas.length < 1) {
      throw new Error("Received an empty list of block metas");
    }

    const blockId = Encoding.toHex(blockMetas[0].blockId.hash).toUpperCase() as BlockId;
    const { header } = blockMetas[0];
    if (header.height !== height) {
      throw new Error(`Requested header ${height} but got ${header.height}`);
    }

    return {
      id: blockId,
      height: header.height,
      time: header.time,
      transactionCount: header.numTxs,
    };
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    // TODO: this implementation is crazy but currently we have no way to calculate a
    // block ID from a block header

    let headersSubscription: Subscription;
    // create explicit producer because Steam.map() does not work with async function
    const producer: Producer<BlockHeader> = {
      start: listener => {
        headersSubscription = this.tmClient.subscribeNewBlockHeader().subscribe({
          next: header => {
            this.getBlockHeader(header.height)
              .then(blockHeader => listener.next(blockHeader))
              .catch(error => listener.error(error));
          },
          error: error => listener.error(error),
          complete: () => listener.error("Source stream completed"),
        });
      },
      stop: () => {
        headersSubscription.unsubscribe();
      },
    };
    return Stream.create(producer);
  }

  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  public changeBlock(): Stream<number> {
    return this.watchBlockHeaders().map(header => header.height);
  }

  /**
   * Gets current balance and emits an update every time it changes
   */
  public watchAccount(account: BcpAccountQuery): Stream<BcpAccount | undefined> {
    if (!isAddressQuery(account)) {
      throw new Error("watchAccount requires an address, not name, to watch");
    }
    // oneAccount normalizes the BcpEnvelope to just get the
    // one account we want, or undefined if nothing there
    const oneAccount = async (): Promise<BcpAccount | undefined> => {
      const acct = await this.getAccount(account);
      return acct.data.length < 1 ? undefined : acct.data[0];
    };

    return concat(
      Stream.fromPromise(oneAccount()),
      this.changeBalance(account.address)
        .map(() => Stream.fromPromise(oneAccount()))
        .flatten(),
    );
  }

  /**
   * Gets current nonce and emits an update every time it changes
   */
  public watchNonce(query: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    const currentStream = Stream.fromPromise(this.getNonce(query));
    const updatesStream = this.changeNonce(address)
      .map(() => Stream.fromPromise(this.getNonce(query)))
      .flatten();

    return concat(currentStream, updatesStream);
  }

  public async getBlockchains(query: BnsBlockchainsQuery): Promise<ReadonlyArray<BnsBlockchainNft>> {
    // https://github.com/iov-one/weave/blob/v0.9.2/x/nft/username/handler_test.go#L207
    let results: ReadonlyArray<Result>;
    if (isBnsBlockchainsByChainIdQuery(query)) {
      results = (await this.query("/nft/blockchains", toUtf8(query.chainId))).results;
    } else {
      throw new Error("Unsupported query");
    }

    const parser = createParser(codecImpl.blockchain.BlockchainToken, "bchnft:");
    const nfts = results.map(parser).map(decodeBlockchainNft);
    return nfts;
  }

  public async getUsernames(query: BnsUsernamesQuery): Promise<ReadonlyArray<BnsUsernameNft>> {
    // https://github.com/iov-one/weave/blob/v0.9.2/x/nft/username/handler_test.go#L207
    let results: ReadonlyArray<Result>;
    if (isBnsUsernamesByUsernameQuery(query)) {
      results = (await this.query("/nft/usernames", toUtf8(query.username))).results;
    } else if (isBnsUsernamesByOwnerAddressQuery(query)) {
      const rawAddress = decodeBnsAddress(query.owner).data;
      results = (await this.query("/nft/usernames/owner", rawAddress)).results;
    } else if (isBnsUsernamesByChainAndAddressQuery(query)) {
      const pairSerialized = `${query.address}*${query.chain}`;
      results = (await this.query("/nft/usernames/chainaddr", toUtf8(pairSerialized))).results;
    } else {
      throw new Error("Unsupported query");
    }

    const parser = createParser(codecImpl.username.UsernameToken, "usrnft:");
    const nfts = results.map(parser).map(decodeUsernameNft);
    return nfts;
  }

  protected query(path: string, data: Uint8Array): Promise<QueryResponse> {
    return performQuery(this.tmClient, path, data);
  }
}

/**
 * Performs a query
 *
 * This is pulled out to be used in static initialzers as well
 */
async function performQuery(
  tmClient: TendermintClient,
  path: string,
  data: Uint8Array,
): Promise<QueryResponse> {
  const response = await tmClient.abciQuery({ path, data });
  const keys = codecImpl.app.ResultSet.decode(response.key).results;
  const values = codecImpl.app.ResultSet.decode(response.value).results;
  const results: ReadonlyArray<Result> = zip(keys, values);
  return { height: response.height, results };
}

/* Various helpers for parsing the results of querying abci */

export interface QueryResponse {
  readonly height?: number;
  readonly results: ReadonlyArray<Result>;
}

function createParser<T extends {}>(decoder: Decoder<T>, keyPrefix: string): (res: Result) => T & Keyed {
  const parser = (res: Result): T & Keyed => {
    const keyPrefixAsAscii = toAscii(keyPrefix);
    if (!keyPrefixAsAscii.every((byte, i) => byte === res.key[i])) {
      throw new Error(
        "Result does not start with expected prefix. " +
          `Expected prefix '${keyPrefix}' (0x${toHex(keyPrefixAsAscii)}) in 0x${toHex(res.key)}`,
      );
    }

    const val: T = decoder.decode(res.value);
    // bug: https://github.com/Microsoft/TypeScript/issues/13557
    // workaround from: https://github.com/OfficeDev/office-ui-fabric-react/blob/1dbfc5ee7c38e982282f13ef92884538e7226169/packages/foundation/src/createComponent.tsx#L62-L64
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign({}, val, { _id: res.key.slice(keyPrefix.length) });
  };
  return parser;
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
