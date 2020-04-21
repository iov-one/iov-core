import {
  Address,
  Amount,
  ChainId,
  Fee,
  Hash,
  PubkeyBundle,
  SwapId,
  SwapTimeout,
  UnsignedTransaction,
} from "@iov/bcp";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import { SmartContractConfig } from "../smartcontracts/definitions";
interface EscrowBaseTransaction extends UnsignedTransaction {
  readonly sender: Address;
  readonly amount: Amount;
  readonly chainId: ChainId;
  readonly swapId: SwapId;
}
export interface EscrowOpenTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_open";
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: SwapTimeout;
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
  private static readonly OPEN_METHOD_ID;
  private static readonly CLAIM_METHOD_ID;
  private static readonly ABORT_METHOD_ID;
  private static readonly METHODS;
  private static checkTransaction;
  private static getMethodTypeFromInput;
}
export {};
