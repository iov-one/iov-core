import { Address, ChainId, Hash, SwapId } from "@iov/bcp";
import { As } from "type-tagger";
/** A package-internal type representing a Weave Condition */
export declare type Condition = Uint8Array & As<"Condition">;
export declare function buildSwapCondition(swap: { readonly id: SwapId; readonly hash: Hash }): Condition;
export declare function buildMultisignatureCondition(multisignatureId: Uint8Array): Condition;
export declare function buildEscrowCondition(id: Uint8Array): Condition;
export declare function conditionToWeaveAddress(cond: Condition): Uint8Array;
export declare function conditionToAddress(chainId: ChainId, cond: Condition): Address;
export declare function swapToAddress(
  chainId: ChainId,
  swap: {
    readonly id: SwapId;
    readonly hash: Hash;
  },
): Address;
export declare function multisignatureIdToAddress(chainId: ChainId, multisignatureId: Uint8Array): Address;
export declare function escrowIdToAddress(chainId: ChainId, escrowId: Uint8Array): Address;
export declare function electionRuleIdToAddress(chainId: ChainId, electionRule: number): Address;
