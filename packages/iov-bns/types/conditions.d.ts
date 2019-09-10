import { Address, ChainId, SwapData } from "@iov/bcp";
import { As } from "type-tagger";
/** A package-internal type representing a Weave Condition */
export declare type Condition = Uint8Array & As<"Condition">;
export declare function buildSwapCondition(swap: SwapData): Condition;
export declare function buildMultisignatureCondition(multisignatureId: Uint8Array): Condition;
export declare function buildEscrowCondition(id: Uint8Array): Condition;
export declare function conditionToWeaveAddress(cond: Condition): Uint8Array;
export declare function conditionToAddress(chainId: ChainId, cond: Condition): Address;
