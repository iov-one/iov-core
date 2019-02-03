import {
  BcpAtomicSwapConnection,
  isBlockInfoPending,
  isFailedTransaction,
  isSwapCounterTransaction,
  PublicIdentity,
  SwapClaimTransaction,
  SwapCounterTransaction,
  SwapOfferTransaction,
  SwapState,
  TokenTicker,
  TransactionState,
} from "@iov/bcp-types";
import { bnsConnector, bnsSwapQueryTag } from "@iov/bns";
import { Sha256, Slip10RawIndex } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
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

interface Actor {
  readonly mainWalletId: WalletId;
  readonly signer: MultiChainSigner;
  readonly bnsConnection: BcpAtomicSwapConnection;
  readonly bcpConnection: BcpAtomicSwapConnection;
  readonly bnsIdentity: PublicIdentity;
  readonly bcpIdentity: PublicIdentity;
}

async function buildActor(mnemonic: string, hdPath: ReadonlyArray<Slip10RawIndex>): Promise<Actor> {
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
  const signer = new MultiChainSigner(profile);

  const bnsConnection = (await signer.addChain(bnsConnector("ws://localhost:22345"))).connection;
  const bcpConnection = (await signer.addChain(bnsConnector("ws://localhost:23457"))).connection;

  const bnsIdentity = await profile.createIdentity(wallet.id, bnsConnection.chainId(), hdPath);
  const bcpIdentity = await profile.createIdentity(wallet.id, bcpConnection.chainId(), hdPath);

  return {
    mainWalletId: wallet.id,
    signer: signer,
    bnsConnection: bnsConnection as BcpAtomicSwapConnection,
    bcpConnection: bcpConnection as BcpAtomicSwapConnection,
    bnsIdentity: bnsIdentity,
    bcpIdentity: bcpIdentity,
  };
}

