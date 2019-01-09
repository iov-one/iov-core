import axios from "axios";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream, Subscription } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpBlockInfo,
  BcpConnection,
  BcpPubkeyQuery,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionState,
  BcpTxQuery,
  BlockHeader,
  ChainId,
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  isPubkeyQuery,
  Nonce,
  PostableBytes,
  PostTxResponse,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { Encoding, Uint53 } from "@iov/encoding";
import { isJsonRpcErrorResponse } from "@iov/jsonrpc";
import { StreamingSocket } from "@iov/socket";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { constants } from "./constants";
import { keyToAddress } from "./derivation";
import { ethereumCodec } from "./ethereumcodec";
import { HttpJsonRpcClient } from "./httpjsonrpcclient";
import { Parse, Scraper } from "./parse";
import { findScraperAddress } from "./tags";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  hexPadToEven,
  toBcpChainId,
} from "./utils";

interface WsListener {
  readonly id?: string;
  readonly subscription?: string;
}

const wsListeners = new Array<WsListener>();

function getListenerBySubscription(subscription: string): WsListener | undefined {
  return wsListeners.find(listener => listener.subscription === subscription);
}

function addToListeners(id: string, subscription: string): void {
  const index = wsListeners.findIndex(listener => listener.id === id);
  if (index !== -1) {
    throw new Error(`Listener ${id} already initialized with subscription ${subscription}`);
  }
  wsListeners.push({ id: id, subscription: subscription });
}

function getListenerById(id: string): WsListener | undefined {
  return wsListeners.find(listener => listener.id === id);
}

function removeFromListeners(id: string): void {
  const index = wsListeners.findIndex(listener => listener.id === id);
  wsListeners.splice(index, 1);
}

async function loadChainId(baseUrl: string): Promise<ChainId> {
  // see https://github.com/ethereum/wiki/wiki/JSON-RPC#net_version
  const response = await new HttpJsonRpcClient(baseUrl).run({
    jsonrpc: "2.0",
    method: "net_version",
    params: [],
    id: 1,
  });
  if (isJsonRpcErrorResponse(response)) {
    throw new Error(JSON.stringify(response.error));
  }

  const numericChainId = Uint53.fromString(response.result);
  return toBcpChainId(numericChainId.toNumber());
}

export interface EthereumConnectionOptions {
  readonly wsUrl?: string;
  /** URL to an Etherscan compatible scraper API */
  readonly scraperApiUrl?: string;
}

export class EthereumConnection implements BcpConnection {
  public static async establish(
    baseUrl: string,
    options?: EthereumConnectionOptions,
  ): Promise<EthereumConnection> {
    const chainId = await loadChainId(baseUrl);

    return new EthereumConnection(baseUrl, chainId, options);
  }

  private readonly rpcClient: HttpJsonRpcClient;
  private readonly myChainId: ChainId;
  private readonly socket: StreamingSocket | undefined;
  private readonly scraperApiUrl: string | undefined;

