import equal from "fast-deep-equal";
import { Stream, Subscription } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpAtomicSwap,
  BcpAtomicSwapConnection,
  BcpPubkeyQuery,
  BcpQueryEnvelope,
  BcpSwapQuery,
  BcpTicker,
  BcpTxQuery,
  BlockHeader,
  BlockId,
  BlockInfo,
  BlockInfoFailed,
  BlockInfoSucceeded,
  ChainId,
  ConfirmedTransaction,
  dummyEnvelope,
  FailedTransaction,
  isConfirmedTransaction,
  isFailedTransaction,
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
  TransactionState,
  TxReadCodec,
} from "@iov/bcp-types";
import { Encoding, Int53, Uint53 } from "@iov/encoding";
import { concat, DefaultValueProducer, fromListPromise, ValueAndUpdates } from "@iov/stream";
import {
  broadcastTxSyncSuccess,
  Client as TendermintClient,
  getTxEventHeight,
  StatusResponse,
} from "@iov/tendermint-rpc";

import { bnsCodec } from "./bnscodec";
import { ChainData, Context } from "./context";
import { decodeBlockchainNft, decodeNonce, decodeToken, decodeUsernameNft } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { bnsNonceTag, bnsSwapQueryTags } from "./tags";
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
    let transactionSubscription: Subscription | undefined;
    let blockHeadersSubscription: Subscription | undefined;

    const firstEvent: BlockInfo = { state: TransactionState.Pending };
    let lastEventSent: BlockInfo = firstEvent;
    const blockInfoProducer = new DefaultValueProducer<BlockInfo>(firstEvent, {
      onStarted: () => {
        transactionSubscription = this.liveTx({ id: transactionId }).subscribe({
          next: searchResult => {
            if (isFailedTransaction(searchResult)) {
              const errorEvent: BlockInfoFailed = {
                state: TransactionState.Failed,
                code: searchResult.code,
                message: searchResult.message,
              };
              blockInfoProducer.update(errorEvent);
              lastEventSent = errorEvent;
              return;
            }

            // Don't do any heavy work (like subscribing to block headers) before we got the
            // search result.

            const transactionHeight = searchResult.height;
            const transactionResult = searchResult.result;

            {
              const inBlockEvent: BlockInfoSucceeded = {
                state: TransactionState.Succeeded,
                height: transactionHeight,
                confirmations: 1,
                result: transactionResult,
              };
              blockInfoProducer.update(inBlockEvent);
              lastEventSent = inBlockEvent;
            }

            blockHeadersSubscription = this.watchBlockHeaders().subscribe({
              next: async blockHeader => {
                const event: BlockInfo = {
                  state: TransactionState.Succeeded,
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
          },
          error: error => blockInfoProducer.error(error),
        });
      },
      onStop: () => {
        if (transactionSubscription) {
          transactionSubscription.unsubscribe();
        }
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

  public async getTicker(ticker: TokenTicker): Promise<BcpTicker | undefined> {
    const res = await this.query("/tokens", Encoding.toAscii(ticker));
    const parser = createParser(codecImpl.namecoin.Token, "tkn:");
    const data = res.results.map(parser).map(decodeToken);
    switch (data.length) {
      case 0:
        return undefined;
      case 1:
        return data[0];
      default:
        throw new Error("Received unexpected number of tickers");
    }
  }

  public async getAllTickers(): Promise<ReadonlyArray<BcpTicker>> {
    const res = await this.query("/tokens?prefix", Uint8Array.from([]));
    const parser = createParser(codecImpl.namecoin.Token, "tkn:");
    const data = res.results.map(parser).map(decodeToken);
    // Sort by ticker
    data.sort((a, b) => a.tokenTicker.localeCompare(b.tokenTicker));
    return data;
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpAccount | undefined> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    const response = await this.query("/wallets", decodeBnsAddress(address).data);
    const parser = createParser(codecImpl.namecoin.Wallet, "wllt:");
    const walletDatas = response.results.map(parser).map(iwallet => this.context.wallet(iwallet));

    if (walletDatas.length === 0) {
      return undefined;
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

    return {
      ...walletData,
      pubkey: pubkey,
    };
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

  public async getNonces(
    query: BcpAddressQuery | BcpPubkeyQuery,
    count: number,
  ): Promise<ReadonlyArray<Nonce>> {
    const checkedCount = new Uint53(count).toNumber();
    switch (checkedCount) {
      case 0:
        return [];
      default:
        // uint53 > 0
        const out = new Array<Nonce>();
        const firstNonce = await this.getNonce(query);
        out.push(firstNonce);
        for (let index = 1; index < checkedCount; index++) {
          out.push(new Int53(firstNonce.toNumber() + index) as Nonce);
        }
        return out;
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
    const setTxs: ReadonlyArray<ConfirmedTransaction> = (await this.searchTx({
      tags: [bnsSwapQueryTags(query, true)],
    })).filter(isConfirmedTransaction);
    const delTxs: ReadonlyArray<ConfirmedTransaction> = (await this.searchTx({
      tags: [bnsSwapQueryTags(query, false)],
    })).filter(isConfirmedTransaction);

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
    const setTxs = this.liveTx({ tags: [bnsSwapQueryTags(query, true)] }).filter(isConfirmedTransaction);
    const delTxs = this.liveTx({ tags: [bnsSwapQueryTags(query, false)] }).filter(isConfirmedTransaction);

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

  public async searchTx(
    txQuery: BcpTxQuery,
  ): Promise<ReadonlyArray<ConfirmedTransaction | FailedTransaction>> {
    // this will paginate over all transactions, even if multiple pages.
    // FIXME: consider making a streaming interface here, but that will break clients
    const res = await this.tmClient.txSearchAll({ query: buildTxQuery(txQuery) });
    const chainId = await this.chainId();
    const currentHeight = await this.height();

    return res.txs.map(
      (txResponse): ConfirmedTransaction | FailedTransaction => {
        const { tx, hash, height, result } = txResponse;
        const transactionId = Encoding.toHex(hash).toUpperCase() as TransactionId;

        if (result.code === 0) {
          return {
            height: height,
            confirmations: currentHeight - height + 1,
            transactionId: transactionId,
            log: result.log,
            result: result.data,
            ...this.codec.parseBytes(new Uint8Array(tx) as PostableBytes, chainId),
          };
        } else {
          const failed: FailedTransaction = {
            transactionId: transactionId,
            code: result.code,
            message: result.log,
          };
          return failed;
        }
      },
    );
  }

  /**
   * A stream of all transactions that match the tags from the present moment on
   */
  public listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
    const chainId = this.chainId();
    const rawQuery = buildTxQuery(query);
    return this.tmClient.subscribeTx(rawQuery).map(
      (transaction): ConfirmedTransaction | FailedTransaction => {
        const transactionId = Encoding.toHex(transaction.hash).toUpperCase() as TransactionId;

        if (transaction.result.code === 0) {
          return {
            height: transaction.height,
            confirmations: 1, // assuming block height is current height when listening to events
            transactionId: transactionId,
            log: transaction.result.log,
            result: transaction.result.data,
            ...this.codec.parseBytes(new Uint8Array(transaction.tx) as PostableBytes, chainId),
          };
        } else {
          const failed: FailedTransaction = {
            transactionId: transactionId,
            code: transaction.result.code,
            message: transaction.result.log,
          };
          return failed;
        }
      },
    );
  }

  /**
   * Does a search and then subscribes to all future changes.
   *
   * It returns a stream starting the array of all existing transactions
   * and then continuing with live feeds
   */
  public liveTx(txQuery: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
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
  public changeTx(query: BcpTxQuery): Stream<number> {
    return this.tmClient
      .subscribeTx(buildTxQuery(query))
      .map(getTxEventHeight)
      .filter(onChange<number>());
  }

  /**
   * A helper that triggers if the balance ever changes
   */
  public changeBalance(addr: Address): Stream<number> {
    return this.changeTx({ sentFromOrTo: addr });
  }

  /**
   * A helper that triggers if the nonce every changes
   */
  public changeNonce(addr: Address): Stream<number> {
    return this.changeTx({ tags: [bnsNonceTag(addr)] });
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
    // TODO: ID unavailable because
    // - we cannot trivially calculate it https://github.com/iov-one/iov-core/issues/618 and
    // - want to avoid an extra query to the node which causes issues when trying to send to a disconnected socket
    // Leave it a dummy as long as no application strictly requires the ID
    const dummyBlockId = "block ID not implemented for Tendermint" as BlockId;

    return this.tmClient.subscribeNewBlockHeader().map(tmHeader => {
      return {
        id: dummyBlockId,
        height: tmHeader.height,
        time: tmHeader.time,
        transactionCount: tmHeader.numTxs,
      };
    });
  }

  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  public changeBlock(): Stream<number> {
    return this.watchBlockHeaders().map(header => header.height);
  }

  /**
   * Gets current balance and emits an update every time it changes
   */
  public watchAccount(query: BcpAccountQuery): Stream<BcpAccount | undefined> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    return concat(
      Stream.fromPromise(this.getAccount(query)),
      this.changeBalance(address)
        .map(() => Stream.fromPromise(this.getAccount(query)))
        .flatten(),
    );
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
    const nfts = results.map(parser).map(nft => decodeBlockchainNft(nft, this.chainId()));
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
    const nfts = results.map(parser).map(nft => decodeUsernameNft(nft, this.chainId()));
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
