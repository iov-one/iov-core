import { AtomicSwap, OpenSwap, SwapAbortTransaction, SwapClaimTransaction } from "./atomicswaptypes";
export declare class AtomicSwapMerger {
  private readonly open;
  private readonly settling;
  /**
   * Takes an event, checks if there is already a matching open or settling event
   * stored in the pool and merges.
   */
  process(event: OpenSwap | SwapClaimTransaction | SwapAbortTransaction): AtomicSwap | undefined;
  /** The unsettled swaps this object currently holds in undefined order */
  openSwaps(): readonly OpenSwap[];
}
