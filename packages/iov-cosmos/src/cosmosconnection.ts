/* eslint-disable @typescript-eslint/camelcase */
import {
  Account,
  AccountQuery,
  AddressQuery,
  Algorithm,
  BlockchainConnection,
  BlockHeader,
  BlockId,
  BlockInfo,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  isConfirmedTransaction,
  isPubkeyQuery,
  isSendTransaction,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyBytes,
  PubkeyQuery,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TransactionState,
  TxReadCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Uint53 } from "@iov/encoding";
import { concat, DefaultValueProducer, dropDuplicates, fromListPromise, ValueAndUpdates } from "@iov/stream";
import { Client as TendermintClient } from "@iov/tendermint-rpc";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import { CosmosBech32Prefix, pubkeyToAddress } from "./address";
import { Caip5 } from "./caip5";
import { cosmosCodec } from "./cosmoscodec";
import { decodeAmount, parseTxsResponse } from "./decode";
import { TxsResponse } from "./restclient";

const { fromBase64 } = Encoding;

interface ChainData {
  readonly chainId: ChainId;
}

// poll every 0.5 seconds (block time 1s)
const defaultPollInterval = 500;

function buildQueryString({
  height,
  id,
  maxHeight,
  minHeight,
  sentFromOrTo,
  signedBy,
  tags,
}: TransactionQuery): string {
  if ([maxHeight, minHeight, signedBy, tags].some(component => component !== undefined)) {
    throw new Error("Transaction query by maxHeight, minHeight, signedBy or tags not yet supported");
  }
  const heightComponent = height !== undefined ? `tx.height=${height}` : null;
  const hashComponent = id !== undefined ? `tx.hash=${id}` : null;
  const sentFromOrToComponent = sentFromOrTo !== undefined ? `message.sender=${sentFromOrTo}` : null;
  // TODO: Support senders and recipients
  // const sentFromOrToComponent = sentFromOrTo !== undefined ? `transfer.recipient=${sentFromOrTo}` : null;
  const components: readonly (string | null)[] = [heightComponent, hashComponent, sentFromOrToComponent];
  return components.filter(Boolean).join("&");
}

export class CosmosConnection implements BlockchainConnection {
  public static async establish(url: string): Promise<CosmosConnection> {
    const tmClient = await TendermintClient.connect(url);
    const chainData = await this.initialize(tmClient);
    return new CosmosConnection(tmClient, cosmosCodec, chainData);
  }

  private static async initialize(tmClient: TendermintClient): Promise<ChainData> {
    const { nodeInfo } = await tmClient.status();
    return { chainId: Caip5.encode(nodeInfo.network) };
  }

  private readonly tmClient: TendermintClient;
  private readonly codec: TxReadCodec;
  private readonly chainData: ChainData;
  private readonly primaryToken: Token;
  private readonly supportedTokens: readonly Token[];

  private get prefix(): CosmosBech32Prefix {
    return "cosmos";
  }

  private constructor(tmClient: TendermintClient, codec: TxReadCodec, chainData: ChainData) {
    this.tmClient = tmClient;
    this.codec = codec;
    this.chainData = chainData;
    this.primaryToken = {
      fractionalDigits: 6,
      tokenName: "Atom",
      tokenTicker: "ATOM" as TokenTicker,
    };
    this.supportedTokens = [this.primaryToken];
  }

  public disconnect(): void {
    return;
  }

  public chainId(): ChainId {
    return this.chainData.chainId;
  }

  public async height(): Promise<number> {
    const { block_meta } = await this.tmClient.blocksLatest();
    return block_meta.header.height;
  }