  constructor(baseUrl: string, chainId: ChainId, options?: EthereumConnectionOptions) {
    this.rpcClient = new HttpJsonRpcClient(baseUrl);
    this.myChainId = chainId;

    if (options) {
      if (options.wsUrl) {
        this.socket = new StreamingSocket(options.wsUrl);
        this.socket.connect();
      }

      if (options.scraperApiUrl) {
        this.scraperApiUrl = options.scraperApiUrl;
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public chainId(): ChainId {
    return this.myChainId;
  }

  public async height(): Promise<number> {
    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_blocknumber
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 2,
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    return decodeHexQuantity(response.result);
  }

  public async postTx(bytes: PostableBytes): Promise<PostTxResponse> {
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: ["0x" + Encoding.toHex(bytes)],
      id: 5,
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    const transactionResult = response.result;
    if (typeof transactionResult !== "string") {
      throw new Error("Result field was not a string");
    }

    const transactionId = transactionResult as TransactionId;
    if (!transactionId.match(/^0x[0-9a-f]{64}$/)) {
      throw new Error("Invalid transaction ID format");
    }

    // 12-15 seconds average block time
    const pollIntervalMs = 4_000;

    let pollInterval: NodeJS.Timeout | undefined;
    const blockInfoPending = new DefaultValueProducer<BcpBlockInfo>(
      {
        state: BcpTransactionState.Pending,
      },
      {
        onStarted: () => {
          pollInterval = setInterval(async () => {
            const searchResult = await this.searchTx({ id: transactionId });
            if (searchResult.length === 0) {
              return;
            }

            const confirmedTransaction = searchResult[0];

            blockInfoPending.update({
              state: BcpTransactionState.InBlock,
              height: confirmedTransaction.height,
              confirmations: confirmedTransaction.confirmations,
            });
          }, pollIntervalMs);
        },
        onStop: () => {
          clearInterval(pollInterval!);
        },
      },
    );
    return {
      blockInfo: new ValueAndUpdates(blockInfoPending),
      transactionId: transactionId,
    };
  }

  public getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    let address: Address;
    if (isAddressQuery(query)) {
      address = query.address;
    } else if (isPubkeyQuery(query)) {
      address = keyToAddress(query.pubkey);
    } else {
      throw new Error("Query type not supported");
    }

    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getbalance
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 3,
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    // eth_getBalance always returns one result. Balance is 0x0 if account does not exist.

    const account: BcpAccount = {
      address: address,
      pubkey: undefined, // TODO: get from a transaction sent by this address
      name: undefined,
      balance: [
        {
          tokenName: constants.primaryTokenName,
          ...Parse.ethereumAmount(decodeHexQuantityString(response.result)),
        },
      ],
    };
    return dummyEnvelope([account]);
  }

  public async getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query) ? keyToAddress(query.pubkey) : query.address;

    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactioncount
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [address, "latest"],
      id: 4,
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    return decodeHexQuantityNonce(response.result);
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [encodeQuantity(height), true],
      id: 8,
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    if (response.result === null) {
      throw new Error(`Header ${height} doesn't exist yet`);
    }

    const blockData = response.result;
    return {
      id: blockData.hash,
      height: decodeHexQuantity(blockData.number),
      time: new ReadonlyDate(decodeHexQuantity(blockData.timestamp) * 1000),
      transactionCount: blockData.transactions.length,
    };
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    let headersSubscription: Subscription;
    const producer: Producer<BlockHeader> = {
      start: listener => {
        // see https://github.com/ethereum/go-ethereum/wiki/RPC-PUB-SUB#newheads
        this.socketSend(
          JSON.stringify({
            id: "watchBlockHeaders",
            jsonrpc: "2.0",
            method: "eth_subscribe",
            params: ["newHeads", {}],
          }),
        );
        headersSubscription = this.socket!.events.subscribe({
          next: header => {
            const blockHeaderJson = JSON.parse(header.data);
            if (blockHeaderJson.method === "eth_subscription") {
              const listening = getListenerBySubscription(blockHeaderJson.params.subscription);
              if (listening) {
                // Give node time to store the new block and make it available via the HTTP API.
                // Try to reduce delay as soon as subscriptions and eth_getBlockByNumber use the same connection.
                setTimeout(() => {
                  // Missed transaction count in newHeads subscription
                  // It should be available but there is a bug in including transactions
                  // https://github.com/ethereum/go-ethereum/issues/15804#issuecomment-369344133
                  this.getBlockHeader(decodeHexQuantity(blockHeaderJson.params.result.number))
                    .then(blockHeader => listener.next(blockHeader))
                    .catch(error => listener.error(error));
                }, 3_000);
              }
            } else if (blockHeaderJson.id) {
              // This is the response from eth server when subscribing to an event
              // store eth subscription id to unsubscribe later
              if (typeof blockHeaderJson.result === "string") {
                addToListeners(blockHeaderJson.id, blockHeaderJson.result);
              } else if (blockHeaderJson.result === true) {
                removeFromListeners(blockHeaderJson.id);
              }
            }
          },
          error: error => listener.error(error),
          complete: () => listener.error("Source stream completed"),
        });
      },
      stop: () => {
        headersSubscription.unsubscribe();
        // see https://github.com/ethereum/go-ethereum/wiki/RPC-PUB-SUB#cancel-subscription
        const listener = getListenerById("watchBlockHeaders");
        this.socketSend(
          JSON.stringify({
            id: "watchBlockHeaders",
            jsonrpc: "2.0",
            method: "eth_unsubscribe",
            params: [listener!.subscription],
          }),
        );
      },
    };
    return Stream.create(producer);
  }

  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  public changeBlock(): Stream<number> {
    return this.watchBlockHeaders().map(header => header.height);
  }

