import { Address, ChainId, Hash, SwapId } from "@iov/bcp";
import { As } from "type-tagger";
/** A Weave condition */
export declare type Condition = Uint8Array & As<"Condition">;
export declare function buildCondition(extension: string, type: string, data: Uint8Array): Condition;
export declare function buildMultisignatureCondition(id: number): Condition;
export declare function buildEscrowCondition(id: number): Condition;
export declare function conditionToWeaveAddress(cond: Condition): Uint8Array;
export declare function conditionToAddress(chainId: ChainId, cond: Condition): Address;
export declare function swapToAddress(
  chainId: ChainId,
  swap: {
    readonly id: SwapId;
    readonly hash: Hash;
  },
): Address;
export declare function multisignatureIdToAddress(chainId: ChainId, multisignatureId: number): Address;
export declare function escrowIdToAddress(chainId: ChainId, escrowId: number): Address;
export declare function electionRuleIdToAddress(chainId: ChainId, electionRule: number): Address;
