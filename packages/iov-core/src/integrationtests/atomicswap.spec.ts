import BN = require("bn.js");

import {
  Address,
  Amount,
  BcpAtomicSwapConnection,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isFailedTransaction,
  isSwapCounterTransaction,
  PublicIdentity,
  SwapClaimTransaction,
  SwapCounterTransaction,
  SwapOfferTransaction,
  SwapState,
  TokenTicker,
} from "@iov/bcp-types";
import { bnsConnector, bnsSwapQueryTag } from "@iov/bns";
import { Random, Sha256, Slip10RawIndex } from "@iov/crypto";
import { Ed25519HdWallet, HdPaths, UserProfile, WalletId } from "@iov/keycontrol";
import { firstEvent } from "@iov/stream";

import { MultiChainSigner } from "../multichainsigner";

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tendermintSearchIndexUpdated(): Promise<void> {
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
  readonly mainWalletId: WalletId;
  readonly signer: MultiChainSigner;
  readonly bnsConnection: BcpAtomicSwapConnection;
  readonly bcpConnection: BcpAtomicSwapConnection;
  readonly bnsIdentity: PublicIdentity;
  readonly bcpIdentity: PublicIdentity;
}

class Actor {
  public static async create(mnemonic: string, hdPath: ReadonlyArray<Slip10RawIndex>): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
    const signer = new MultiChainSigner(profile);

    const bnsConnection = (await signer.addChain(bnsConnector("ws://localhost:22345"))).connection;
    const bcpConnection = (await signer.addChain(bnsConnector("ws://localhost:23457"))).connection;

    const bnsIdentity = await profile.createIdentity(wallet.id, bnsConnection.chainId(), hdPath);
    const bcpIdentity = await profile.createIdentity(wallet.id, bcpConnection.chainId(), hdPath);

    return new Actor({
      mainWalletId: wallet.id,
      signer: signer,
      bnsConnection: bnsConnection as BcpAtomicSwapConnection,
      bcpConnection: bcpConnection as BcpAtomicSwapConnection,
      bnsIdentity: bnsIdentity,
      bcpIdentity: bcpIdentity,
    });
  }

  public readonly bnsIdentity: PublicIdentity;
  public readonly bcpIdentity: PublicIdentity;
  public get bnsAddress(): Address {
    return this.signer.identityToAddress(this.bnsIdentity);
  }
  public get bcpAddress(): Address {
    return this.signer.identityToAddress(this.bcpIdentity);
  }

  private readonly mainWalletId: WalletId;
  private readonly signer: MultiChainSigner;
  private readonly bnsConnection: BcpAtomicSwapConnection;
  private readonly bcpConnection: BcpAtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private preimage: Uint8Array | undefined;

  constructor(data: ActorData) {
    this.mainWalletId = data.mainWalletId;
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
    const amount = balance.find(row => row.tokenTicker === "CASH");
    return new BN(amount ? amount.quantity : 0);
  }

  // MASH is a token on BCP
  public async getMashBalance(): Promise<BN> {
    const account = await this.bcpConnection.getAccount({ pubkey: this.bcpIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === "MASH");
    return new BN(amount ? amount.quantity : 0);
  }

  public async generatePreimage(): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    this.preimage = await Random.getBytes(32);
  }

  public async sendSwapOfferOnBns(recipient: Address, amount: Amount): Promise<void> {
    const offer: SwapOfferTransaction = {
      kind: "bcp/swap_offer",
      creator: this.bnsIdentity,
      memo: "Take this cash",
      recipient: recipient,
      timeout: (await this.bnsConnection.height()) + 100,
      hash: new Sha256(this.preimage!).digest(),
      amounts: [amount],
    };
    const post = await this.signer.signAndPost(offer, this.mainWalletId);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
  }

  public async sendSwapCounterOnBcp(recipient: Address, amount: Amount): Promise<void> {
    // ensure correct offer was sent on BNS
    // TODO: search swap offer by ID
    const offerReview = await firstEvent(
      this.bnsConnection.liveTx({ tags: [bnsSwapQueryTag({ recipient: this.bnsAddress })] }),
    );
    if (isFailedTransaction(offerReview)) {
      throw new Error("Transaction must not fail");
    }
    if (!isSwapCounterTransaction(offerReview.transaction)) {
      throw new Error("Expected swap counter type");
    }

    if (offerReview.transaction.recipient !== this.bnsAddress) {
      throw new Error("Swap offer has wrong recipient");
    }

    expect(offerReview.transaction.amounts.length).toEqual(1);
    expect(offerReview.transaction.amounts[0].quantity).toEqual("2000000000");
    expect(offerReview.transaction.amounts[0].fractionalDigits).toEqual(9);
    expect(offerReview.transaction.amounts[0].tokenTicker).toEqual("CASH");

    // sent counter on BCP
    const counter: SwapCounterTransaction = {
      kind: "bcp/swap_counter",
      creator: this.bcpIdentity,
      amounts: [amount],
      recipient: recipient,
      // TODO: some clever cross chain timeout calculation where counter lives longer than offer
      timeout: (await this.bcpConnection.height()) + 200,
      hash: offerReview.transaction.hash,
    };

    const post = await this.signer.signAndPost(counter, this.mainWalletId);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
  }

  public async claimFromPreimageOnBcp(): Promise<void> {
    // review counter
    // TODO: search counter by swap ID
    const searchResult = await this.bcpConnection.getSwaps({ recipient: this.bcpAddress });
    expect(searchResult.length).toEqual(1);
    const counterReview = searchResult[0];

    if (counterReview.kind !== SwapState.Open) {
      throw new Error("Swap should be open");
    }

    if (counterReview.data.recipient !== this.bcpAddress) {
      throw new Error("Swap counter has wrong recipient");
    }

    expect(counterReview.data.amounts.length).toEqual(1);
    expect(counterReview.data.amounts[0].quantity).toEqual("5000000000");
    expect(counterReview.data.amounts[0].fractionalDigits).toEqual(9);
    expect(counterReview.data.amounts[0].tokenTicker).toEqual("MASH");

    // reciew ok, alice claims MASH on BCP
    const claim: SwapClaimTransaction = {
      kind: "bcp/swap_claim",
      creator: this.bcpIdentity,
      swapId: counterReview.data.id,
      preimage: this.preimage!,
    };

    const post = await this.signer.signAndPost(claim, this.mainWalletId);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
  }

  public async claimFromClaimOnBns(): Promise<void> {
    const searchResults = await this.bcpConnection.getSwaps({ sender: this.bcpAddress });
    expect(searchResults.length).toEqual(1);
    const claim1Review = searchResults[0];

    if (claim1Review.kind !== SwapState.Claimed) {
      throw new Error("Swap should be claimed");
    }

    // found preimage on BCP, now bob claims CASH on BNS
    const claim2: SwapClaimTransaction = {
      kind: "bcp/swap_claim",
      creator: this.bnsIdentity,
      swapId: claim1Review.data.id,
      preimage: claim1Review.preimage, // public data now!
    };

    const post = await this.signer.signAndPost(claim2, this.mainWalletId);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
  }
}

