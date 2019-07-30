import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapIdQuery,
  AtomicSwapQuery,
  BlockHeader,
  BlockInfo,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  Hash,
  isAtomicSwapHashQuery,
  isAtomicSwapIdQuery,
  isAtomicSwapRecipientQuery,
  isAtomicSwapSenderQuery,
  isPubkeyQuery,
  isSwapProcessStateAborted,
  isSwapProcessStateClaimed,
  isSwapProcessStateOpen,
  LightTransaction,
  Nonce,
  OpenSwap,
  PostableBytes,
  PostTxResponse,
  Preimage,
  PubkeyQuery,
  SendTransaction,
  SwapData,
  SwapId,
  SwapIdBytes,
  swapIdEquals,
  SwapProcessState,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TransactionState,
  UnsignedTransaction,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Encoding, Uint53 } from "@iov/encoding";
import { isJsonRpcErrorResponse, makeJsonRpcId } from "@iov/jsonrpc";
import { concat, DefaultValueProducer, dropDuplicates, ValueAndUpdates } from "@iov/stream";
import axios from "axios";
import BN from "bn.js";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream, Subscription } from "xstream";

import { Abi, SwapContractEvent } from "./abi";
import { pubkeyToAddress, toChecksummedAddress } from "./address";
import { constants } from "./constants";
import { Erc20TokensMap } from "./erc20";
import { Erc20Reader } from "./erc20reader";
import { EthereumCodec } from "./ethereumcodec";
import { EthereumRpcClient } from "./ethereumrpcclient";
import { HttpEthereumRpcClient } from "./httpethereumrpcclient";
import { Parse } from "./parse";
import { SwapIdPrefix } from "./serialization";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  normalizeHex,
  toBcpChainId,
  toEthereumHex,
} from "./utils";
import { WsEthereumRpcClient } from "./wsethereumrpcclient";

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isHttpUrl(url: string): boolean {
  return ["http://", "https://"].some(prefix => url.startsWith(prefix));
}

function isWsUrl(url: string): boolean {
  return ["ws://", "wss://"].some(prefix => url.startsWith(prefix));
}

async function loadChainId(baseUrl: string): Promise<ChainId> {
  const client = isWsUrl(baseUrl) ? new WsEthereumRpcClient(baseUrl) : new HttpEthereumRpcClient(baseUrl);
  // see https://github.com/ethereum/wiki/wiki/JSON-RPC#net_version
  const response = await client.run({
    jsonrpc: "2.0",
    method: "net_version",
    params: [],
    id: makeJsonRpcId(),
  });
  if (isJsonRpcErrorResponse(response)) {
    throw new Error(JSON.stringify(response.error));
  }

  const numericChainId = Uint53.fromString(response.result);
  return toBcpChainId(numericChainId.toNumber());
}

interface AtomicSwapClaimedUpdate {
  readonly kind: SwapProcessState.Claimed;
  readonly swapIdBytes: SwapIdBytes;
  readonly preimage: Preimage;
}

interface AtomicSwapAbortedUpdate {
  readonly kind: SwapProcessState.Aborted;
  readonly swapIdBytes: SwapIdBytes;
}

type AtomicSwapUpdate = AtomicSwapClaimedUpdate | AtomicSwapAbortedUpdate;

export interface EthereumLog {
  readonly transactionIndex: string;
  readonly data: string;
  readonly topics: readonly string[];
}

interface EthereumLogWithPrefix extends EthereumLog {
  readonly prefix: SwapIdPrefix;
}

export interface EthereumConnectionOptions {
  /** URL to an Etherscan compatible scraper API */
  readonly scraperApiUrl?: string;
  /** Address of the deployed atomic swap contract for ETH */
  readonly atomicSwapEtherContractAddress?: Address;
  /** Address of the deployed atomic swap contract for ERC20 tokens */
  readonly atomicSwapErc20ContractAddress?: Address;
  /** List of supported ERC20 tokens */
  readonly erc20Tokens?: Erc20TokensMap;
  /** Time between two polls for block, transaction and account watching in seconds */
  readonly pollInterval?: number;
}

export class EthereumConnection implements AtomicSwapConnection {
  public static async createEtherSwapId(): Promise<SwapId> {
    const bytes = await Random.getBytes(32);
    return {
      prefix: SwapIdPrefix.Ether,
      data: bytes as SwapIdBytes,
    };
  }

