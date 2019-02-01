import { Encoding } from "@iov/encoding";

import { BcpAtomicSwap, OpenSwap, SwapState } from "./atomicswap";
import { SwapClaimTransaction, SwapTimeoutTransaction } from "./transactions";

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
  private readonly open = new Map<string, OpenSwap>();

  public process(event: OpenSwap | SwapClaimTransaction | SwapTimeoutTransaction): BcpAtomicSwap {
    switch (event.kind) {
      case SwapState.Open: {
        const idAsHex = Encoding.toHex(event.data.id);
        if (this.open.has(idAsHex)) {
          throw new Error("Swap ID already in open swaps pool");
        }
        this.open.set(idAsHex, event);
        return event;
      }
      default: {
        // event is a swap claim/timeout, resolve an open swap and return new state
        const idAsHex = Encoding.toHex(event.swapId);
        const matchingOpenElement = this.open.get(idAsHex);
        if (!matchingOpenElement) {
          throw new Error("No matching elemement found in open swaps pool");
        }
        const done = settleAtomicSwap(matchingOpenElement, event);
        this.open.delete(idAsHex);
        return done;
      }
    }
  }

  /** The unsettled swaps this object currently holds in undefined order */
  public openSwaps(): ReadonlyArray<OpenSwap> {
    return [...this.open.values()];
  }
}
