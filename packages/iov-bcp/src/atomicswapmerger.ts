import { Encoding } from "@iov/encoding";

import { AtomicSwap, OpenSwap, SwapState } from "./atomicswaptypes";
import { SwapAbortTransaction, SwapClaimTransaction } from "./transactions";

function settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTransaction | SwapAbortTransaction): AtomicSwap {
  if (tx.kind === "bcp/swap_claim") {
    return {
      kind: SwapState.Claimed,
      data: swap.data,
      preimage: tx.preimage,
    };
  } else {
    return {
      kind: SwapState.Expired,
      data: swap.data,
    };
  }
}

export class AtomicSwapMerger {
  private readonly open = new Map<string, OpenSwap>();
  private readonly settling = new Map<string, SwapClaimTransaction | SwapAbortTransaction>();

  /**
   * Takes an event, checks if there is already a matching open or settling event
   * stored in the pool and merges.
   */
  public process(event: OpenSwap | SwapClaimTransaction | SwapAbortTransaction): AtomicSwap | undefined {
    switch (event.kind) {
      case SwapState.Open: {
        const idAsHex = Encoding.toHex(event.data.id);

        const matchingSettlingElement = this.settling.get(idAsHex);
        if (matchingSettlingElement) {
          // we can settle
          const settled = settleAtomicSwap(event, matchingSettlingElement);
          this.settling.delete(idAsHex);
          return settled;
        } else {
          // store for later
          if (this.open.has(idAsHex)) {
            throw new Error("Swap ID already in open swaps pool");
          }
          this.open.set(idAsHex, event);
          return event;
        }
      }
      default: {
        // event is a swap claim/abort, resolve an open swap and return new state
        const idAsHex = Encoding.toHex(event.swapId);
        const matchingOpenElement = this.open.get(idAsHex);
        if (matchingOpenElement) {
          const settled = settleAtomicSwap(matchingOpenElement, event);
          this.open.delete(idAsHex);
          return settled;
        } else {
          // store swap claim/abort in case a matching open comes in delayed
          if (this.settling.has(idAsHex)) {
            throw new Error("Swap ID already in closing swaps pool");
          }
          this.settling.set(idAsHex, event);
          return undefined;
        }
      }
    }
  }

  /** The unsettled swaps this object currently holds in undefined order */
  public openSwaps(): ReadonlyArray<OpenSwap> {
    return [...this.open.values()];
  }
}