  public static async createErc20SwapId(): Promise<SwapId> {
    const bytes = await Random.getBytes(32);
    return {
      prefix: SwapIdPrefix.Erc20,
      data: bytes as SwapIdBytes,
    };
  }

  public static async establish(
    baseUrl: string,
    options: EthereumConnectionOptions,
  ): Promise<EthereumConnection> {
    const chainId = await loadChainId(baseUrl);

    return new EthereumConnection(baseUrl, chainId, options);
  }

  private static parseOpenedEventBytes(
    bytes: Uint8Array,
    prefix: SwapIdPrefix,
    erc20Tokens: Erc20TokensMap,
  ): OpenSwap | null {
    const swapIdBegin = 0;
    const swapIdEnd = swapIdBegin + 32;
    const senderBegin = swapIdEnd;
    const senderEnd = senderBegin + 32;
    const recipientBegin = senderEnd;
    const recipientEnd = recipientBegin + 32;
    const hashBegin = recipientEnd;
    const hashEnd = hashBegin + 32;
    const amountBegin = hashEnd;
    const amountEnd = amountBegin + 32;
    const timeoutBegin = amountEnd;
    const timeoutEnd = timeoutBegin + 32;
    const erc20ContractAddressBegin = timeoutEnd;
    const erc20ContractAddressEnd = erc20ContractAddressBegin + 32;

    const erc20ContractAddress =
      prefix === SwapIdPrefix.Ether
        ? null
        : Abi.decodeAddress(bytes.slice(erc20ContractAddressBegin, erc20ContractAddressEnd)).toLowerCase();

    const erc20Token =
      prefix === SwapIdPrefix.Ether
        ? null
        : [...erc20Tokens.values()].find(
            token => token.contractAddress.toLowerCase() === erc20ContractAddress,
          );

    if (prefix === SwapIdPrefix.Erc20 && !erc20Token) {
      // Found swap for a token we’re not tracking
      return null;
    }

    const fractionalDigits = erc20Token ? erc20Token.decimals : constants.primaryTokenFractionalDigits;
    const tokenTicker = erc20Token ? (erc20Token.symbol as TokenTicker) : constants.primaryTokenTicker;
    const amount = {
      quantity: new BN(bytes.slice(amountBegin, amountEnd)).toString(),
      fractionalDigits: fractionalDigits,
      tokenTicker: tokenTicker,
    };

    return {
      kind: SwapProcessState.Open,
      data: {
        id: {
          prefix: prefix,
          data: bytes.slice(swapIdBegin, swapIdEnd) as SwapIdBytes,
        },
        sender: Abi.decodeAddress(bytes.slice(senderBegin, senderEnd)),
        recipient: Abi.decodeAddress(bytes.slice(recipientBegin, recipientEnd)),
        hash: bytes.slice(hashBegin, hashEnd) as Hash,
        amounts: [amount],
        timeout: {
          height: new BN(bytes.slice(timeoutBegin, timeoutEnd)).toNumber(),
        },
      },
    };
  }

  private static parseClaimedEventBytes(
    bytes: Uint8Array,
  ): {
    readonly kind: SwapProcessState.Claimed;
    readonly swapIdBytes: SwapIdBytes;
    readonly preimage: Preimage;
  } {
    const swapIdBegin = 0;
    const swapIdEnd = swapIdBegin + 32;
    const preimageBegin = swapIdEnd;
    const preimageEnd = preimageBegin + 32;

    return {
      kind: SwapProcessState.Claimed,
      swapIdBytes: bytes.slice(swapIdBegin, swapIdEnd) as SwapIdBytes,
      preimage: bytes.slice(preimageBegin, preimageEnd) as Preimage,
    };
  }

  private static parseAbortedEventBytes(
    bytes: Uint8Array,
  ): {
    readonly kind: SwapProcessState.Aborted;
    readonly swapIdBytes: SwapIdBytes;
  } {
    const swapIdBegin = 0;
    const swapIdEnd = swapIdBegin + 32;

    return {
      kind: SwapProcessState.Aborted,
      swapIdBytes: bytes.slice(swapIdBegin, swapIdEnd) as SwapIdBytes,
    };
  }