describe("Full atomic swap", () => {
  // Note: due to some assumptions this only runs when bnsd and bcpd are restarted before this test
  it("works", async () => {
    pendingWithoutBnsd();
    pendingWithoutBcpd();

    // alice owns CASH tokens on BNS
    const alice = await buildActor(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.simpleAddress(0),
    );
    expect(alice.signer.identityToAddress(alice.bnsIdentity)).toEqual(
      "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f",
    );
    expect(alice.signer.identityToAddress(alice.bcpIdentity)).toEqual(
      "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f",
    );
    // console.log("Alice connected");

    // bob owns MASH tokens on BCP
    const bob = await buildActor(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
    );
    expect(bob.signer.identityToAddress(bob.bnsIdentity)).toEqual(
      "tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp",
    );
    expect(bob.signer.identityToAddress(bob.bcpIdentity)).toEqual(
      "tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp",
    );
    // console.log("Bob connected");

    // alice checks her balance on BCP
    {
      const account = await alice.bcpConnection.getAccount({ pubkey: alice.bcpIdentity.pubkey });
      expect(account).toBeUndefined();
    }

    // bob checks his balance on BNS
    {
      const account = await bob.bnsConnection.getAccount({ pubkey: bob.bnsIdentity.pubkey });
      expect(account).toBeUndefined();
    }

    // console.log("Accounts checked");

    // belongs to alice. Bob will not read this variable
    const preimage = Encoding.toAscii("aabbcc!!4bn34n7899(s)d(ffg)bp34");

    {
      const offer: SwapOfferTransaction = {
        kind: "bcp/swap_offer",
        creator: alice.bnsIdentity,
        memo: "Take this cash",
        recipient: alice.signer.identityToAddress(bob.bnsIdentity),
        timeout: (await alice.bnsConnection.height()) + 100,
        hash: new Sha256(preimage).digest(),
        amounts: [
          {
            quantity: "2",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        ],
      };
      const post = await alice.signer.signAndPost(offer, alice.mainWalletId);
      const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);
    }

    // console.log("Offer sent on BNS");

    {
      const bobAddressOnBns = bob.signer.identityToAddress(bob.bnsIdentity);
      const bobOfferReview = await firstEvent(
        bob.bnsConnection.liveTx({ tags: [bnsSwapQueryTag({ recipient: bobAddressOnBns })] }),
      );
      if (isFailedTransaction(bobOfferReview)) {
        throw new Error("Transaction must not fail");
      }
      if (!isSwapCounterTransaction(bobOfferReview.transaction)) {
        throw new Error("Expected swap counter type");
      }

      expect(bobOfferReview.transaction.recipient).toEqual(bobAddressOnBns);
      expect(bobOfferReview.transaction.amounts.length).toEqual(1);
      expect(bobOfferReview.transaction.amounts[0].quantity).toEqual("2");
      expect(bobOfferReview.transaction.amounts[0].fractionalDigits).toEqual(9);
      expect(bobOfferReview.transaction.amounts[0].tokenTicker).toEqual("CASH");

      const counter: SwapCounterTransaction = {
        kind: "bcp/swap_counter",
        creator: bob.bcpIdentity,
        amounts: [
          {
            quantity: "5",
            fractionalDigits: 9,
            tokenTicker: "MASH" as TokenTicker,
          },
        ],
        recipient: bob.signer.identityToAddress(alice.bcpIdentity),
        // TODO: some clever cross chain timeout calculation where counter lives longer than offer
        timeout: (await bob.bcpConnection.height()) + 200,
        hash: bobOfferReview.transaction.hash,
      };
      {
        const post = await bob.signer.signAndPost(counter, bob.mainWalletId);
        const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }
    }

    // console.log("Counter sent on BCP");
    await tendermintSearchIndexUpdated();

    {
      const aliceAddressOnBcp = alice.signer.identityToAddress(alice.bcpIdentity);
      const aliceCounterReviews = await alice.bcpConnection.getSwaps({ recipient: aliceAddressOnBcp });
      expect(aliceCounterReviews.length).toEqual(1);
      const aliceCounterReview = aliceCounterReviews[0];

      if (aliceCounterReview.kind !== SwapState.Open) {
        throw new Error("Swap should be open");
      }

      expect(aliceCounterReview.data.recipient).toEqual(aliceAddressOnBcp);
      expect(aliceCounterReview.data.amounts.length).toEqual(1);
      expect(aliceCounterReview.data.amounts[0].quantity).toEqual("5");
      expect(aliceCounterReview.data.amounts[0].fractionalDigits).toEqual(9);
      expect(aliceCounterReview.data.amounts[0].tokenTicker).toEqual("MASH");

      // reciew ok, alice claims MASH on BCP
      const claim: SwapClaimTransaction = {
        kind: "bcp/swap_claim",
        creator: alice.bcpIdentity,
        swapId: aliceCounterReview.data.id,
        preimage: preimage,
      };

      {
        const post = await alice.signer.signAndPost(claim, alice.mainWalletId);
        const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      await tendermintSearchIndexUpdated();

      // Alice revealed her secret and should own 5 MASH now
      {
        const account = await alice.bcpConnection.getAccount({ pubkey: alice.bcpIdentity.pubkey });
        expect(account).toBeDefined();
        expect(account!.balance[0].quantity).toEqual("5");
        expect(account!.balance[0].fractionalDigits).toEqual(9);
        expect(account!.balance[0].tokenTicker).toEqual("MASH");
      }
    }

    // console.log("Alice revealed on BCP and got funded");

    {
      const bobAddressOnBcp = bob.signer.identityToAddress(bob.bcpIdentity);
      const claimReviews = await bob.bcpConnection.getSwaps({ sender: bobAddressOnBcp });
      expect(claimReviews.length).toEqual(1);
      const claimReview = claimReviews[0];

      if (claimReview.kind !== SwapState.Claimed) {
        throw new Error("Swap should be claimed");
      }

      // bob found preimage on BCP, now bob claims CASH on BNS
      const claim: SwapClaimTransaction = {
        kind: "bcp/swap_claim",
        creator: bob.bnsIdentity,
        swapId: claimReview.data.id,
        preimage: claimReview.preimage, // public data now!
      };

      {
        const post = await bob.signer.signAndPost(claim, bob.mainWalletId);
        const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      await tendermintSearchIndexUpdated();

      // Bob used Alice's preimage to claim his 2 CASH
      {
        const account = await bob.bnsConnection.getAccount({ pubkey: bob.bnsIdentity.pubkey });
        expect(account).toBeDefined();
        expect(account!.balance[0].quantity).toEqual("2");
        expect(account!.balance[0].fractionalDigits).toEqual(9);
        expect(account!.balance[0].tokenTicker).toEqual("CASH");
      }
    }

    // console.log("Bob claimed on BNS");
  });
});
