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
  isPubkeyQuery,
  isSendTransaction,
  LightTransaction,
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
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Uint53 } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import { CosmosBech32Prefix, pubkeyToAddress } from "./address";
import { CosmosClient, TxsResponse } from "./cosmosclient";
import { decodeAmount, parseTxsResponse } from "./decode";
import { RestClient } from "./restclient";
import { RpcClient } from "./rpcclient";

const { fromBase64 } = Encoding;

const atom = "ATOM" as TokenTicker;

interface ChainData {
  readonly chainId: ChainId;
}

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

type ProtocolPrefix = "http://" | "rpc://";
const supportedPrefixes: readonly ProtocolPrefix[] = ["http://", "rpc://"];

export class CosmosConnection implements BlockchainConnection {
  public static async establish(url: string): Promise<CosmosConnection> {
    const supportedPrefix = supportedPrefixes.find(prefix => url.startsWith(prefix));
    if (!supportedPrefix) {
      throw new Error("Unsupported protocol");
    }
    const client = supportedPrefix === "http://" ? new RestClient(url) : await RpcClient.establish(url);
    const chainData = await this.initialize(client);
    return new CosmosConnection(client, chainData);
  }

  private static async initialize(client: CosmosClient): Promise<ChainData> {
    const { nodeInfo } = await client.nodeInfo();
    return { chainId: nodeInfo.network as ChainId };
  }

  private readonly client: CosmosClient;
  private readonly chainData: ChainData;
  private readonly supportedTokens: readonly string[];

  private get prefix(): CosmosBech32Prefix {
    return "cosmos";
  }

  private constructor(cosmosClient: CosmosClient, chainData: ChainData) {
    this.client = cosmosClient;
    this.chainData = chainData;
    this.supportedTokens = ["uatom"];
  }

  public disconnect(): void {
    return;
  }

  public chainId(): ChainId {
    return this.chainData.chainId;
  }

  public async height(): Promise<number> {
    const { blockMeta } = await this.client.blocksLatest();
    return blockMeta.header.height;
  }

  public async getToken(_ticker: TokenTicker): Promise<Token | undefined> {
    throw new Error("not implemented");
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    throw new Error("not implemented");
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey, this.prefix) : query.address;
    const { result } = await this.client.authAccounts(address);
    const account = result.value;
    const supportedCoins = account.coins.filter(coin => this.supportedTokens.includes(coin.denom));
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

  public watchAccount(_account: AccountQuery): Stream<Account | undefined> {
    throw new Error("not implemented");
  }

  public async getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey, this.prefix) : query.address;
    const { result } = await this.client.authAccounts(address);
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
    const { blockMeta } = await this.client.blocks(height);
    return {
      id: blockMeta.blockId.hash as BlockId,
      height: blockMeta.header.height,
      time: new ReadonlyDate(blockMeta.header.time),
      transactionCount: blockMeta.header.numTxs,
    };
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    throw new Error("not implemented");
  }

  public async getTx(
    id: TransactionId,
  ): Promise<(ConfirmedAndSignedTransaction<UnsignedTransaction>) | FailedTransaction> {
    try {
      const response = await this.client.txsById(id);
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
    const { txhash, rawLog } = await this.client.postTx(tx);
    const transactionId = txhash as TransactionId;
    const firstEvent: BlockInfo = { state: TransactionState.Pending };
    const producer = new DefaultValueProducer<BlockInfo>(firstEvent);
    return {
      blockInfo: new ValueAndUpdates<BlockInfo>(producer),
      transactionId: transactionId,
      log: rawLog,
    };
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedTransaction<LightTransaction> | FailedTransaction)[]> {
    const queryString = buildQueryString(query);
    const chainId = await this.chainId();
    const { txs: responses } = await this.client.txs(queryString);
    return Promise.all(responses.map(response => this.parseAndPopulateTxResponse(response, chainId)));
  }

  public listenTx(
    _query: TransactionQuery,
  ): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    throw new Error("not implemented");
  }

  public liveTx(
    _query: TransactionQuery,
  ): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    throw new Error("not implemented");
  }

  public async getFeeQuote(tx: UnsignedTransaction): Promise<Fee> {
    if (!isSendTransaction(tx)) {
      throw new Error("Received transaction of unsupported kind.");
    }
    return {
      tokens: {
        fractionalDigits: 6,
        quantity: "5000",
        tokenTicker: atom,
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
  ): Promise<(ConfirmedAndSignedTransaction<UnsignedTransaction>) | FailedTransaction> {
    const sender = (response.tx.value as any).msg[0].value.from_address;
    const accountForHeight = await this.client.authAccounts(sender, response.height);
    const nonce = (parseInt(accountForHeight.result.value.sequence, 10) - 1) as Nonce;
    return parseTxsResponse(chainId, parseInt(response.height, 10), nonce, response);
  }
}
