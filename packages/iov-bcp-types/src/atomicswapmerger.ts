import { BcpAtomicSwap, OpenSwap, SwapState } from "./atomicswap";
import { SwapClaimTransaction, SwapTimeoutTransaction } from "./transactions";

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap {
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
  // tslint:disable-next-line:readonly-array
  private readonly open: OpenSwap[] = [];

  public process(event: OpenSwap | SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap {
    switch (event.kind) {
      case SwapState.Open:
        if (this.open.findIndex(x => arraysEqual(x.data.id, event.data.id)) !== -1) {
          throw new Error("Swap ID already in open swaps pool");
        }
        this.open.push(event);
        return event;
      default:
        // event is a swap claim/timeout, resolve an open swap and return new state
        const idx = this.open.findIndex(x => arraysEqual(x.data.id, event.swapId));
        const done = settleAtomicSwap(this.open[idx], event);
        this.open.splice(idx, 1);
        return done;
    }
  }

  /** The unsettled swaps this object currently holds */
  public openSwaps(): ReadonlyArray<OpenSwap> {
    // defensive copy
    return [...this.open];
  }
}
