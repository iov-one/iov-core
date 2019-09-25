import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  Algorithm,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapMerger,
  AtomicSwapQuery,
  BlockHeader,
  BlockId,
  BlockInfo,
  BlockInfoFailed,
  BlockInfoSucceeded,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  isAtomicSwapHashQuery,
  isAtomicSwapIdQuery,
  isAtomicSwapRecipientQuery,
  isAtomicSwapSenderQuery,
  isConfirmedTransaction,
  isFailedTransaction,
  isPubkeyQuery,
  LightTransaction,
  Nonce,
  OpenSwap,
  PostableBytes,
  PostTxResponse,
  PubkeyBundle,
  PubkeyBytes,
  PubkeyQuery,
  SwapAbortTransaction,
  SwapClaimTransaction,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TransactionState,
  TxReadCodec,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Encoding, Uint53 } from "@iov/encoding";
import { concat, DefaultValueProducer, dropDuplicates, fromListPromise, ValueAndUpdates } from "@iov/stream";
import { broadcastTxSyncSuccess, Client as TendermintClient, v0_31 } from "@iov/tendermint-rpc";
import equal from "fast-deep-equal";
import { Stream, Subscription } from "xstream";

import { bnsCodec } from "./bnscodec";
import { swapToAddress } from "./conditions";
import { ChainData, Context } from "./context";
import {
  decodeAmount,
  decodeCashConfiguration,
  decodeElectionRule,
  decodeElectorate,
  decodeProposal,
  decodePubkey,
  decodeToken,
  decodeUserData,
  decodeUsernameNft,
  decodeVote,
} from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { bnsSwapQueryTag } from "./tags";
import {
  BnsTx,
  BnsUsernameNft,
  BnsUsernamesQuery,
  Decoder,
  ElectionRule,
  Electorate,
  isBnsTx,
  isBnsUsernamesByOwnerQuery,
  isBnsUsernamesByUsernameQuery,
  Keyed,
  Proposal,
  Result,
  Validator,
  Vote,
} from "./types";
import {
  addressPrefix,
  buildQueryString,
  decodeBnsAddress,
  identityToAddress,
  IovBech32Prefix,
  isConfirmedWithSwapClaimOrAbortTransaction,
  isConfirmedWithSwapOfferTransaction,
} from "./util";

const { toAscii, toHex, toUtf8 } = Encoding;

// https://github.com/tendermint/tendermint/blob/v0.29.0/rpc/lib/types/types.go#L229
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

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function mapKindToBnsPath(transaction: BnsTx): string | undefined {
  // For full list track https://github.com/iov-one/weave/issues/908
  switch (transaction.kind) {
    // Token sends
    case "bcp/send":
      return "cash/send";
    // Atomic swaps
    case "bcp/swap_offer":
      return "aswap/create";
    case "bcp/swap_claim":
      return "aswap/release";
    case "bcp/swap_abort":
      return "aswap/return";
    // Usernames
    case "bns/register_username":
      return "username/register_token";
    case "bns/update_targets_of_username":
      return "username/change_token_targets";
    case "bns/transfer_username":
      return "username/transfer_token";
    // Escrows
    case "bns/create_escrow":
      return "escrow/create";
    case "bns/release_escrow":
      return "escrow/release";
    case "bns/return_escrow":
      return "escrow/return";
    case "bns/update_escrow_parties":
      return "escrow/update";
    // Multisignature contracts
    case "bns/create_multisignature_contract":
      return "multisig/create";
    case "bns/update_multisignature_contract":
      return "multisig/update";
    // Governance
    case "bns/create_proposal":
      return "gov/create_proposal";
    case "bns/vote":
      return "gov/vote";
    default:
      return undefined;
  }
}

// maybe a bit abstract, but maybe we can reuse...
interface Join<T, U> {
  readonly key: T;
  readonly value: U;
}

function zip<T, U>(keys: readonly T[], values: readonly U[]): readonly Join<T, U>[] {
  if (keys.length !== values.length) {
    throw Error("Got " + keys.length + " keys but " + values.length + " values");
  }
  return keys.map((key, i) => ({ key: key, value: values[i] }));
}

/* Various helpers for parsing the results of querying abci */

export interface QueryResponse {
  readonly height?: number;
  readonly results: readonly Result[];
}