  private static updateSwapInList(
    swaps: readonly AtomicSwap[],
    update: AtomicSwapUpdate,
    prefix: SwapIdPrefix,
  ): readonly AtomicSwap[] {
    const { kind, swapIdBytes } = update;
    const swapId = { data: swapIdBytes, prefix: prefix };
    const swapIndex = swaps.findIndex(s => swapIdEquals(s.data.id, swapId));
    if (swapIndex === -1) {
      // Found a Claimed/Aborted event for a token we’re not tracking
      return swaps;
    }
    const oldSwap = swaps[swapIndex];
    const newSwap: AtomicSwap =
      kind === SwapProcessState.Claimed
        ? {
            kind: kind,
            data: { ...oldSwap.data },
            preimage: (update as AtomicSwapClaimedUpdate).preimage,
          }
        : {
            kind: kind,
            data: { ...oldSwap.data },
          };
    return [...swaps.slice(0, swapIndex), ...swaps.slice(swapIndex + 1), newSwap];
  }

  private readonly pollIntervalMs: number;
  private readonly rpcClient: EthereumRpcClient;
  private readonly myChainId: ChainId;
  private readonly scraperApiUrl: string | undefined;
  private readonly atomicSwapEtherContractAddress?: Address;
  private readonly atomicSwapErc20ContractAddress?: Address;
  private readonly erc20Tokens: Erc20TokensMap;
  private readonly erc20ContractReaders: ReadonlyMap<TokenTicker, Erc20Reader>;
  private readonly codec: EthereumCodec;

