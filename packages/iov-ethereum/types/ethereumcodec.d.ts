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
import { SmartContractConfig } from "./smartcontracts/definitions";
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
   * Custom smart contracts configuration
   */
  readonly customSmartContractConfig?: SmartContractConfig;
  /**
   * ERC20 tokens supported by the codec instance.
   *
   * The behaviour of encoding/decoding transactions for other tokens is undefined.
   */
  readonly erc20Tokens?: Erc20TokensMap;
}
export declare class EthereumCodec implements TxCodec {
  private static getMemoFromInput;
  private readonly atomicSwapEtherContractAddress?;
  private readonly atomicSwapErc20ContractAddress?;
  private readonly customSmartContractConfig?;
  private readonly erc20Tokens;
  constructor(options: EthereumCodecOptions);
  bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob;
  bytesToPost(signed: SignedTransaction): PostableBytes;
  identifier(signed: SignedTransaction): TransactionId;
  parseBytes(bytes: PostableBytes, chainId: ChainId): SignedTransaction;
  identityToAddress(identity: Identity): Address;
  isValidAddress(address: string): boolean;
  private getCustomSmartContractAddress;
  private getAtomicSwapContractAddress;
  private parseBytesBuildTransaction;
}
/** An unconfigured EthereumCodec for backwards compatibility */
export declare const ethereumCodec: EthereumCodec;
