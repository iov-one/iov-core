import {
  Address,
  ChainId,
  Identity,
  Nonce,
  PostableBytes,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Erc20TokensMap } from "./erc20";
/**
 * See https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionbyhash
 *
 * This interface is package-internal.
 */
export interface EthereumRpcTransactionResult {
  readonly blockHash: string;
  readonly blockNumber: string;
  readonly from: string;
  /** Gas limit as set by the user */
  readonly gas: string;
  readonly gasPrice: string;
  readonly hash: string;
  readonly input: string;
  readonly nonce: string;
  readonly r: string;
  readonly s: string;
  readonly to: string;
  readonly transactionIndex: string;
  readonly v: string;
  readonly value: string;
}
export interface EthereumCodecOptions {
  /**
   * Address of the deployed atomic swap contract for ETH.
   */
  readonly atomicSwapEtherContractAddress?: Address;
  /**
   * Address of the deployed atomic swap contract for ERC20 tokens.
   */
  readonly atomicSwapErc20ContractAddress?: Address;
  /**
   * ERC20 tokens supported by the codec instance.
   *
   * The behaviour of encoding/decoding transactions for other tokens is undefined.
   */
  readonly erc20Tokens?: Erc20TokensMap;
}
export declare class EthereumCodec implements TxCodec {
  private readonly atomicSwapEtherContractAddress?;
  private readonly atomicSwapErc20ContractAddress?;
  private readonly erc20Tokens;
  constructor(options: EthereumCodecOptions);
  bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob;
  bytesToPost(signed: SignedTransaction): PostableBytes;
  identifier(signed: SignedTransaction): TransactionId;
  parseBytes(bytes: PostableBytes, chainId: ChainId): SignedTransaction;
  identityToAddress(identity: Identity): Address;
  isValidAddress(address: string): boolean;
  private getAtomicSwapContractAddress;
}
/** An unconfigured EthereumCodec for backwards compatibility */
export declare const ethereumCodec: EthereumCodec;