  public constructor(baseUrl: string, chainId: ChainId, options: EthereumConnectionOptions) {
    const baseUrlIsHttp = isHttpUrl(baseUrl);
    const baseUrlIsWs = isWsUrl(baseUrl);
    if (!baseUrlIsHttp && !baseUrlIsWs) {
      throw new Error("Unsupported protocol for baseUrl: must be one of http, https, ws or wss");
    }

    this.rpcClient = baseUrlIsWs ? new WsEthereumRpcClient(baseUrl) : new HttpEthereumRpcClient(baseUrl);
    this.pollIntervalMs = options.pollInterval ? options.pollInterval * 1000 : 4_000;
    this.myChainId = chainId;
    this.scraperApiUrl = options.scraperApiUrl;

    const ethereumClient = {
      ethCall: async (contractAddress: Address, data: Uint8Array): Promise<Uint8Array> => {
        // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_call
        const response = await this.rpcClient.run({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: contractAddress, data: toEthereumHex(data) }, "latest"],
          id: makeJsonRpcId(),
        });
        if (isJsonRpcErrorResponse(response)) {
          throw new Error(JSON.stringify(response.error));
        }

        return Encoding.fromHex(normalizeHex(response.result));
      },
    };

    const atomicSwapEtherContractAddress = options.atomicSwapEtherContractAddress;
    const atomicSwapErc20ContractAddress = options.atomicSwapErc20ContractAddress;
    const erc20Tokens = options.erc20Tokens || new Map();

    this.atomicSwapEtherContractAddress = atomicSwapEtherContractAddress;
    this.atomicSwapErc20ContractAddress = atomicSwapErc20ContractAddress;
    this.erc20Tokens = erc20Tokens;
    this.erc20ContractReaders = new Map(
      [...erc20Tokens.entries()].map(([ticker, erc20Options]): readonly [TokenTicker, Erc20Reader] => [
        ticker,
        new Erc20Reader(ethereumClient, erc20Options),
      ]),
    );
    this.codec = new EthereumCodec({
      erc20Tokens: erc20Tokens,
      atomicSwapEtherContractAddress: atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress: atomicSwapErc20ContractAddress,
    });
  }

  public disconnect(): void {
    this.rpcClient.disconnect();
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
      id: makeJsonRpcId(),
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
      params: [toEthereumHex(bytes)],
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    const transactionResult = response.result;
    if (typeof transactionResult !== "string") {
      throw new Error("Result field was not a string");
    }

    const transactionId = Parse.transactionId(transactionResult);

    let pollInterval: NodeJS.Timeout;
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
          clearInterval(pollInterval);
        },
      },
    );
    return {
      blockInfo: new ValueAndUpdates(blockInfoPending),
      transactionId: transactionId,
    };
  }

  public async getToken(searchTicker: TokenTicker): Promise<Token | undefined> {
    return (await this.getAllTokens()).find(t => t.tokenTicker === searchTicker);
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    const erc20s = await Promise.all(
      [...this.erc20ContractReaders.entries()].map(
        async ([ticker, contract]): Promise<Token> => {
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

    // tslint:disable-next-line: readonly-array
    const out = [
      {
        tokenTicker: constants.primaryTokenTicker,
        tokenName: constants.primaryTokenName,
        fractionalDigits: constants.primaryTokenFractionalDigits,
      },
      ...erc20s,
    ];
    // Sort by ticker
    out.sort((a, b) => a.tokenTicker.localeCompare(b.tokenTicker));
    return out;
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey) : query.address;

    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getbalance
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    // eth_getBalance always returns one result. Balance is 0x0 if account does not exist.
    const ethBalance = Parse.ethereumAmount(decodeHexQuantityString(response.result));

    const erc20Balances: readonly Amount[] = await Promise.all(
      [...this.erc20ContractReaders.entries()].map(
        async ([ticker, contract]): Promise<Amount> => {
          const symbol = await contract.symbol();
          if (ticker !== symbol) {
            throw new Error(`Configured ticker '${ticker}' does not match contract symbol '${symbol}'`);
          }

          return {
            tokenTicker: ticker,
            quantity: (await contract.balanceOf(address)).toString(),
            fractionalDigits: await contract.decimals(),
          };
        },
      ),
    );
    const nonEmptyErc20Balances = erc20Balances.filter(balance => balance.quantity !== "0");

    // Assume the account does not exist when balance is 0. This can lead to cases
    // where undefined is returned even if the account exists. Keep this as a
    // workaround until we have a clever and fast way to check account existence.
    // https://github.com/iov-one/iov-core/issues/676
    if (ethBalance.quantity === "0" && nonEmptyErc20Balances.length === 0) {
      return undefined;
    }

    // tslint:disable-next-line: readonly-array
    const outBalance = [ethBalance, ...nonEmptyErc20Balances];
    // Sort by ticker
    outBalance.sort((a, b) => a.tokenTicker.localeCompare(b.tokenTicker));

    const account: Account = {
      address: address,
      pubkey: undefined, // TODO: get from a transaction sent by this address
      balance: outBalance,
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
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }

    return decodeHexQuantityNonce(response.result);
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

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    const response = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [encodeQuantity(height), true],
      id: makeJsonRpcId(),
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
    const subscribeRequestId = makeJsonRpcId();
    let subscriptionId: string | undefined; // ID generated by the node
    let allMessagesSubscription: Subscription;
    const producer: Producer<BlockHeader> = {
      start: async listener => {
        allMessagesSubscription = this.rpcClient.events.subscribe({
          next: header => {
            const blockHeaderJson = JSON.parse(header.data);
            if (blockHeaderJson.method === "eth_subscription") {
              // test if this subscription event is ours
              if (
                typeof blockHeaderJson.params === "object" &&
                blockHeaderJson.params !== null &&
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
        await this.rpcClient.socketSend({
          id: subscribeRequestId,
          jsonrpc: "2.0",
          method: "eth_subscribe",
          params: ["newHeads", {}],
        });
      },
      stop: async () => {
        allMessagesSubscription.unsubscribe();
        if (!subscriptionId) {
          throw new Error("Subscription ID not set. This should not happen.");
        }
        // see https://github.com/ethereum/go-ethereum/wiki/RPC-PUB-SUB#cancel-subscription
        await this.rpcClient.socketSend(
          {
            id: makeJsonRpcId(),
            jsonrpc: "2.0",
            method: "eth_unsubscribe",
            params: [subscriptionId],
          },
          // Calling unsubscribe() and disconnect() leads to this stop callback being
          // called after disconnecting (due to the async nature of xstream's Producer
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
    // use non-undefined init value to ensure undefined is sent as an event
    let lastEvent: Account | {} | undefined = {};

    const producer: Producer<Account | undefined> = {
      start: async listener => {
        const poll = async (): Promise<void> => {
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

  public async getTx(id: TransactionId): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction>> {
    const searchResults = await this.searchTransactionsById(id);
    if (searchResults.length === 0) {
      throw new Error("Transaction does not exist");
    }
    if (searchResults.length > 1) {
      throw new Error("More than one transaction exists with this ID");
    }
    return searchResults[0];
  }

  public async searchTx(query: TransactionQuery): Promise<readonly ConfirmedTransaction<LightTransaction>[]> {
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

  public listenTx(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      throw new Error(
        "listenTx() is not implemented for ID queries because block heights are not always in sync this would give you unreliable results. What you probably want to use is liveTx(), which will find your transaction ID either in history or in updates.",
      );
    } else if (query.sentFromOrTo) {
      const sentFromOrTo = query.sentFromOrTo;

      let pollIntervalScraper: NodeJS.Timeout | undefined;
      const fromScraperProducer: Producer<ConfirmedTransaction<LightTransaction> | FailedTransaction> = {
        start: async listener => {
          const searchStartHeight = (await this.height()) - 1; // TODO: get current height from scraper
          let minHeight = Math.max(query.minHeight || 0, searchStartHeight);
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            if (!this.scraperApiUrl) {
              return;
            }
            const result = await this.searchSendTransactionsByAddressOnScraper(
              sentFromOrTo,
              minHeight,
              maxHeight,
            );
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollIntervalScraper = setInterval(poll, this.pollIntervalMs);
        },
        stop: () => {
          if (pollIntervalScraper) {
            clearInterval(pollIntervalScraper);
            pollIntervalScraper = undefined;
          }
        },
      };

      let pollIntervalLogs: NodeJS.Timeout | undefined;
      const fromLogsProducer: Producer<ConfirmedTransaction<LightTransaction> | FailedTransaction> = {
        start: async listener => {
          const currentHeight = await this.height();
          let minHeight = Math.max(query.minHeight || 0, currentHeight + 1);
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchSendTransactionsByAddressInLogs(
              sentFromOrTo,
              minHeight,
              maxHeight,
            );
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollIntervalLogs = setInterval(poll, this.pollIntervalMs);
        },
        stop: () => {
          if (pollIntervalLogs) {
            clearInterval(pollIntervalLogs);
            pollIntervalLogs = undefined;
          }
        },
      };

      const mergedStream = Stream.merge(Stream.create(fromScraperProducer), Stream.create(fromLogsProducer));
      const deduplicatedStream = mergedStream.compose(dropDuplicates(ct => ct.transactionId));
      return deduplicatedStream;
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      const searchId = query.id;
      const resultPromise = new Promise<ConfirmedTransaction<LightTransaction>>(async (resolve, reject) => {
        try {
          // eslint-disable-next-line no-constant-condition
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

      let pollIntervalScraper: NodeJS.Timeout | undefined;
      const fromScraperProducer: Producer<ConfirmedTransaction<LightTransaction> | FailedTransaction> = {
        start: async listener => {
          let minHeight = query.minHeight || 0;
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            if (!this.scraperApiUrl) {
              return;
            }
            const result = await this.searchSendTransactionsByAddressOnScraper(
              sentFromOrTo,
              minHeight,
              maxHeight,
            );
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollIntervalScraper = setInterval(poll, this.pollIntervalMs);
        },
        stop: () => {
          if (pollIntervalScraper) {
            clearInterval(pollIntervalScraper);
            pollIntervalScraper = undefined;
          }
        },
      };

      let pollIntervalLogs: NodeJS.Timeout | undefined;
      const fromLogsProducer: Producer<ConfirmedTransaction<LightTransaction> | FailedTransaction> = {
        start: async listener => {
          let minHeight = query.minHeight || 0;
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchSendTransactionsByAddressInLogs(
              sentFromOrTo,
              minHeight,
              maxHeight,
            );
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          await poll();
          pollIntervalLogs = setInterval(poll, this.pollIntervalMs);
        },
        stop: () => {
          if (pollIntervalLogs) {
            clearInterval(pollIntervalLogs);
            pollIntervalLogs = undefined;
          }
        },
      };

      const mergedStream = Stream.merge(Stream.create(fromScraperProducer), Stream.create(fromLogsProducer));
      const deduplicatedStream = mergedStream.compose(dropDuplicates(ct => ct.transactionId));
      return deduplicatedStream;
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public async getFeeQuote(transaction: UnsignedTransaction): Promise<Fee> {
    switch (transaction.kind) {
      case "bcp/send":
      case "bcp/swap_offer":
      case "bcp/swap_claim":
      case "bcp/swap_abort":
      case "erc20/approve":
        return {
          gasPrice: {
            // TODO: calculate dynamically from previous blocks or external API
            quantity: "20000000000", // 20 gwei
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          gasLimit: "2100000",
        };
      default:
        throw new Error("Received transaction of unsupported kind.");
    }
  }

  public async withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T> {
    return { ...transaction, fee: await this.getFeeQuote(transaction) };
  }

  public async getSwaps(
    query: AtomicSwapQuery,
    minHeight: number = 0,
    maxHeight: number = Number.MAX_SAFE_INTEGER,
  ): Promise<readonly AtomicSwap[]> {
    if (isAtomicSwapIdQuery(query)) {
      return this.getSwapsById(query);
    } else if (
      isAtomicSwapRecipientQuery(query) ||
      isAtomicSwapSenderQuery(query) ||
      isAtomicSwapHashQuery(query)
    ) {
      return this.getSwapsWithFilter(query, minHeight, maxHeight);
    } else {
      throw new Error("unsupported query type");
    }
  }

  public watchSwaps(_: AtomicSwapQuery): Stream<AtomicSwap> {
    throw new Error("not implemented");
  }

  private async searchTransactionsById(
    id: TransactionId,
  ): Promise<readonly ConfirmedAndSignedTransaction<UnsignedTransaction>[]> {
    const transactionsResponse = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [id],
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(transactionsResponse)) {
      throw new Error(JSON.stringify(transactionsResponse.error));
    }

    if (transactionsResponse.result === null) {
      return [];
    }

    if (transactionsResponse.result.blockNumber === null) {
      // transaction is pending
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

  /**
   * Merges search results from two different sources: scraper and logs.
   *
   * Those sources are not necessarily in sync, i.e. the a node's logs can contain
   * results from blocks that are not available in the scraper or vice versa.
   */
  private async searchSendTransactionsByAddress(
    address: Address,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly ConfirmedTransaction<LightTransaction>[]> {
    // tslint:disable-next-line:readonly-array
    const out: ConfirmedTransaction<LightTransaction>[] = [];

    if (this.scraperApiUrl) {
      const fromScraper = await this.searchSendTransactionsByAddressOnScraper(address, minHeight, maxHeight);
      out.push(...fromScraper);
    }

    const fromLogs = await this.searchSendTransactionsByAddressInLogs(address, minHeight, maxHeight);
    out.push(...fromLogs);

    // Sort by height, descending.
    // Order of multiple transactions in the same block is undetermined.
    // In https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionbyhash
    // Ethereum provides `transactionIndex` but this is not yet exposed in the BCP.
    out.sort((a, b) => b.height - a.height);

    return out;
  }

  private async searchSendTransactionsByAddressOnScraper(
    address: Address,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly ConfirmedTransaction<LightTransaction>[]> {
    if (!this.scraperApiUrl) {
      throw new Error("No scraper API URL specified.");
    }

    if (maxHeight < minHeight) {
      return [];
    }

    // tslint:disable-next-line:readonly-array
    const out: ConfirmedTransaction<LightTransaction>[] = [];

    // API: https://etherscan.io/apis#accounts
    const responseBody = (await axios.get(this.scraperApiUrl, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: minHeight,
        endblock: maxHeight,
        sort: "desc",
      },
    })).data;
    if (responseBody.result !== null) {
      for (const transaction of responseBody.result) {
        if (transaction.isError === "0" && transaction.txreceipt_status === "1") {
          const confirmed: ConfirmedTransaction<SendTransaction> = {
            transaction: {
              kind: "bcp/send",
              sender: toChecksummedAddress(transaction.from),
              recipient: toChecksummedAddress(transaction.to),
              amount: {
                quantity: transaction.value,
                fractionalDigits: constants.primaryTokenFractionalDigits,
                tokenTicker: constants.primaryTokenTicker,
              },
              fee: {
                gasLimit: transaction.gas,
                gasPrice: {
                  quantity: transaction.gasPrice,
                  fractionalDigits: constants.primaryTokenFractionalDigits,
                  tokenTicker: constants.primaryTokenTicker,
                },
              },
            },
            height: Number.parseInt(transaction.blockNumber, 10),
            confirmations: Number.parseInt(transaction.confirmations, 10),
            transactionId: Parse.transactionId(transaction.hash),
          };
          out.push(confirmed);
        }
      }
    }

    return out;
  }

  private async searchSendTransactionsByAddressInLogs(
    address: Address,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]> {
    const [erc20Outgoing, erc20Incoming] = await Promise.all([
      this.searchErc20Transfers(address, null, minHeight, maxHeight),
      this.searchErc20Transfers(null, address, minHeight, maxHeight),
    ]);

    // tslint:disable-next-line:readonly-array
    const out: ConfirmedTransaction<UnsignedTransaction>[] = [...erc20Outgoing, ...erc20Incoming];

    // Sort by height, descending.
    // Order of multiple transactions in the same block is undetermined.
    // In https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionbyhash
    // Ethereum provides `transactionIndex` but this is not yet exposed in the BCP.
    out.sort((a, b) => b.height - a.height);

    return out;
  }

  /**
   * The return values of this helper function are unsorted.
   */
  private async searchErc20Transfers(
    sender: Address | null,
    recipient: Address | null,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]> {
    if (maxHeight < minHeight) {
      return [];
    }

    // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getlogs
    const contractAddresses = [...this.erc20Tokens.values()].map(options => options.contractAddress);

    if (contractAddresses.length === 0) {
      return [];
    }

    const erc20TransferLogsResponse = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: [
        {
          fromBlock: encodeQuantity(minHeight),
          toBlock: encodeQuantity(maxHeight),
          address: contractAddresses,
          topics: [
            toEthereumHex(Abi.calculateMethodHash("Transfer(address,address,uint256)")),
            sender ? toEthereumHex(Abi.encodeAddress(sender)) : null,
            recipient ? toEthereumHex(Abi.encodeAddress(recipient)) : null,
          ],
        },
      ],
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(erc20TransferLogsResponse)) {
      throw new Error(JSON.stringify(erc20TransferLogsResponse.error));
    }

    if (!Array.isArray(erc20TransferLogsResponse.result)) {
      throw new Error("Expected result to be an array");
    }

    const ids = erc20TransferLogsResponse.result.map(row => Parse.transactionId(row.transactionHash));
    // query all in parallel
    const searches = await Promise.all(ids.map(id => this.searchTransactionsById(id)));

    const transactions = searches.map(search => search[0]);
    return transactions;
  }

  private async getSwapsById(query: AtomicSwapIdQuery): Promise<readonly AtomicSwap[]> {
    const data = Uint8Array.from([...Abi.calculateMethodId("get(bytes32)"), ...query.id.data]);
    const atomicSwapContractAddress =
      query.id.prefix === SwapIdPrefix.Ether
        ? this.atomicSwapEtherContractAddress
        : this.atomicSwapErc20ContractAddress;

    if (!atomicSwapContractAddress) {
      throw new Error(`No contract address for ${query.id.prefix} swaps`);
    }

    const params = [
      {
        to: atomicSwapContractAddress,
        data: toEthereumHex(data),
      },
    ] as readonly any[];
    const swapsResponse = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_call",
      params: params,
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(swapsResponse)) {
      throw new Error(JSON.stringify(swapsResponse.error));
    }

    if (swapsResponse.result === null) {
      return [];
    }

    const senderBegin = 0;
    const senderEnd = senderBegin + 32;
    const recipientBegin = senderEnd;
    const recipientEnd = recipientBegin + 32;
    const hashBegin = recipientEnd;
    const hashEnd = hashBegin + 32;
    const timeoutBegin = hashEnd;
    const timeoutEnd = timeoutBegin + 32;
    const amountBegin = timeoutEnd;
    const amountEnd = amountBegin + 32;
    const preimageBegin = amountEnd;
    const preimageEnd = preimageBegin + 32;
    const stateBegin = preimageEnd;
    const stateEnd = stateBegin + 32;
    const erc20ContractAddressBegin = stateEnd;
    const erc20ContractAddressEnd = erc20ContractAddressBegin + 32;

    const resultArray = Encoding.fromHex(normalizeHex(swapsResponse.result));
    const erc20ContractAddress =
      query.id.prefix === SwapIdPrefix.Erc20
        ? Abi.decodeAddress(resultArray.slice(erc20ContractAddressBegin, erc20ContractAddressEnd))
        : null;
    const erc20Token = erc20ContractAddress
      ? [...this.erc20Tokens.values()].find(token => token.contractAddress === erc20ContractAddress)
      : null;
    const fractionalDigits = erc20Token ? erc20Token.decimals : constants.primaryTokenFractionalDigits;
    const tokenTicker = erc20Token ? (erc20Token.symbol as TokenTicker) : constants.primaryTokenTicker;
    const swapData: SwapData = {
      id: query.id,
      sender: Abi.decodeAddress(resultArray.slice(senderBegin, senderEnd)),
      recipient: Abi.decodeAddress(resultArray.slice(recipientBegin, recipientEnd)),
      hash: resultArray.slice(hashBegin, hashEnd) as Hash,
      amounts: [
        {
          quantity: new BN(resultArray.slice(amountBegin, amountEnd)).toString(),
          fractionalDigits: fractionalDigits,
          tokenTicker: tokenTicker,
        },
      ] as readonly Amount[],
      timeout: {
        height: new BN(resultArray.slice(timeoutBegin, timeoutEnd)).toNumber(),
      },
    };

    const kind = Abi.decodeSwapProcessState(resultArray.slice(stateBegin, stateEnd));
    let swap: AtomicSwap;
    if (isSwapProcessStateOpen(kind)) {
      swap = {
        kind: kind,
        data: swapData,
      };
    } else if (isSwapProcessStateClaimed(kind)) {
      swap = {
        kind: kind,
        data: swapData,
        preimage: resultArray.slice(preimageBegin, preimageEnd) as Preimage,
      };
    } else if (isSwapProcessStateAborted(kind)) {
      swap = {
        kind: kind,
        data: swapData,
      };
    } else {
      throw new Error("unknown swap process state");
    }

    return [swap];
  }

  private async getSwapsWithFilter(
    query: AtomicSwapQuery,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly AtomicSwap[]> {
    if (!this.atomicSwapEtherContractAddress && !this.atomicSwapErc20ContractAddress) {
      throw new Error("Ethereum connection was not initialized with any atomic swap contract addresses");
    }

    const [etherLogs, erc20Logs] = await Promise.all([
      this.atomicSwapEtherContractAddress
        ? await this.getSwapLogs(this.atomicSwapEtherContractAddress, minHeight, maxHeight)
        : [],
      this.atomicSwapErc20ContractAddress
        ? await this.getSwapLogs(this.atomicSwapErc20ContractAddress, minHeight, maxHeight)
        : [],
    ]);

    return [
      ...etherLogs.map(log => ({ ...log, prefix: SwapIdPrefix.Ether })),
      ...erc20Logs.map(log => ({ ...log, prefix: SwapIdPrefix.Erc20 })),
    ]
      .reduce((accumulator: readonly AtomicSwap[], log: EthereumLogWithPrefix): readonly AtomicSwap[] => {
        const dataArray = Encoding.fromHex(normalizeHex(log.data));
        const kind = Abi.decodeEventSignature(Encoding.fromHex(normalizeHex(log.topics[0])));
        switch (kind) {
          case SwapContractEvent.Opened: {
            const parsed = EthereumConnection.parseOpenedEventBytes(dataArray, log.prefix, this.erc20Tokens);
            return parsed ? [...accumulator, parsed] : accumulator;
          }
          case SwapContractEvent.Claimed: {
            const update = EthereumConnection.parseClaimedEventBytes(dataArray);
            return EthereumConnection.updateSwapInList(accumulator, update, log.prefix);
          }
          case SwapContractEvent.Aborted: {
            const update = EthereumConnection.parseAbortedEventBytes(dataArray);
            return EthereumConnection.updateSwapInList(accumulator, update, log.prefix);
          }
          default:
            throw new Error("SwapContractEvent type not handled");
        }
      }, [])
      .filter((swap: AtomicSwap): boolean => {
        if (isAtomicSwapRecipientQuery(query)) {
          return swap.data.recipient === query.recipient;
        } else if (isAtomicSwapSenderQuery(query)) {
          return swap.data.sender === query.sender;
        } else if (isAtomicSwapHashQuery(query)) {
          return Encoding.toHex(swap.data.hash) === Encoding.toHex(query.hash);
        }
        throw new Error("unsupported query type");
      });
  }

  private async getSwapLogs(
    atomicSwapContractAddress: Address,
    minHeight: number,
    maxHeight: number,
  ): Promise<readonly EthereumLog[]> {
    const params = [
      {
        fromBlock: encodeQuantity(minHeight),
        toBlock: encodeQuantity(maxHeight),
        address: atomicSwapContractAddress,
      },
    ] as readonly any[];
    const swapsResponse = await this.rpcClient.run({
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: params,
      id: makeJsonRpcId(),
    });

    if (isJsonRpcErrorResponse(swapsResponse)) {
      throw new Error(JSON.stringify(swapsResponse.error));
    }
    return swapsResponse.result || [];
  }
}
