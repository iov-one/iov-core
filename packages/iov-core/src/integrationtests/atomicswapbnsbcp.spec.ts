import BN = require("bn.js");

import {
  Address,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapHelpers,
  createTimestampTimeout,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isClaimedSwap,
  Preimage,
  SendTransaction,
  SwapClaimTransaction,
  SwapId,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapProcessState,
  TokenTicker,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { bnsConnector } from "@iov/bns";
import { Slip10RawIndex } from "@iov/crypto";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "../multichainsigner";

const CASH = "CASH" as TokenTicker;
const MASH = "MASH" as TokenTicker;

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

function pendingWithoutBcpd(): void {
  if (!process.env.BCPD_ENABLED) {
    pending("Set BCPD_ENABLED to enable bcpd-based tests");
  }
}

interface ActorData {
  readonly signer: MultiChainSigner;
  readonly bnsConnection: AtomicSwapConnection;
  readonly bcpConnection: AtomicSwapConnection;
  readonly bnsIdentity: Identity;
  readonly bcpIdentity: Identity;
}

class Actor {
  public static async create(mnemonic: string, hdPath: ReadonlyArray<Slip10RawIndex>): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
    const signer = new MultiChainSigner(profile);

    const bnsConnection = (await signer.addChain(bnsConnector("ws://localhost:23456"))).connection;
    const bcpConnection = (await signer.addChain(bnsConnector("ws://localhost:23457"))).connection;

    const bnsIdentity = await profile.createIdentity(wallet.id, bnsConnection.chainId(), hdPath);
    const bcpIdentity = await profile.createIdentity(wallet.id, bcpConnection.chainId(), hdPath);

    return new Actor({
      signer: signer,
      bnsConnection: bnsConnection as AtomicSwapConnection,
      bcpConnection: bcpConnection as AtomicSwapConnection,
      bnsIdentity: bnsIdentity,
      bcpIdentity: bcpIdentity,
    });
  }

  public readonly bnsIdentity: Identity;
  public readonly bcpIdentity: Identity;
  public get bnsAddress(): Address {
    return this.signer.identityToAddress(this.bnsIdentity);
  }
  public get bcpAddress(): Address {
    return this.signer.identityToAddress(this.bcpIdentity);
  }

  private readonly signer: MultiChainSigner;
  private readonly bnsConnection: AtomicSwapConnection;
  private readonly bcpConnection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private preimage: Preimage | undefined;

  constructor(data: ActorData) {
    this.signer = data.signer;
    this.bnsConnection = data.bnsConnection;
    this.bcpConnection = data.bcpConnection;
    this.bnsIdentity = data.bnsIdentity;
    this.bcpIdentity = data.bcpIdentity;
  }

  // CASH is a token on BNS
  public async getCashBalance(): Promise<BN> {
    const account = await this.bnsConnection.getAccount({ pubkey: this.bnsIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === CASH);
    return new BN(amount ? amount.quantity : 0);
  }

  // MASH is a token on BCP
  public async getMashBalance(): Promise<BN> {
    const account = await this.bcpConnection.getAccount({ pubkey: this.bcpIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === MASH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async getBnsSwap(id: SwapId): Promise<AtomicSwap> {
    const swaps = await this.bnsConnection.getSwaps({ id: id });
    return swaps[swaps.length - 1];
  }

  public async getBcpSwap(id: SwapId): Promise<AtomicSwap> {
    const swaps = await this.bcpConnection.getSwaps({ id: id });
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
    const transaction = await this.bnsConnection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: this.bnsIdentity,
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction);
  }

  public async sendBcpTokens(recipient: Address, amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.bcpConnection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: this.bcpIdentity,
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction);
  }

  public async sendSwapOfferOnBns(recipient: Address, amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.bnsConnection.withDefaultFee<SwapOfferTransaction & WithCreator>({
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

  public async sendSwapCounterOnBcp(
    offer: AtomicSwap,
    recipient: Address,
    amount: Amount,
  ): Promise<Uint8Array | undefined> {
    const transaction = await this.bcpConnection.withDefaultFee<SwapOfferTransaction & WithCreator>({
      kind: "bcp/swap_offer",
      creator: this.bcpIdentity,
      amounts: [amount],
      recipient: recipient,
      timeout: createTimestampTimeout(100),
      hash: offer.data.hash,
    });
    return this.sendTransaction(transaction);
  }

  public async claimFromKnownPreimageOnBcp(offer: AtomicSwap): Promise<Uint8Array | undefined> {
    const transaction = await this.bcpConnection.withDefaultFee<SwapClaimTransaction & WithCreator>({
      kind: "bcp/swap_claim",
      creator: this.bcpIdentity,
      swapId: offer.data.id,
      preimage: this.preimage!,
    });
    return this.sendTransaction(transaction);
  }

  public async claimFromRevealedPreimageOnBns(
    claim: AtomicSwap,
    unclaimedId: SwapId,
  ): Promise<Uint8Array | undefined> {
    if (!isClaimedSwap(claim)) {
      throw new Error("Expected swap to be claimed");
    }
    const transaction = await this.bnsConnection.withDefaultFee<SwapClaimTransaction & WithCreator>({
      kind: "bcp/swap_claim",
      creator: this.bnsIdentity,
      swapId: unclaimedId,
      preimage: claim.preimage, // public data now!
    });
    return this.sendTransaction(transaction);
  }
}

describe("Full atomic swap between bns and bcp", () => {
  // TODO: handle different fees... right now with assumes 0.01 of the main token as fee
  it("works", async () => {
    pendingWithoutBnsd();
    pendingWithoutBcpd();

    const alice = await Actor.create(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.iov(0),
    );
    expect(alice.bnsAddress).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");
    expect(alice.bcpAddress).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");

    const bob = await Actor.create(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
    );
    expect(bob.bnsAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");
    expect(bob.bcpAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");

    // We need to send a 0.01 tokens to the other ones to allow claim fees
    await alice.sendBnsTokens(bob.bnsAddress, {
      quantity: "10000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });
    await bob.sendBcpTokens(alice.bcpAddress, {
      quantity: "10000000",
      fractionalDigits: 9,
      tokenTicker: MASH,
    });

    // alice owns CASH on BNS but no MASH
    const aliceInitialCash = await alice.getCashBalance();
    const aliceInitialMash = await alice.getMashBalance();
    expect(aliceInitialCash.gtn(100_000000000)).toEqual(true);

    // bob owns MASH on BCP but no CASH
    const bobInitialCash = await bob.getCashBalance();
    const bobInitialMash = await bob.getMashBalance();
    expect(bobInitialMash.gtn(100_000000000)).toEqual(true);

    // A secret that only Alice knows
    await alice.generatePreimage();

    const aliceOfferId = {
      data: (await alice.sendSwapOfferOnBns(bob.bnsAddress, {
        quantity: "2000000000",
        fractionalDigits: 9,
        tokenTicker: CASH,
      })) as SwapIdBytes,
    };

    // Alice's 2 CASH are locked in the contract (also consider fee)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2010000000");

    // check correct offer was sent on BNS
    const aliceOffer = await bob.getBnsSwap(aliceOfferId);
    expect(aliceOffer.kind).toEqual(SwapProcessState.Open);
    expect(aliceOffer.data.recipient).toEqual(bob.bnsAddress);
    expect(aliceOffer.data.amounts.length).toEqual(1);
    expect(aliceOffer.data.amounts[0]).toEqual({
      quantity: "2000000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });

    const bobOfferId = {
      data: (await bob.sendSwapCounterOnBcp(aliceOffer, alice.bcpAddress, {
        quantity: "5000000000",
        fractionalDigits: 9,
        tokenTicker: MASH,
      })) as SwapIdBytes,
    };

    // Bob's 5 MASH are locked in the contract (plus the fee deduction)
    expect(bobInitialMash.sub(await bob.getMashBalance()).toString()).toEqual("5010000000");

    // check correct counteroffer was made on BCP
    const bobOffer = await alice.getBcpSwap(bobOfferId);
    expect(bobOffer.kind).toEqual(SwapProcessState.Open);
    expect(bobOffer.data.recipient).toEqual(alice.bcpAddress);
    expect(bobOffer.data.amounts.length).toEqual(1);
    expect(bobOffer.data.amounts[0]).toEqual({
      quantity: "5000000000",
      fractionalDigits: 9,
      tokenTicker: MASH,
    });
    await alice.claimFromKnownPreimageOnBcp(bobOffer);

    // Alice revealed her secret and should own 5 MASH now
    expect((await alice.getMashBalance()).sub(aliceInitialMash).toString()).toEqual("4990000000");

    // check claim was made on BCP
    const aliceClaim = await bob.getBcpSwap(bobOfferId);
    expect(aliceClaim.kind).toEqual(SwapProcessState.Claimed);

    await bob.claimFromRevealedPreimageOnBns(aliceClaim, aliceOfferId);

    // check claim was made on BNS
    const bobClaim = await alice.getBnsSwap(aliceOfferId);
    expect(bobClaim.kind).toEqual(SwapProcessState.Claimed);

    // Bob used Alice's preimage to claim his 2 CASH
    expect((await bob.getCashBalance()).sub(bobInitialCash).toString()).toEqual("1990000000");

    // Alice's CASH balance now down by 2 (plus fees)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2010000000");

    // Bob's MASH balance now down by 5 (plus fees)
    expect(bobInitialMash.sub(await bob.getMashBalance()).toString()).toEqual("5010000000");
  });
});