function createParser<T extends {}>(decoder: Decoder<T>, keyPrefix: string): (result: Result) => T & Keyed {
  const keyPrefixAsAscii = toAscii(keyPrefix);

  function parseResult({ key, value }: Result): T & Keyed {
    if (!keyPrefixAsAscii.every((byte, i) => byte === key[i])) {
      throw new Error(
        "Result does not start with expected prefix. " +
          `Expected prefix '${keyPrefix}' (0x${toHex(keyPrefixAsAscii)}) in 0x${toHex(key)}`,
      );
    }

    const decoded = decoder.decode(value);
    return {
      ...decoded,
      _id: key.slice(keyPrefix.length),
    };
  }
  return parseResult;
}

/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export class BnsConnection implements AtomicSwapConnection {
  public static async establish(url: string): Promise<BnsConnection> {
    const tm = await TendermintClient.connect(url);
    const chainData = await this.initialize(tm);
    return new BnsConnection(tm, bnsCodec, chainData);
  }

  private static async initialize(tmClient: TendermintClient): Promise<ChainData> {
    const status = await tmClient.status();
    return { chainId: status.nodeInfo.network as ChainId };
  }

  private readonly tmClient: TendermintClient;
  private readonly codec: TxReadCodec;
  private readonly chainData: ChainData;
  private readonly context: Context;
  // tslint:disable-next-line: readonly-keyword
  private tokensCache: readonly Token[] | undefined;

  private get prefix(): IovBech32Prefix {
    return addressPrefix(this.chainId());
  }

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
    const status = await this.tmClient.status();
    return status.syncInfo.latestBlockHeight;
  }

  public async postTx(tx: PostableBytes): Promise<PostTxResponse> {
    const postResponse = await this.tmClient.broadcastTxSync({ tx: tx });
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
                height: searchResult.height,
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

  public async getToken(ticker: TokenTicker): Promise<Token | undefined> {
    return (await this.getAllTokens()).find(t => t.tokenTicker === ticker);
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    if (!this.tokensCache) {
      const res = await this.query("/tokens?prefix", Uint8Array.from([]));
      const parser = createParser(codecImpl.currency.TokenInfo, "tokeninfo:");
      const data = res.results.map(parser).map(decodeToken);
      // Sort by ticker
      data.sort((a, b) => a.tokenTicker.localeCompare(b.tokenTicker));
      // tslint:disable-next-line: no-object-mutation
      this.tokensCache = data;
    }
    return this.tokensCache;
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    const response = await this.query("/wallets", decodeBnsAddress(address).data);
    const parser = createParser(codecImpl.cash.Set, "cash:");
    const walletDatas = response.results.map(parser).map(iwallet => this.context.wallet(iwallet));

    if (walletDatas.length === 0) {
      return undefined;
    }
    const walletData = walletDatas[0];

    const walletAddress = walletData.address;

    let pubkey: PubkeyBundle | undefined;
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

  public async getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;
    const response = await this.query("/auth", decodeBnsAddress(address).data);
    const parser = createParser(codecImpl.sigs.UserData, "sigs:");
    const nonces = response.results
      .map(parser)
      .map(decodeUserData)
      .map(user => user.nonce);

    switch (nonces.length) {
      case 0:
        return 0 as Nonce;
      case 1:
        return nonces[0];
      default:
        throw new Error(`Got unexpected number of nonce results: ${nonces.length}`);
    }
  }

  public async getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]> {
    const checkedCount = new Uint53(count).toNumber();
    switch (checkedCount) {
      case 0:
        return [];
      default: {
        // uint53 > 0
        const out = new Array<Nonce>();
        const firstNonce = await this.getNonce(query);
        out.push(firstNonce);
        for (let index = 1; index < checkedCount; index++) {
          out.push((firstNonce + index) as Nonce);
        }
        return out;
      }
    }
  }

  /**
   * All matching swaps that are open (from app state)
   */
  public async getSwapsFromState(query: AtomicSwapQuery): Promise<readonly AtomicSwap[]> {
    const doQuery = async (): Promise<QueryResponse> => {
      if (isAtomicSwapIdQuery(query)) {
        return this.query("/aswaps", query.id.data);
      } else if (isAtomicSwapSenderQuery(query)) {
        return this.query("/aswaps/source", decodeBnsAddress(query.sender).data);
      } else if (isAtomicSwapRecipientQuery(query)) {
        return this.query("/aswaps/destination", decodeBnsAddress(query.recipient).data);
      } else if (isAtomicSwapHashQuery(query)) {
        return this.query("/aswaps/preimage_hash", query.hash);
      } else {
        throw new Error("Unexpected type of query");
      }
    };

    const res = await doQuery();
    const parser = createParser(codecImpl.aswap.Swap, "swap:");
    const data = res.results.map(parser).map(escrow => this.context.decodeOpenSwap(escrow));
    const withBalance = await Promise.all(data.map(s => this.updateSwapAmounts(s)));
    return withBalance;
  }

  /**
   * All matching swaps that are open (in app state)
   *
   * To get claimed and returned, we need to look at the transactions.... TODO
   */
  public async getSwaps(query: AtomicSwapQuery): Promise<readonly AtomicSwap[]> {
    // we need to combine them all to see all transactions that affect the query
    const setTxs = (await this.searchTxUnsigned({ tags: [bnsSwapQueryTag(query, true)] }))
      .map((tx): ConfirmedTransaction<UnsignedTransaction> | FailedTransaction => tx)
      .filter(isConfirmedTransaction);
    const delTxs = (await this.searchTxUnsigned({ tags: [bnsSwapQueryTag(query, false)] }))
      .map((tx): ConfirmedTransaction<UnsignedTransaction> | FailedTransaction => tx)
      .filter(isConfirmedTransaction);

    const offers: readonly OpenSwap[] = setTxs
      .filter(isConfirmedWithSwapOfferTransaction)
      .map(tx => this.context.swapOfferFromTx(tx));

    // setTxs (esp on secondary index) may be a claim/abort, delTxs must be a claim/abort
    const releases: readonly (SwapClaimTransaction | SwapAbortTransaction)[] = [...setTxs, ...delTxs]
      .filter(isConfirmedWithSwapClaimOrAbortTransaction)
      .map(x => x.transaction);

    const merger = new AtomicSwapMerger();
    for (const offer of offers) {
      merger.process(offer);
    }

    const settled = releases.map(release => merger.process(release)).filter(isDefined);
    const open = merger.openSwaps();
    return [...open, ...settled];
  }

  /**
   * Emits currentState (getSwap) as a stream, then sends updates for any matching swap
   *
   * This includes an open swap beind claimed/aborted as well as a new matching swap being offered
   */
  public watchSwaps(query: AtomicSwapQuery): Stream<AtomicSwap> {
    // we need to combine them all to see all transactions that affect the query
    const setTxs = this.liveTxUnsigned({ tags: [bnsSwapQueryTag(query, true)] }).filter(
      isConfirmedTransaction,
    );
    const delTxs = this.liveTxUnsigned({ tags: [bnsSwapQueryTag(query, false)] }).filter(
      isConfirmedTransaction,
    );

    const offers: Stream<OpenSwap> = setTxs
      .filter(isConfirmedWithSwapOfferTransaction)
      .map(tx => this.context.swapOfferFromTx(tx));

    // setTxs (esp on secondary index) may be a claim/abort, delTxs must be a claim/abort
    const releases: Stream<(SwapClaimTransaction | SwapAbortTransaction) & WithCreator> = Stream.merge(
      setTxs,
      delTxs,
    )
      .filter(isConfirmedWithSwapClaimOrAbortTransaction)
      .map(confirmed => confirmed.transaction);

    const merger = new AtomicSwapMerger();
    return Stream.merge(offers, releases)
      .map(event => merger.process(event))
      .filter(isDefined);
  }

  public async getTx(
    id: TransactionId,
  ): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction> {
    const searchResults = await this.searchTxUnsigned({ id: id });
    if (searchResults.length === 0) {
      throw new Error("Transaction does not exist");
    }
    if (searchResults.length > 1) {
      throw new Error("More than one transaction exists with this ID");
    }
    return searchResults[0];
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedTransaction<LightTransaction> | FailedTransaction)[]> {
    return this.searchTxUnsigned(query);
  }

  /**
   * A stream of all transactions that match the tags from the present moment on
   */
  public listenTx(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    return this.listenTxUnsigned(query).map(
      (transaction): ConfirmedTransaction<LightTransaction> | FailedTransaction => transaction,
    );
  }

  /**
   * Does a search and then subscribes to all future changes.
   *
   * It returns a stream starting the array of all existing transactions
   * and then continuing with live feeds
   */
  public liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    return this.liveTxUnsigned(query).map(
      (transaction): ConfirmedTransaction<LightTransaction> | FailedTransaction => transaction,
    );
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
    return this.tmClient.subscribeNewBlockHeader().map(tmHeader => {
      const blockId = Encoding.toHex(v0_31.hashBlock(tmHeader)).toUpperCase() as BlockId;
      return {
        id: blockId,
        height: tmHeader.height,
        time: tmHeader.time,
        transactionCount: tmHeader.numTxs,
      };
    });
  }

  /**
   * Gets current balance and emits an update every time it changes
   */
  public watchAccount(query: AccountQuery): Stream<Account | undefined> {
    const address = isPubkeyQuery(query)
      ? identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    return concat(
      Stream.fromPromise(this.getAccount(query)),
      this.tmClient
        .subscribeTx(buildQueryString({ sentFromOrTo: address }))
        .map(() => Stream.fromPromise(this.getAccount(query)))
        .flatten(),
    );
  }

  public async getValidators(): Promise<readonly Validator[]> {
    const response = await this.tmClient.validators();
    return response.results.map(
      (validator): Validator => {
        if (validator.pubkey.algorithm !== "ed25519") throw new Error("Got unsupported pubkey");

        return {
          pubkey: {
            algo: Algorithm.Ed25519,
            data: validator.pubkey.data as PubkeyBytes,
          },
          power: validator.votingPower,
        };
      },
    );
  }

  public async getElectorates(): Promise<readonly Electorate[]> {
    const results = (await this.query("/electorates?prefix", new Uint8Array([]))).results;
    const parser = createParser(codecImpl.gov.Electorate, "electorate:");
    const electorates = results.map(parser).map(electorate => decodeElectorate(this.prefix, electorate));
    return electorates;
  }

  public async getElectionRules(): Promise<readonly ElectionRule[]> {
    const results = (await this.query("/electionrules?prefix", new Uint8Array([]))).results;
    const parser = createParser(codecImpl.gov.ElectionRule, "electnrule:");
    const rules = results.map(parser).map(rule => decodeElectionRule(this.prefix, rule));
    return rules;
  }

  public async getProposals(): Promise<readonly Proposal[]> {
    const results = (await this.query("/proposals?prefix", new Uint8Array([]))).results;
    const parser = createParser(codecImpl.gov.Proposal, "proposal:");
    const proposals = results.map(parser).map(proposal => decodeProposal(this.prefix, proposal));
    return proposals;
  }

  public async getVotes(voter: Address): Promise<readonly Vote[]> {
    const { data } = decodeBnsAddress(voter);
    const { results } = await this.query("/votes/electors?prefix", data);
    const parser = createParser(codecImpl.gov.Vote, "vote:");
    const votes = results.map(parser).map(vote => decodeVote(this.prefix, vote));
    return votes;
  }

  public async getUsernames(query: BnsUsernamesQuery): Promise<readonly BnsUsernameNft[]> {
    let results: readonly Result[];
    if (isBnsUsernamesByUsernameQuery(query)) {
      results = (await this.query("/usernames", toUtf8(query.username))).results;
    } else if (isBnsUsernamesByOwnerQuery(query)) {
      const rawAddress = decodeBnsAddress(query.owner).data;
      results = (await this.query("/usernames/owner", rawAddress)).results;
    } else {
      throw new Error("Unsupported query");
    }

    const parser = createParser(codecImpl.username.Token, "tokens:");
    const nfts = results.map(parser).map(nft => decodeUsernameNft(nft, this.chainId()));
    return nfts;
  }

  public async getFeeQuote(transaction: UnsignedTransaction): Promise<Fee> {
    if (!isBnsTx(transaction)) {
      throw new Error("Received transaction of unsupported kind.");
    }
    // use product fee if it exists, otherwise fallback to default anti-spam fee
    const fee = (await this.getProductFee(transaction)) || (await this.getDefaultFee());
    return { tokens: fee };
  }

  public async withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T> {
    return { ...transaction, fee: await this.getFeeQuote(transaction) };
  }

  protected async query(path: string, data: Uint8Array): Promise<QueryResponse> {
    const response = await this.tmClient.abciQuery({ path: path, data: data });
    const keys = codecImpl.app.ResultSet.decode(response.key).results;
    const values = codecImpl.app.ResultSet.decode(response.value).results;
    const results: readonly Result[] = zip(keys, values);
    return { height: response.height, results: results };
  }

  // updateEscrowBalance will query for the proper balance and then update the accounts of escrow before
  // returning it. Designed to be used in a map chain.
  protected async updateSwapAmounts<T extends AtomicSwap>(swap: T): Promise<T> {
    const addr = swapToAddress(this.chainId(), swap.data);
    const account = await this.getAccount({ address: addr });
    const balance = account ? account.balance : [];
    return { ...swap, data: { ...swap.data, amounts: balance } };
  }

  /**
   * Queries the blockchain for the enforced anti-spam fee
   */
  protected async getDefaultFee(): Promise<Amount | undefined> {
    const { results } = await this.query("/", Encoding.toAscii("_c:cash"));
    if (results.length !== 1) {
      throw new Error(`Unexpected number of results for minimal fee. Expected: 1 Got: ${results.length}`);
    }
    const { minimalFee } = decodeCashConfiguration(codecImpl.cash.Configuration.decode(results[0].value));
    return minimalFee || undefined;
  }

  /**
   * Queries the blockchain for the enforced product fee for this kind of transaction.
   * Returns undefined if no product fee is defined
   */
  protected async getProductFee(transaction: BnsTx): Promise<Amount | undefined> {
    const path = mapKindToBnsPath(transaction);

    // TODO: add query handler to msgfee
    const { results } = await this.query("/", Encoding.toAscii(`msgfee:${path}`));
    if (results.length > 1) {
      throw new Error(`Unexpected number of results for product fee. Expected: 0/1 Got: ${results.length}`);
    }
    if (results.length === 0) {
      return undefined;
    }

    const parser = createParser(codecImpl.msgfee.MsgFee, "msgfee:");
    const fees = results
      .map(parser)
      .map(msg => msg.fee)
      .map(x => {
        if (x === null || x === undefined) {
          throw new Error("Could not decode missing fee");
        }
        return decodeAmount(x);
      });
    return fees.length > 0 ? fees[0] : undefined;
  }

  /**
   * The same as searchTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private async searchTxUnsigned(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction)[]> {
    // this will paginate over all transactions, even if multiple pages.
    // FIXME: consider making a streaming interface here, but that will break clients
    const res = await this.tmClient.txSearchAll({ query: buildQueryString(query) });
    const chainId = await this.chainId();
    const currentHeight = await this.height();

    return res.txs.map((txResponse):
      | ConfirmedAndSignedTransaction<UnsignedTransaction>
      | FailedTransaction => {
      const { tx, hash, height, result } = txResponse;
      const transactionId = Encoding.toHex(hash).toUpperCase() as TransactionId;

      if (result.code === 0) {
        return {
          height: height,
          confirmations: currentHeight - height + 1,
          transactionId: transactionId,
          log: result.log,
          result: result.data,
          ...this.codec.parseBytes((tx as Uint8Array) as PostableBytes, chainId),
        };
      } else {
        const failed: FailedTransaction = {
          height: height,
          transactionId: transactionId,
          code: result.code,
          message: result.log,
        };
        return failed;
      }
    });
  }

  /**
   * The same as listenTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private listenTxUnsigned(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    const chainId = this.chainId();
    const rawQuery = buildQueryString(query);
    return this.tmClient.subscribeTx(rawQuery).map((transaction):
      | ConfirmedTransaction<UnsignedTransaction>
      | FailedTransaction => {
      const transactionId = Encoding.toHex(transaction.hash).toUpperCase() as TransactionId;

      if (transaction.result.code === 0) {
        return {
          height: transaction.height,
          confirmations: 1, // assuming block height is current height when listening to events
          transactionId: transactionId,
          log: transaction.result.log,
          result: transaction.result.data,
          ...this.codec.parseBytes((transaction.tx as Uint8Array) as PostableBytes, chainId),
        };
      } else {
        const failed: FailedTransaction = {
          height: transaction.height,
          transactionId: transactionId,
          code: transaction.result.code,
          message: transaction.result.log,
        };
        return failed;
      }
    });
  }

  /**
   * The same as liveTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private liveTxUnsigned(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    const pendingSearchResults = this.searchTxUnsigned(query).then(results =>
      results.map((tx): ConfirmedTransaction<UnsignedTransaction> | FailedTransaction => tx),
    );
    const historyStream = fromListPromise(pendingSearchResults);
    const updatesStream = this.listenTxUnsigned(query);
    const combinedStream = concat(historyStream, updatesStream);
    const deduplicatedStream = combinedStream.compose(dropDuplicates(ct => ct.transactionId));
    return deduplicatedStream;
  }
}
