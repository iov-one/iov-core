import axios from "axios";
import BN from "bn.js";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream, Subscription } from "xstream";

import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  Amount,
  AtomicSwap,
  AtomicSwapQuery,
  BcpAtomicSwapConnection,
  BcpCoin,
  BcpTicker,
  BcpTxQuery,
  BlockHeader,
  BlockInfo,
  ChainId,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  isAtomicSwapIdQuery,
  isPubkeyQuery,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyQuery,
  SwapState,
  TokenTicker,
  TransactionId,
  TransactionState,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Uint53 } from "@iov/encoding";
import { isJsonRpcErrorResponse, JsonRpcRequest } from "@iov/jsonrpc";
import { StreamingSocket } from "@iov/socket";
import { concat, DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { Abi } from "./abi";
import { pubkeyToAddress, toChecksummedAddress } from "./address";
import { constants } from "./constants";
import { Erc20, Erc20Options } from "./erc20";
import { EthereumCodec } from "./ethereumcodec";
import { HttpJsonRpcClient } from "./httpjsonrpcclient";
import { Parse } from "./parse";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  normalizeHex,
  toBcpChainId,
} from "./utils";

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  /** List of supported ERC20 tokens */
  readonly erc20Tokens?: ReadonlyMap<TokenTicker, Erc20Options>;
  /** Time between two polls for block, transaction and account watching in seconds */
  readonly pollInterval?: number;
}

export class EthereumConnection implements BcpAtomicSwapConnection {
  public static async establish(
    baseUrl: string,
    options?: EthereumConnectionOptions,
  ): Promise<EthereumConnection> {
    const chainId = await loadChainId(baseUrl);

    return new EthereumConnection(baseUrl, chainId, options);
  }

  private readonly pollIntervalMs: number;
  private readonly rpcClient: HttpJsonRpcClient;
  private readonly myChainId: ChainId;
  private readonly socket: StreamingSocket | undefined;
  private readonly scraperApiUrl: string | undefined;
  private readonly erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>;
  private readonly erc20ContractReaders: ReadonlyMap<TokenTicker, Erc20>;
  private readonly codec: EthereumCodec;

