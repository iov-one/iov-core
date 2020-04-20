import { ChainId, Fee, PubkeyBundle } from "@iov/bcp";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import { SmartContractConfig, SmartContractType } from "./definitions";
import {
  EscrowAbortTransaction,
  EscrowClaimTransaction,
  EscrowOpenTransaction,
  EscrowContract,
} from "./escrowcontract";

export type CustomSmartContractTransaction =
  | EscrowOpenTransaction
  | EscrowClaimTransaction
  | EscrowAbortTransaction;

export class CustomSmartContractTransactionBuilder {
  public static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    config: SmartContractConfig,
  ): CustomSmartContractTransaction {
    if (config.type === SmartContractType.EscrowSmartContract) {
      return EscrowContract.buildTransaction(input, json, chainId, fee, signerPubkey, config);
    } else {
      throw new Error("unknown custom smart contract type");
    }
  }
}
