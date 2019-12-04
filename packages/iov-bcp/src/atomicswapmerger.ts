import {
  AtomicSwap,
  OpenSwap,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapProcessState,
} from "./atomicswaptypes";
import { swapIdEquals } from "./transactions";

function settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTransaction | SwapAbortTransaction): AtomicSwap {
  if (tx.kind === "bcp/swap_claim") {
    return {
      kind: SwapProcessState.Claimed,
      data: swap.data,
      preimage: tx.preimage,
    };
  } else {
    return {
      kind: SwapProcessState.Aborted,
      data: swap.data,
    };
  }
}

export class AtomicSwapMerger {
  private readonly open = new Array<OpenSwap>();
  private readonly settling = new Array<SwapClaimTransaction | SwapAbortTransaction>();

  /**
   * Takes an event, checks if there is already a matching open or settling event
   * stored in the pool and merges.
   */
  public process(event: OpenSwap | SwapClaimTransaction | SwapAbortTransaction): AtomicSwap | undefined {
    switch (event.kind) {
      case SwapProcessState.Open: {
        const eventId = event.data.id;
        const matchingSettlingElement = this.settling.find(s => swapIdEquals(s.swapId, eventId));
        if (matchingSettlingElement) {
          // we can settle
          const settled = settleAtomicSwap(event, matchingSettlingElement);
          this.settling.splice(
            this.settling.findIndex(s => swapIdEquals(s.swapId, eventId)),
            1,
          );
          return settled;
        } else {
          // store for later
          if (this.open.find(o => swapIdEquals(o.data.id, eventId))) {
            throw new Error("Swap ID already in open swaps pool");
          }
          this.open.push(event);
          return event;
        }
      }
      default: {
        // event is a swap claim/abort, resolve an open swap and return new state
        const eventId = event.swapId;
        const matchingOpenElement = this.open.find(o => swapIdEquals(o.data.id, eventId));
        if (matchingOpenElement) {
          const settled = settleAtomicSwap(matchingOpenElement, event);
          this.open.splice(
            this.open.findIndex(o => swapIdEquals(o.data.id, eventId)),
            1,
          );
          return settled;
        } else {
          // store swap claim/abort in case a matching open comes in delayed
          if (this.settling.find(s => swapIdEquals(s.swapId, eventId))) {
            throw new Error("Swap ID already in closing swaps pool");
          }
          this.settling.push(event);
          return undefined;
        }
      }
    }
  }

  /** The unsettled swaps this object currently holds in undefined order */
  public openSwaps(): readonly OpenSwap[] {
    return [...this.open];
  }
}