  constructor(baseUrl: string, chainId: ChainId, options?: EthereumConnectionOptions) {
    this.pollIntervalMs = options && options.pollInterval ? options.pollInterval * 1000 : 4_000;
    this.rpcClient = new HttpJsonRpcClient(baseUrl);
    this.myChainId = chainId;

    const ethereumClient = {
      ethCall: async (contractAddress: Address, data: Uint8Array): Promise<Uint8Array> => {
        // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_call
        const response = await this.rpcClient.run({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: contractAddress, data: `0x${Encoding.toHex(data)}` }, "latest"],
          id: 42,
        });
        if (isJsonRpcErrorResponse(response)) {
          throw new Error(JSON.stringify(response.error));
        }

        return Encoding.fromHex(normalizeHex(response.result));
      },
    };

    if (options) {
      if (options.wsUrl) {
        this.socket = new StreamingSocket(options.wsUrl);
        this.socket.connect();
      }

      if (options.scraperApiUrl) {
        this.scraperApiUrl = options.scraperApiUrl;
      }
    }

    const erc20Tokens = options && options.erc20Tokens ? options.erc20Tokens : new Map();

    this.erc20Tokens = erc20Tokens;
    this.erc20ContractReaders = new Map(
      [...erc20Tokens.entries()].map(
        ([ticker, erc20Options]): [TokenTicker, Erc20] => [ticker, new Erc20(ethereumClient, erc20Options)],
      ),
    );
    this.codec = new EthereumCodec({ erc20Tokens: erc20Tokens });
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

    const transactionId = Parse.transactionId(transactionResult);

    let pollInterval: NodeJS.Timeout | undefined;
    const blockInfoPending = new DefaultValueProducer<BlockInfo>(
      {
        state: TransactionState.Pending,
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
              state: TransactionState.Succeeded,
              height: confirmedTransaction.height,
              confirmations: confirmedTransaction.confirmations,
            });
          }, this.pollIntervalMs);
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

  public async getTicker(searchTicker: TokenTicker): Promise<BcpTicker | undefined> {
    return (await this.getAllTickers()).find(t => t.tokenTicker === searchTicker);
  }

  public async getAllTickers(): Promise<ReadonlyArray<BcpTicker>> {
    const erc20s = await Promise.all(
      [...this.erc20ContractReaders.entries()].map(
        async ([ticker, contract]): Promise<BcpTicker> => {
          const symbol = await contract.symbol();
          if (ticker !== symbol) {
            throw new Error(`Configured ticker '${ticker}' does not match contract symbol '${symbol}'`);
          }

          return {
            tokenTicker: (await contract.symbol()) as TokenTicker,
            tokenName: await contract.name(),
            fractionalDigits: await contract.decimals(),
          };
        },
      ),
    );

    return [
      {
        tokenTicker: constants.primaryTokenTicker,
        tokenName: constants.primaryTokenName,
        fractionalDigits: constants.primaryTokenFractionalDigits,
      },
      ...erc20s,
    ];
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey) : query.address;

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
    const ethBalance = Parse.ethereumAmount(decodeHexQuantityString(response.result));

    const erc20Balances: ReadonlyArray<BcpCoin> = await Promise.all(
      [...this.erc20ContractReaders.entries()].map(async ([ticker, contract]) => {
        const symbol = await contract.symbol();
        if (ticker !== symbol) {
          throw new Error(`Configured ticker '${ticker}' does not match contract symbol '${symbol}'`);
        }

        return {
          tokenTicker: ticker,
          quantity: (await contract.balanceOf(address)).toString(),
          fractionalDigits: await contract.decimals(),
          tokenName: await contract.name(),
        };
      }),
    );
    const nonEmptyErc20Balances = erc20Balances.filter(balance => balance.quantity !== "0");

    // Assume the account does not exist when balance is 0. This can lead to cases
    // where undefined is returned even if the account exists. Keep this as a
    // workaround until we have a clever and fast way to check account existence.
    // https://github.com/iov-one/iov-core/issues/676
    if (ethBalance.quantity === "0" && nonEmptyErc20Balances.length === 0) {
      return undefined;
    }

    const account: Account = {
      address: address,
      pubkey: undefined, // TODO: get from a transaction sent by this address
      balance: [
        {
          tokenName: constants.primaryTokenName,
          ...ethBalance,
        },
        ...nonEmptyErc20Balances,
      ],
    };
    return account;
  }

  public async getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey) : query.address;

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

  public async getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>> {
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
          out.push((firstNonce + index) as Nonce);
        }
        return out;
    }
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
    const socket = this.socket;
    if (!socket) {
      throw new Error(
        "watchBlockHeaders() cannot be used on an EthereumConnection without websocket support.",
      );
    }

    const subscribeRequestId = 100;
    let subscriptionId: string | undefined; // ID generated by the node
    let allMessagesSubscription: Subscription;
    const producer: Producer<BlockHeader> = {
      start: async listener => {
        allMessagesSubscription = socket.events.subscribe({
          next: header => {
            const blockHeaderJson = JSON.parse(header.data);
            if (blockHeaderJson.method === "eth_subscription") {
              // test if this subscription event is ours
              if (
                typeof blockHeaderJson.params === "object" &&
                typeof blockHeaderJson.params !== null &&
                blockHeaderJson.params.subscription === subscriptionId
              ) {
                // Give node time to store the new block and make it available via the HTTP API.
                // Try to reduce delay as soon as subscriptions and eth_getBlockByNumber use the same connection.
                setTimeout(() => {
                  // Missed transaction count in newHeads subscription
                  // It should be available but there is a bug in including transactions
                  // https://github.com/ethereum/go-ethereum/issues/15804#issuecomment-369344133
                  this.getBlockHeader(decodeHexQuantity(blockHeaderJson.params.result.number))
                    .then(blockHeader => listener.next(blockHeader))
                    .catch(error => listener.error(error));
                }, this.pollIntervalMs);
              }
            } else if (blockHeaderJson.id === subscribeRequestId) {
              if (
                typeof blockHeaderJson.result !== "string" ||
                !blockHeaderJson.result.match(/^0x[0-9a-f]+$/)
              ) {
                throw new Error("Unexpected result type or format in subscription response");
              }
              subscriptionId = blockHeaderJson.result;
            }
          },
          error: error => listener.error(error),
          complete: () => listener.error("Source stream completed"),
        });

        // see https://github.com/ethereum/go-ethereum/wiki/RPC-PUB-SUB#newheads
        await this.socketSend({
          id: subscribeRequestId,
          jsonrpc: "2.0",
          method: "eth_subscribe",
          params: ["newHeads", {}],
        });
      },
      stop: async () => {
        allMessagesSubscription.unsubscribe();
        if (!subscriptionId) {
          throw new Error("Subscrition ID not set. This should not happen.");
        }
        // see https://github.com/ethereum/go-ethereum/wiki/RPC-PUB-SUB#cancel-subscription
        await this.socketSend(
          {
            id: 11,
            jsonrpc: "2.0",
            method: "eth_unsubscribe",
            params: [subscriptionId],
          },
          // Calling unsubscribe() and disconnect() leads to this stop callback being
          // called after disconneting (due to the async nature of xstream's Producer
          // stop callbacks). Thus we may not be able to send eth_unsubscribe anymore.
          true,
        );
      },
    };
    return Stream.create(producer);
  }

  public watchAccount(query: AccountQuery): Stream<Account | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey) : query.address;

    let pollInterval: NodeJS.Timeout | undefined;
    let lastEvent: any = {}; // use non-undefined init value ensure undefined is sent as an event

    const producer: Producer<Account | undefined> = {
      start: async listener => {
        const poll = async () => {
          try {
            const event = await this.getAccount({ address: address });
            if (!equal(event, lastEvent)) {
              listener.next(event);
              lastEvent = event;
            }
          } catch (error) {
            // it would be nice to be able to detect and ignore network errors here
            listener.error(error);
          }
        };

        setInterval(poll, this.pollIntervalMs);
        await poll();
      },
      stop: () => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = undefined;
        }
      },
    };

    return Stream.create(producer);
  }

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
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
    } else if (query.sentFromOrTo) {
      const minHeight = query.minHeight || 0;
      const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;
      return this.searchSendTransactionsByAddress(query.sentFromOrTo, minHeight, maxHeight);
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      throw new Error(
        "listenTx() is not implemented for ID queries because block heights are not always in sync this would give you unrelyable results. What you probably want to use is liveTx() that will find your transaction ID either in history or in updates.",
      );
    } else if (query.sentFromOrTo) {
      const sentFromOrTo = query.sentFromOrTo;
      let pollInterval: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction | FailedTransaction> = {
        start: async listener => {
          const currentHeight = await this.height();
          let minHeight = Math.max(query.minHeight || 0, currentHeight + 1);
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchSendTransactionsByAddress(sentFromOrTo, minHeight, maxHeight);
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollInterval = setInterval(poll, this.pollIntervalMs);
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

  public liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      const searchId = query.id;
      const resultPromise = new Promise<ConfirmedTransaction>(async (resolve, reject) => {
        try {
          while (true) {
            const searchResult = await this.searchTransactionsById(searchId);
            if (searchResult.length > 0) {
              resolve(searchResult[0]);
            } else {
              await sleep(this.pollIntervalMs);
            }
          }
        } catch (error) {
          reject(error);
        }
      });

      // concat never() because we want non-completing streams consistently
      return concat(Stream.fromPromise(resultPromise), Stream.never());
    } else if (query.sentFromOrTo) {
      const sentFromOrTo = query.sentFromOrTo;
      let pollInterval: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction | FailedTransaction> = {
        start: async listener => {
          let minHeight = query.minHeight || 0;
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchSendTransactionsByAddress(sentFromOrTo, minHeight, maxHeight);
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollInterval = setInterval(poll, this.pollIntervalMs);
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

  public async getFeeQuote(transaction: UnsignedTransaction): Promise<Fee> {
    switch (transaction.kind) {
      case "bcp/send":
      case "bcp/swap_offer":
        return {
          gasPrice: {
            // TODO: calculate dynamically from previous blocks or external API
            quantity: "20000000000", // 20 gwei
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          gasLimit: {
            quantity: "2100000",
            // Those fields are pointless and will be removed in 0.14
            // https://github.com/iov-one/iov-core/issues/858
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
        };
      default:
        throw new Error("Received transaction of unsupported kind.");
    }
  }

  public async withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T> {
    return { ...transaction, fee: await this.getFeeQuote(transaction) };
  }

  public async getSwaps(query: AtomicSwapQuery): Promise<ReadonlyArray<AtomicSwap>> {
    if (isAtomicSwapIdQuery(query)) {
      const data = Uint8Array.from([...Abi.calculateMethodId("get(bytes32)"), ...query.swapid]);

      const params = [
        {
          to: constants.atomicSwapEtherContractAddress,
          data: "0x" + Encoding.toHex(data),
        },
      ] as ReadonlyArray<any>;
      const swapsResponse = await this.rpcClient.run({
        jsonrpc: "2.0",
        method: "eth_call",
        params: params,
        id: 7,
      });
      if (isJsonRpcErrorResponse(swapsResponse)) {
        throw new Error(JSON.stringify(swapsResponse.error));
      }

      if (swapsResponse.result === null) {
        return [];
      }

      const senderBegin = 12;
      const senderEnd = senderBegin + 20;
      const recipientBegin = senderEnd + 12;
      const recipientEnd = recipientBegin + 20;
      const hashBegin = recipientEnd;
      const hashEnd = hashBegin + 32;
      const timeoutBegin = hashEnd;
      const timeoutEnd = timeoutBegin + 32;
      const amountBegin = timeoutEnd;
      const amountEnd = amountBegin + 32;

      const resultArray = Encoding.fromHex(swapsResponse.result.slice(2));
      const sender = toChecksummedAddress("0x" + Encoding.toHex(resultArray.slice(senderBegin, senderEnd)));
      const recipient = toChecksummedAddress(
        "0x" + Encoding.toHex(resultArray.slice(recipientBegin, recipientEnd)),
      );
      const hash = resultArray.slice(hashBegin, hashEnd);
      const timeoutHeight = new BN(resultArray.slice(timeoutBegin, timeoutEnd)).toNumber();
      const amount = {
        quantity: new BN(resultArray.slice(amountBegin, amountEnd)).toString(),
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      };

      return [
        {
          // TODO: Update when we return state from the get() call
          kind: SwapState.Open,
          data: {
            id: query.swapid,
            sender: sender,
            recipient: recipient,
            hash: hash,
            amounts: [amount] as ReadonlyArray<Amount>,
            timeout: {
              height: timeoutHeight,
            },
          },
        },
      ];
    } else {
      throw new Error("unsupported query type");
    }
  }

  public watchSwaps(_: AtomicSwapQuery): Stream<AtomicSwap> {
    throw new Error("not implemented");
  }

  private async socketSend(request: JsonRpcRequest, ignoreNetworkError: boolean = false): Promise<void> {
    if (!this.socket) {
      throw new Error("No socket available");
    }
    await this.socket.connected;
    const data = JSON.stringify(request);

    try {
      await this.socket.send(data);
    } catch (error) {
      if (!ignoreNetworkError) {
        throw error;
      }
    }
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
    const transaction = this.codec.parseBytes(
      Encoding.toUtf8(JSON.stringify(transactionsResponse.result)) as PostableBytes,
      this.myChainId,
    );
    const transactionId = Parse.transactionId(transactionsResponse.result.hash);
    return [
      {
        ...transaction,
        height: transactionHeight,
        confirmations: confirmations,
        transactionId: transactionId,
      },
    ];
  }

  private async searchSendTransactionsByAddress(
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
    // tslint:disable-next-line:readonly-array
    const transactions: ConfirmedTransaction[] = [];
    for (const tx of responseBody.result) {
      if (tx.isError === "0" && tx.txreceipt_status === "1") {
        const transactionId = `0x${normalizeHex(tx.hash)}` as TransactionId;
        // Do an extra query to the node as the scraper result does not contain the
        // transaction signature, which we need for recovering the signer's pubkey.
        const transaction = (await this.searchTransactionsById(transactionId))[0];
        transactions.push(transaction);
      }
    }
    return transactions;
  }
}
