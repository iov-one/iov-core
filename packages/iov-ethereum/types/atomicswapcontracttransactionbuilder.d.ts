import {
  Address,
  ChainId,
  Fee,
  PubkeyBundle,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
} from "@iov/bcp";
import { Erc20TokensMap } from "types";
import { SwapIdPrefix } from "./serializationcommon";
export declare class AtomicSwapContractTransactionBuilder {
  static buildTransaction(
    input: Uint8Array,
    erc20Tokens: Erc20TokensMap,
    chainId: ChainId,
    value: string,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    atomicSwapContractAddress: Address,
    prefix: SwapIdPrefix,
  ): SwapOfferTransaction | SwapClaimTransaction | SwapAbortTransaction;
}
