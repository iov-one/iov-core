import {
  ChainId,
  Fee,
  PubkeyBundle,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
} from "@iov/bcp";
import { Erc20ApproveTransaction, Erc20Options } from "./erc20";
import { EthereumRpcTransactionResult } from "./ethereumrpctransactionresult";
export declare class Erc20TokenTransactionBuilder {
  static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    erc20Token: Erc20Options,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
  ):
    | SendTransaction
    | Erc20ApproveTransaction
    | SwapOfferTransaction
    | SwapClaimTransaction
    | SwapAbortTransaction;
}