  public watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined> {
    throw new Error("Not implemented");
  }

  public watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce> {
    throw new Error("Not implemented");
  }

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height) {
      throw new Error("Query by height not supported");
    }

    if (query.id !== undefined) {
      if (!query.id.match(/^0x[0-9a-f]{64}$/)) {
        throw new Error("Invalid transaction ID format");
      }

      if (query.minHeight !== undefined) {
        throw new Error("Min height is not supported for queries by transaction ID");
      }

      if (query.maxHeight !== undefined) {
        throw new Error("Max height is not supported for queries by transaction ID");
      }

      return this.searchTransactionsById(query.id);
    } else if (query.tags) {
      const minHeight = query.minHeight || 0;
      const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

      const address = findScraperAddress(query.tags);
      if (!address) {
        throw new Error("No matching search tag found to query transactions");
      }

      return this.searchTransactionsByAddress(address, minHeight, maxHeight);
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction> {
    if (query.id !== undefined) {
      throw new Error(
        "listenTx() is not implemented for ID queries because block heights are not always in sync this would give you unrelyable results. What you probably want to use is liveTx() that will find your transaction ID either in history or in updates.",
      );
    } else if (query.tags) {
      const address = findScraperAddress(query.tags);
      if (!address) {
        throw new Error("No matching search tag found to query transactions");
      }

      let pollInterval: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction> = {
        start: async listener => {
          const currentHeight = await this.height();
          let minHeight = Math.max(query.minHeight || 0, currentHeight + 1);
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchTransactionsByAddress(address, minHeight, maxHeight);
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          poll();
          pollInterval = setInterval(poll, 4_000);
        },
        stop: () => {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = undefined;
          }
        },
      };
      return Stream.create(producer);
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  private async socketSend(data: string): Promise<void> {
    if (!this.socket) {
      throw new Error("No socket available");
    }
    await this.socket.connected;
    await this.socket.send(data);
  }

  private async searchTransactionsById(id: TransactionId): Promise<ReadonlyArray<ConfirmedTransaction>> {
    const transactionsResponse = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [id],
      id: 6,
    });
    if (isJsonRpcErrorResponse(transactionsResponse)) {
      throw new Error(JSON.stringify(transactionsResponse.error));
    }

    if (transactionsResponse.result === null || transactionsResponse.result.blockNumber === null) {
      return [];
    }
    const transactionHeight = decodeHexQuantity(transactionsResponse.result.blockNumber);

    const currentHeight = await this.height();
    const confirmations = currentHeight - transactionHeight + 1;
    const transactionJson = {
      ...transactionsResponse.result,
      type: 0,
    };
    const transaction = ethereumCodec.parseBytes(
      Encoding.toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
      this.myChainId,
    );
    const transactionId = `0x${hexPadToEven(transactionsResponse.result.hash)}` as TransactionId;
    return [
      {
        ...transaction,
        height: transactionHeight,
        confirmations: confirmations,
        transactionId: transactionId,
      },
    ];
  }

  private async searchTransactionsByAddress(
    address: Address,
    minHeight: number,
    maxHeight: number,
  ): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (maxHeight < minHeight) {
      return [];
    }

    if (!this.scraperApiUrl) {
      throw new Error("No scraper API URL specified. Cannot search for transactions by tags.");
    }

    // API: https://etherscan.io/apis#accounts
    const responseBody = (await axios.get(this.scraperApiUrl, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: minHeight,
        endblock: maxHeight,
        sort: "asc",
      },
    })).data;
    if (responseBody.result === null) {
      return [];
    }
    const transactions: any = [];
    for (const tx of responseBody.result) {
      if (tx.isError === "0" && tx.txreceipt_status === "1") {
        const transaction = Scraper.parseBytesTx(tx, this.myChainId);
        const transactionId = `0x${hexPadToEven(tx.hash)}` as TransactionId;
        transactions.push({
          ...transaction,
          height: Uint53.fromString(tx.blockNumber).toNumber(),
          confirmations: tx.confirmations,
          transactionId: transactionId,
        });
      }
    }
    return transactions;
  }
}