describe("Full atomic swap", () => {
  // Note: due to some assumptions this only runs when bnsd and bcpd are restarted before this test
  it("works", async () => {
    pendingWithoutBnsd();
    pendingWithoutBcpd();

    const alice = await Actor.create(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.simpleAddress(0),
    );
    expect(alice.bnsAddress).toEqual("tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f");
    expect(alice.bcpAddress).toEqual("tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f");

    const bob = await Actor.create(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
    );
    expect(bob.bnsAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");
    expect(bob.bcpAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");

    // alice owns CASH on BNS but no MASH
    const aliceInitialCash = await alice.getCashBalance();
    const aliceInitialMash = await alice.getMashBalance();
    expect(aliceInitialCash.gtn(100_000000000)).toEqual(true);
    expect(aliceInitialMash.toString()).toEqual("0");

    // bob owns MASH on BCP but no CASH
    const bobInitialCash = await bob.getCashBalance();
    const bobInitialMash = await bob.getMashBalance();
    expect(bobInitialCash.toString()).toEqual("0");
    expect(bobInitialMash.gtn(100_000000000)).toEqual(true);

    // A secret that only Alice knows
    await alice.generatePreimage();

    await alice.sendSwapOfferOnBns(bob.bnsAddress, {
      quantity: "2000000000",
      fractionalDigits: 9,
      tokenTicker: "CASH" as TokenTicker,
    });

    // Alice's 2 CASH are locked in the contract
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2000000000");

    await bob.sendSwapCounterOnBcp(alice.bcpAddress, {
      quantity: "5000000000",
      fractionalDigits: 9,
      tokenTicker: "MASH" as TokenTicker,
    });

    // Bob's 5 MASH are locked in the contract
    expect(bobInitialMash.sub(await bob.getMashBalance()).toString()).toEqual("5000000000");

    await alice.claimFromPreimageOnBcp();

    // Alice revealed her secret and should own 5 MASH now
    expect((await alice.getMashBalance()).toString()).toEqual("5000000000");

    await bob.claimFromClaimOnBns();

    // Bob used Alice's preimage to claim his 2 CASH
    expect((await bob.getCashBalance()).toString()).toEqual("2000000000");

    // Alice's CASH balance now down by 2
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2000000000");

    // Bob's MASH balance now down by 5
    expect(bobInitialMash.sub(await bob.getMashBalance()).toString()).toEqual("5000000000");
  });
});
