import { BcpAtomicSwap, OpenSwap } from "./atomicswap";
import { SwapClaimTransaction, SwapTimeoutTransaction } from "./transactions";
export declare class AtomicSwapMerger {
    private readonly open;
    private readonly settling;
    /**
     * Takes an event, checks if there is already a matching open or settling event
     * stored in the pool and merges.
     */
    process(event: OpenSwap | SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap | undefined;
    /** The unsettled swaps this object currently holds in undefined order */
    openSwaps(): ReadonlyArray<OpenSwap>;
}
