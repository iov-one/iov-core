import {
  Address,
  Amount,
  BlockHeightTimeout,
  ChainId,
  Fee,
  Hash,
  PubkeyBundle,
  SwapId,
  SwapIdBytes,
  SwapTimeout,
  UnsignedTransaction,
} from "@iov/bcp";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import {
  GenericTransactionSerializerParameters,
  SignedSerializationOptions,
  UnsignedSerializationOptions,
} from "../serializationcommon";
import { SmartContractConfig } from "../smartcontracts/definitions";
interface EscrowBaseTransaction extends UnsignedTransaction {
  readonly sender: Address;
  readonly chainId: ChainId;
  readonly swapId: SwapId;
}
export interface EscrowOpenTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_open";
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: SwapTimeout;
  readonly amount: Amount;
}
export interface EscrowClaimTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_claim";
  readonly recipient: Address;
}
export interface EscrowAbortTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_abort";
}
export declare function isEscrowOpenTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowOpenTransaction;
export declare function isEscrowClaimTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowClaimTransaction;
export declare function isEscrowAbortTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowAbortTransaction;
export declare function isEscrowTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowBaseTransaction;
export declare enum EscrowContractState {
  NON_EXISTENT = 0,
  OPEN = 1,
  CLAIMED = 2,
  ABORTED = 3,
}
export interface EscrowContractSwap {
  readonly sender: Address;
  readonly recipient: Address;
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: BlockHeightTimeout;
  readonly amount: Amount;
  readonly state: EscrowContractState;
}
export declare function getEscrowBySwapId(swapId: SwapIdBytes): EscrowContractSwap | null;
export declare class EscrowContract {
  static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    config: SmartContractConfig,
  ): EscrowAbortTransaction | EscrowClaimTransaction | EscrowOpenTransaction;
  static checkOpenTransaction(tx: EscrowOpenTransaction): void;
  static checkClaimTransaction(tx: EscrowClaimTransaction): void;
  static checkAbortTransaction(tx: EscrowAbortTransaction): void;
  static abort(swapId: SwapId): Uint8Array;
  static claim(swapId: SwapId, recipient: Address): Uint8Array;
  static open(swapId: SwapId, arbiter: Address, hash: Hash, timeout: SwapTimeout): Uint8Array;
  static serializeUnsignedTransaction(
    unsigned: EscrowBaseTransaction,
    options: UnsignedSerializationOptions,
  ): GenericTransactionSerializerParameters;
  static serializeSignedTransaction(
    unsigned: EscrowBaseTransaction,
    options: SignedSerializationOptions,
  ): GenericTransactionSerializerParameters;
  private static readonly OPEN_METHOD_ID;
  private static readonly CLAIM_METHOD_ID;
  private static readonly ABORT_METHOD_ID;
  private static readonly METHODS;
  private static readonly NO_SMART_CONTRACT_ADDRESS_ERROR;
  private static checkTransaction;
  private static getMethodTypeFromInput;
  private static serializeSignedOpenTransaction;
  private static serializeSignedClaimTransaction;
  private static serializeSignedAbortTransaction;
  private static serializeUnsignedOpenTransaction;
  private static serializeUnsignedClaimTransaction;
  private static serializeUnsignedAbortTransaction;
}
export {};
