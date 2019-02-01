import { BcpAtomicSwap, OpenSwap } from "./atomicswap";
import { SwapClaimTransaction, SwapTimeoutTransaction } from "./transactions";
export declare class AtomicSwapMerger {
    private readonly open;
    process(event: OpenSwap | SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap;
    /** The unsettled swaps this object currently holds */
    openSwaps(): ReadonlyArray<OpenSwap>;
}
