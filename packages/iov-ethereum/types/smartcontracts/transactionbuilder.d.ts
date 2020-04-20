import { ChainId, Fee, PubkeyBundle } from "@iov/bcp";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import { SmartContractConfig } from "./definitions";
import { EscrowAbortTransaction, EscrowClaimTransaction, EscrowOpenTransaction } from "./escrowcontract";
export declare type CustomSmartContractTransaction =
  | EscrowOpenTransaction
  | EscrowClaimTransaction
  | EscrowAbortTransaction;
export declare class CustomSmartContractTransactionBuilder {
  static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    config: SmartContractConfig,
  ): CustomSmartContractTransaction;
}
