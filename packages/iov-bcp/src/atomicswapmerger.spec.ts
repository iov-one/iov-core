import { Encoding } from "@iov/encoding";

import { AtomicSwapHelpers } from "./atomicswaphelpers";
import { AtomicSwapMerger } from "./atomicswapmerger";
import { ClaimedSwap, OpenSwap, Preimage, SwapProcessState } from "./atomicswaptypes";
import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  PublicKeyBundle,
  PublicKeyBytes,
  SwapClaimTransaction,
  SwapId,
  SwapIdBytes,
  TokenTicker,
  WithCreator,
} from "./transactions";

const { fromHex } = Encoding;

describe("AtomicSwapMerger", () => {
  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can process open and close", () => {
    const alice = "tiov1u8syu9juwx668k4vqfwl5vtm8j6yz89wamkcda" as Address;
    const bobPubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("97adfd82b8e6a93368361c5b9256a85bbfb8ed7421372bf7d3fc54498c8ea730") as PublicKeyBytes,
    };
    const bobAddress = "tiov1lpzdluzsq3u7tqkfkp3rmrfavkhv0ly56gjexe" as Address;
    const preimage = fromHex("00110011") as Preimage;
    const hash = AtomicSwapHelpers.hashPreimage(preimage);
    const swapId: SwapId = {
      data: fromHex("aabbcc") as SwapIdBytes,
    };
    const open: OpenSwap = {
      kind: SwapProcessState.Open,
      data: {
        id: swapId,
        sender: alice,
        recipient: bobAddress,
        hash: hash,
        amounts: [defaultAmount],
        timeout: { height: 1_000_000 },
      },
    };

    const claim: SwapClaimTransaction & WithCreator = {
      kind: "bcp/swap_claim",
      creator: {
        chainId: "lalala" as ChainId,
        pubkey: bobPubkey,
      },
      swapId: swapId,
      preimage: preimage,
    };

    const merger = new AtomicSwapMerger();
    expect(merger.openSwaps().length).toEqual(0);

    expect(merger.process(open)).toEqual(open);
    expect(merger.openSwaps().length).toEqual(1);

    const expectedSettle: ClaimedSwap = {
      kind: SwapProcessState.Claimed,
      data: open.data,
      preimage: preimage,
    };
    expect(merger.process(claim)).toEqual(expectedSettle);
    expect(merger.openSwaps().length).toEqual(0);
  });

  it("can process open A/B and close B/A", () => {
    const alice = "tiov1u8syu9juwx668k4vqfwl5vtm8j6yz89wamkcda" as Address;
    const bobPubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("97adfd82b8e6a93368361c5b9256a85bbfb8ed7421372bf7d3fc54498c8ea730") as PublicKeyBytes,
    };
    const bobAddress = "tiov1lpzdluzsq3u7tqkfkp3rmrfavkhv0ly56gjexe" as Address;

    const preimageA = fromHex("00110011") as Preimage;
    const preimageB = fromHex("aabbeeff") as Preimage;
    const hashA = AtomicSwapHelpers.hashPreimage(preimageA);
    const hashB = AtomicSwapHelpers.hashPreimage(preimageB);
    const swapIdA: SwapId = {
      data: fromHex("aabbcc") as SwapIdBytes,
    };
    const swapIdB: SwapId = {
      data: fromHex("112233") as SwapIdBytes,
    };
    const openA: OpenSwap = {
      kind: SwapProcessState.Open,
      data: {
        id: swapIdA,
        sender: alice,
        recipient: bobAddress,
        hash: hashA,
        amounts: [defaultAmount],
        timeout: { height: 1_000_000 },
      },
    };
    const openB: OpenSwap = {
      kind: SwapProcessState.Open,
      data: {
        id: swapIdB,
        sender: alice,
        recipient: bobAddress,
        hash: hashB,
        amounts: [defaultAmount],
        timeout: { height: 1_000_000 },
      },
    };

    const claimA: SwapClaimTransaction & WithCreator = {
      kind: "bcp/swap_claim",
      creator: {
        chainId: "lalala" as ChainId,
        pubkey: bobPubkey,
      },
      swapId: swapIdA,
      preimage: preimageA,
    };

    const claimB: SwapClaimTransaction & WithCreator = {
      kind: "bcp/swap_claim",
      creator: {
        chainId: "lalala" as ChainId,
        pubkey: bobPubkey,
      },
      swapId: swapIdB,
      preimage: preimageB,
    };

    const merger = new AtomicSwapMerger();
    expect(merger.openSwaps().length).toEqual(0);

    expect(merger.process(openA)).toEqual(openA);
    expect(merger.openSwaps().length).toEqual(1);

    expect(merger.process(openB)).toEqual(openB);
    expect(merger.openSwaps().length).toEqual(2);

    const expectedSettleB: ClaimedSwap = {
      kind: SwapProcessState.Claimed,
      data: openB.data,
      preimage: preimageB,
    };
    expect(merger.process(claimB)).toEqual(expectedSettleB);
    expect(merger.openSwaps().length).toEqual(1);

    const expectedSettleA: ClaimedSwap = {
      kind: SwapProcessState.Claimed,
      data: openA.data,
      preimage: preimageA,
    };
    expect(merger.process(claimA)).toEqual(expectedSettleA);
    expect(merger.openSwaps().length).toEqual(0);
  });

  it("throws when the same ID is added twice", () => {
    const alice = "tiov1u8syu9juwx668k4vqfwl5vtm8j6yz89wamkcda" as Address;
    const bobAddress = "tiov1lpzdluzsq3u7tqkfkp3rmrfavkhv0ly56gjexe" as Address;
    const preimage = fromHex("00110011") as Preimage;
    const hash = AtomicSwapHelpers.hashPreimage(preimage);
    const swapId: SwapId = {
      data: fromHex("aabbcc") as SwapIdBytes,
    };
    const open: OpenSwap = {
      kind: SwapProcessState.Open,
      data: {
        id: swapId,
        sender: alice,
        recipient: bobAddress,
        hash: hash,
        amounts: [defaultAmount],
        timeout: { height: 1_000_000 },
      },
    };

    const merger = new AtomicSwapMerger();
    expect(merger.openSwaps().length).toEqual(0);
    expect(merger.process(open)).toEqual(open);
    expect(merger.openSwaps().length).toEqual(1);
    expect(() => merger.process(open)).toThrowError(/swap ID already in open swaps pool/i);
    expect(merger.openSwaps().length).toEqual(1);
  });

  it("can process open and close in reverse order", () => {
    const alice = "tiov1u8syu9juwx668k4vqfwl5vtm8j6yz89wamkcda" as Address;
    const bobPubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("97adfd82b8e6a93368361c5b9256a85bbfb8ed7421372bf7d3fc54498c8ea730") as PublicKeyBytes,
    };
    const bobAddress = "tiov1lpzdluzsq3u7tqkfkp3rmrfavkhv0ly56gjexe" as Address;
    const preimage = fromHex("00110011") as Preimage;
    const hash = AtomicSwapHelpers.hashPreimage(preimage);
    const swapId: SwapId = {
      data: fromHex("aabbcc") as SwapIdBytes,
    };
    const open: OpenSwap = {
      kind: SwapProcessState.Open,
      data: {
        id: swapId,
        sender: alice,
        recipient: bobAddress,
        hash: hash,
        amounts: [defaultAmount],
        timeout: { height: 1_000_000 },
      },
    };

    const claim: SwapClaimTransaction & WithCreator = {
      kind: "bcp/swap_claim",
      creator: {
        chainId: "lalala" as ChainId,
        pubkey: bobPubkey,
      },
      swapId: swapId,
      preimage: preimage,
    };

    const merger = new AtomicSwapMerger();
    expect(merger.openSwaps().length).toEqual(0);

    expect(merger.process(claim)).toEqual(undefined);
    expect(merger.openSwaps().length).toEqual(0);

    const expectedSettle: ClaimedSwap = {
      kind: SwapProcessState.Claimed,
      data: open.data,
      preimage: preimage,
    };
    expect(merger.process(open)).toEqual(expectedSettle);
    expect(merger.openSwaps().length).toEqual(0);
  });
});
