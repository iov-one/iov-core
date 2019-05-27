import BN = require("bn.js");

import {
  Address,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapHelpers,
  ClaimedSwap,
  createTimestampTimeout,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  Preimage,
  PublicIdentity,
  SendTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapProcessState,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { bnsConnector } from "@iov/bns";
import { Slip10RawIndex } from "@iov/crypto";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "../multichainsigner";

const CASH = "CASH" as TokenTicker;
const BASH = "BASH" as TokenTicker;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tendermintSearchIndexUpdated(): Promise<void> {
  // Tendermint needs some time before a committed transaction is found in search
  return sleep(50);
}

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

interface ActorData {
  readonly signer: MultiChainSigner;
  readonly bnsConnection: AtomicSwapConnection;
  readonly bnsIdentity: PublicIdentity;
}

class Actor {
  public static async create(mnemonic: string, hdPath: readonly Slip10RawIndex[]): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
    const signer = new MultiChainSigner(profile);

    const bnsConnection = (await signer.addChain(bnsConnector("ws://localhost:23456"))).connection;

    const bnsIdentity = await profile.createIdentity(wallet.id, bnsConnection.chainId(), hdPath);

    return new Actor({
      signer: signer,
      bnsConnection: bnsConnection as AtomicSwapConnection,
      bnsIdentity: bnsIdentity,
    });
  }

  public readonly bnsIdentity: PublicIdentity;
  public get bnsAddress(): Address {
    return this.signer.identityToAddress(this.bnsIdentity);
  }

  private readonly signer: MultiChainSigner;
  private readonly bnsConnection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private preimage: Preimage | undefined;

  constructor(data: ActorData) {
    this.signer = data.signer;
    this.bnsConnection = data.bnsConnection;
    this.bnsIdentity = data.bnsIdentity;
  }

  // CASH is a token on BNS
  public async getCashBalance(): Promise<BN> {
    const account = await this.bnsConnection.getAccount({ pubkey: this.bnsIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === CASH);
    return new BN(amount ? amount.quantity : 0);
  }

  // BASH is a token on BNS
  public async getBashBalance(): Promise<BN> {
    const account = await this.bnsConnection.getAccount({ pubkey: this.bnsIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === BASH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async getBnsSwap(id: SwapIdBytes): Promise<AtomicSwap> {
    const swaps = await this.bnsConnection.getSwaps({ swapid: id });
    return swaps[swaps.length - 1];
  }

  public async generatePreimage(): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    this.preimage = await AtomicSwapHelpers.createPreimage();
  }

  public async sendTransaction(transaction: UnsignedTransaction): Promise<Uint8Array | undefined> {
    const post = await this.signer.signAndPost(transaction);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
    return blockInfo.result;
  }

  public async sendBnsTokens(recipient: Address, amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SendTransaction>({
      kind: "bcp/send",
      creator: this.bnsIdentity,
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction);
  }

  public async sendSwapOfferOnBns(recipient: Address, amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SwapOfferTransaction>({
      kind: "bcp/swap_offer",
      creator: this.bnsIdentity,
      memo: "Take this cash",
      recipient: recipient,
      timeout: createTimestampTimeout(200),
      hash: AtomicSwapHelpers.hashPreimage(this.preimage!),
      amounts: [amount],
    });
    return this.sendTransaction(transaction);
  }

  public async sendSwapCounterOnBns(
    offer: AtomicSwap,
    recipient: Address,
    amount: Amount,
  ): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SwapOfferTransaction>({
      kind: "bcp/swap_offer",
      creator: this.bnsIdentity,
      amounts: [amount],
      recipient: recipient,
      timeout: createTimestampTimeout(100),
      hash: offer.data.hash,
    });
    return this.sendTransaction(transaction);
  }

  public async claimFromKnownPreimageOnBns(offer: AtomicSwap): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SwapClaimTransaction>({
      kind: "bcp/swap_claim",
      creator: this.bnsIdentity,
      swapId: offer.data.id,
      preimage: this.preimage!,
    });
    return this.sendTransaction(transaction);
  }

  public async claimFromRevealedPreimageOnBns(
    claim: AtomicSwap,
    unclaimedId: Uint8Array,
  ): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SwapClaimTransaction>({
      kind: "bcp/swap_claim",
      creator: this.bnsIdentity,
      swapId: unclaimedId as SwapIdBytes,
      preimage: (claim as ClaimedSwap).preimage, // public data now!
    });
    return this.sendTransaction(transaction);
  }
}

describe("Full atomic swap between BNS and BNS", () => {
  // TODO: handle different fees... right now with assumes 0.01 of the main token as fee
  it("works", async () => {
    pendingWithoutBnsd();

    const alice = await Actor.create(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.iov(0),
    );
    expect(alice.bnsAddress).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");

    const bob = await Actor.create(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
    );
    expect(bob.bnsAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");

    // TODO: let independent faucet send those tokens
    // We need to send some native fee tokens to Bob
    // 0.01 CASH send swap counter
    // 0.01 CASH claim
    await alice.sendBnsTokens(bob.bnsAddress, {
      quantity: "20000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });

    // alice owns a lot of CASH on BNS
    const aliceInitialCash = await alice.getCashBalance();
    const aliceInitialBash = await alice.getBashBalance();
    expect(aliceInitialCash.gt(new BN(100_000000000))).toEqual(true);

    // bob owns a lot of BASH and some CASH (for fees) on BNS
    const bobInitialCash = await bob.getCashBalance();
    const bobInitialBash = await bob.getBashBalance();
    expect(bobInitialBash.gt(new BN(100_000000000))).toEqual(true);

    // A secret that only Alice knows
    await alice.generatePreimage();

    const aliceOfferId = await alice.sendSwapOfferOnBns(bob.bnsAddress, {
      quantity: "2000000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });

    // Alice's 2 CASH are locked in the contract (also consider fee)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2010000000");

    // check correct offer was sent on BNS
    const aliceOffer = await bob.getBnsSwap(aliceOfferId as SwapIdBytes);
    expect(aliceOffer.kind).toEqual(SwapProcessState.Open);
    expect(aliceOffer.data.recipient).toEqual(bob.bnsAddress);
    expect(aliceOffer.data.amounts.length).toEqual(1);
    expect(aliceOffer.data.amounts[0]).toEqual({
      quantity: "2000000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });

    const bobOfferId = await bob.sendSwapCounterOnBns(aliceOffer, alice.bnsAddress, {
      quantity: "5000000000",
      fractionalDigits: 9,
      tokenTicker: BASH,
    });

    // Bob's 5 BASH are locked in the contract
    expect(bobInitialBash.sub(await bob.getBashBalance()).toString()).toEqual("5000000000");

    // check correct counteroffer was made
    const bobOffer = await alice.getBnsSwap(bobOfferId as SwapIdBytes);
    expect(bobOffer.kind).toEqual(SwapProcessState.Open);
    expect(bobOffer.data.recipient).toEqual(alice.bnsAddress);
    expect(bobOffer.data.amounts.length).toEqual(1);
    expect(bobOffer.data.amounts[0]).toEqual({
      quantity: "5000000000",
      fractionalDigits: 9,
      tokenTicker: BASH,
    });
    await alice.claimFromKnownPreimageOnBns(bobOffer);

    // Alice revealed her secret and should own 5 BASH now
    expect((await alice.getBashBalance()).sub(aliceInitialBash).toString()).toEqual("5000000000");

    // check claim was made
    const aliceClaim = await bob.getBnsSwap(bobOfferId as SwapIdBytes);
    expect(aliceClaim.kind).toEqual(SwapProcessState.Claimed);

    await bob.claimFromRevealedPreimageOnBns(aliceClaim, aliceOfferId!);

    // check claim was made on BNS
    const bobClaim = await alice.getBnsSwap(aliceOfferId as SwapIdBytes);
    expect(bobClaim.kind).toEqual(SwapProcessState.Claimed);

    // Bob used Alice's preimage to claim his 2 CASH (minus fees)
    expect((await bob.getCashBalance()).sub(bobInitialCash).toString()).toEqual("1980000000");

    // Alice's CASH balance now down by 2 (plus fees)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2020000000");

    // Bob's BASH balance now down by 5
    expect(bobInitialBash.sub(await bob.getBashBalance()).toString()).toEqual("5000000000");
  });
});