  public async getToken(searchTicker: TokenTicker): Promise<Token | undefined> {
    return (await this.getAllTokens()).find(({ tokenTicker }) => tokenTicker === searchTicker);
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    return this.supportedTokens;
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey, this.prefix) : query.address;
    const { result } = await this.tmClient.authAccounts(address);
    const account = result.value;
    const supportedCoins = account.coins.filter(({ denom }) =>
      this.supportedTokens.find(
        ({ tokenTicker }) => (tokenTicker === "ATOM" && denom === "uatom") || tokenTicker === denom,
      ),
    );
    return account.public_key === null
      ? undefined
      : {
          address: address,
          balance: supportedCoins.map(decodeAmount),
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromBase64(account.public_key.value) as PubkeyBytes,
          },
        };
  }

  public watchAccount(query: AccountQuery): Stream<Account | undefined> {
    const address = isPubkeyQuery(query)
      ? this.codec.identityToAddress({ chainId: this.chainId(), pubkey: query.pubkey })
      : query.address;

    return concat(
      Stream.fromPromise(this.getAccount(query)),
      this.tmClient
        .subscribeTx(buildQueryString({ sentFromOrTo: address }))
        .map(() => Stream.fromPromise(this.getAccount(query)))
        .flatten(),
    );
  }

  public async getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey, this.prefix) : query.address;
    const { result } = await this.tmClient.authAccounts(address);
    const account = result.value;
    return parseInt(account.sequence, 10) as Nonce;
  }

  public async getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]> {
    const checkedCount = new Uint53(count).toNumber();
    if (checkedCount === 0) {
      return [];
    }
    const firstNonce = await this.getNonce(query);
    return [...new Array(checkedCount)].map((_, i) => (firstNonce + i) as Nonce);
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    const { block_meta } = await this.tmClient.blocks(height);
    return {
      id: block_meta.block_id.hash as BlockId,
      height: block_meta.header.height,
      time: new ReadonlyDate(block_meta.header.time),
      transactionCount: block_meta.header.num_txs,
    };
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    throw new Error("not implemented");
  }

  public async getTx(
    id: TransactionId,
  ): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction> {
    try {
      const response = await this.tmClient.txsById(id);
      const chainId = await this.chainId();
      return this.parseAndPopulateTxResponse(response, chainId);
    } catch (error) {
      if (error.response.status === 404) {
        throw new Error("Transaction does not exist");
      }
      throw error;
    }
  }

  public async postTx(tx: PostableBytes): Promise<PostTxResponse> {
    const { txhash, raw_log } = await this.tmClient.postTx(tx);
    const transactionId = txhash as TransactionId;
    const firstEvent: BlockInfo = { state: TransactionState.Pending };
    let blockInfoInterval: NodeJS.Timeout;
    let lastEventSent: BlockInfo;
    const producer = new DefaultValueProducer<BlockInfo>(firstEvent, {
      onStarted: () => {
        blockInfoInterval = setInterval(async () => {
          const searchResult = (await this.searchTx({ id: transactionId })).find(() => true);
          if (searchResult) {
            const event: BlockInfo = isConfirmedTransaction(searchResult)
              ? {
                  state: TransactionState.Succeeded,
                  height: searchResult.height,
                  confirmations: searchResult.confirmations,
                }
              : {
                  state: TransactionState.Failed,
                  height: searchResult.height,
                  code: searchResult.code,
                  message: searchResult.message,
                };
            if (!equal(event, lastEventSent)) {
              producer.update(event);
              lastEventSent = event;
            }
          }
        }, defaultPollInterval);
      },
      onStop: () => clearInterval(blockInfoInterval),
    });
    return {
      blockInfo: new ValueAndUpdates<BlockInfo>(producer),
      transactionId: transactionId,
      log: raw_log,
    };
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedTransaction<UnsignedTransaction> | FailedTransaction)[]> {
    const queryString = buildQueryString(query);
    const chainId = this.chainId();
    const { txs: responses } = await this.tmClient.txs(queryString);
    return Promise.all(responses.map(response => this.parseAndPopulateTxResponse(response, chainId)));
  }

  public listenTx(
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

  public liveTx(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    const pendingSearchResults = this.searchTx(query).then(results =>
      results.map((tx): ConfirmedTransaction<UnsignedTransaction> | FailedTransaction => tx),
    );
    const historyStream = fromListPromise(pendingSearchResults);
    const updatesStream = this.listenTx(query);
    const combinedStream = concat(historyStream, updatesStream);
    const deduplicatedStream = combinedStream.compose(dropDuplicates(ct => ct.transactionId));
    return deduplicatedStream;
  }

  public async getFeeQuote(tx: UnsignedTransaction): Promise<Fee> {
    if (!isSendTransaction(tx)) {
      throw new Error("Received transaction of unsupported kind.");
    }
    return {
      tokens: {
        fractionalDigits: this.primaryToken.fractionalDigits,
        quantity: "5000",
        tokenTicker: this.primaryToken.tokenTicker,
      },
      gasLimit: "200000",
    };
  }

  public async withDefaultFee<T extends UnsignedTransaction>(tx: T): Promise<T> {
    return {
      ...tx,
      fee: await this.getFeeQuote(tx),
    };
  }

  private async parseAndPopulateTxResponse(
    response: TxsResponse,
    chainId: ChainId,
  ): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction> {
    const sender = (response.tx.value as any).msg[0].value.from_address;
    const accountForHeight = await this.tmClient.authAccounts(sender, response.height);
    const nonce = (parseInt(accountForHeight.result.value.sequence, 10) - 1) as Nonce;
    return parseTxsResponse(chainId, parseInt(response.height, 10), nonce, response);
  }
}
