import BN from "bn.js";

import {
  Address,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapHelpers,
  ClaimedSwap,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  OpenSwap,
  Preimage,
  PublicIdentity,
  PublicKeyBundle,
  SendTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  SwapProcessState,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";

import { EthereumCodec } from "../ethereumcodec";
import { EthereumConnection } from "../ethereumconnection";
import { testConfig } from "../testconfig.spec";

const ETH = "ETH" as TokenTicker;
const ethereumCodec = new EthereumCodec({
  atomicSwapEtherContractAddress: testConfig.connectionOptions.atomicSwapEtherContractAddress,
});

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

interface ActorData {
  readonly profile: UserProfile;
  readonly connection: AtomicSwapConnection;
  readonly senderIdentity: PublicIdentity;
  readonly receiverIdentity: PublicIdentity;
}

class Actor {
  public static async create(mnemonic: string, addressIndex1: number, addressIndex2: number): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(mnemonic));
    const connection: AtomicSwapConnection = await EthereumConnection.establish(
      testConfig.base,
      testConfig.connectionOptions,
    );
    const path1 = HdPaths.ethereum(addressIndex1);
    const path2 = HdPaths.ethereum(addressIndex2);
    const senderIdentity = await profile.createIdentity(wallet.id, connection.chainId(), path1);
    const receiverIdentity = await profile.createIdentity(wallet.id, connection.chainId(), path2);
    return new Actor({
      profile: profile,
      connection: connection,
      senderIdentity: senderIdentity,
      receiverIdentity: receiverIdentity,
    });
  }

  public readonly senderIdentity: PublicIdentity;
  public readonly receiverIdentity: PublicIdentity;

  public get sendAddress(): Address {
    return ethereumCodec.identityToAddress(this.senderIdentity);
  }

  public get receiveAddress(): Address {
    return ethereumCodec.identityToAddress(this.receiverIdentity);
  }

  private readonly profile: UserProfile;
  private readonly connection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private preimage?: Preimage;

  public constructor(data: ActorData) {
    this.profile = data.profile;
    this.connection = data.connection;
    this.senderIdentity = data.senderIdentity;
    this.receiverIdentity = data.receiverIdentity;
  }

  public async sendTransaction(transaction: UnsignedTransaction, pubkey: PublicKeyBundle): Promise<void> {
    const nonce = await this.connection.getNonce({ pubkey: pubkey });
    const signed = await this.profile.signTransaction(transaction, ethereumCodec, nonce);
    const postable = await ethereumCodec.bytesToPost(signed);
    const post = await this.connection.postTx(postable);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
  }

  public async sendEther(recipient: Address, amount: Amount): Promise<void> {
    const transaction = await this.connection.withDefaultFee<SendTransaction>({
      kind: "bcp/send",
      creator: this.senderIdentity,
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction, this.senderIdentity.pubkey);
  }

  public async getSenderBalance(): Promise<BN> {
    const account = await this.connection.getAccount({ pubkey: this.senderIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === "ETH");
    return new BN(amount ? amount.quantity : 0);
  }

  public async getReceiverBalance(): Promise<BN> {
    const account = await this.connection.getAccount({ pubkey: this.receiverIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === "ETH");
    return new BN(amount ? amount.quantity : 0);
  }

  public async getReceiverSwaps(): Promise<readonly AtomicSwap[]> {
    return this.connection.getSwaps({ recipient: this.receiveAddress });
  }

  public async getSenderSwaps(): Promise<readonly AtomicSwap[]> {
    return this.connection.getSwaps({ sender: this.sendAddress });
  }

  public async generatePreimage(): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    this.preimage = await AtomicSwapHelpers.createPreimage();
  }

  public async sendSwapOffer(recipient: Address, amount: Amount): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    const transaction = await this.connection.withDefaultFee<SwapOfferTransaction>({
      kind: "bcp/swap_offer",
      creator: this.senderIdentity,
      recipient: recipient,
      amounts: [amount],
      swapId: await AtomicSwapHelpers.createId(),
      hash: AtomicSwapHelpers.hashPreimage(this.preimage!),
      timeout: {
        height: (await this.connection.height()) + 5,
      },
    });
    return this.sendTransaction(transaction, this.senderIdentity.pubkey);
  }

  public async sendSwapCounter(recipient: Address, amount: Amount, offer: AtomicSwap): Promise<void> {
    // send counteroffer
    const transaction = await this.connection.withDefaultFee<SwapOfferTransaction>({
      kind: "bcp/swap_offer",
      creator: this.senderIdentity,
      recipient: recipient,
      amounts: [amount],
      swapId: await AtomicSwapHelpers.createId(),
      hash: offer.data.hash,
      timeout: {
        height: (await this.connection.height()) + 5,
      },
    });
    return this.sendTransaction(transaction, this.senderIdentity.pubkey);
  }

  public async claimFromKnownPreimage(counter: AtomicSwap): Promise<void> {
    // claim funds
    const transaction = await this.connection.withDefaultFee<SwapClaimTransaction>({
      kind: "bcp/swap_claim",
      creator: this.receiverIdentity,
      swapId: counter.data.id,
      preimage: this.preimage!,
    });
    return this.sendTransaction(transaction, this.receiverIdentity.pubkey);
  }

  public async claimFromRevealedPreimage(offer: OpenSwap, claimed: ClaimedSwap): Promise<void> {
    // counter claim funds
    const transaction = await this.connection.withDefaultFee<SwapClaimTransaction>({
      kind: "bcp/swap_claim",
      creator: this.receiverIdentity,
      swapId: offer.data.id,
      preimage: claimed.preimage,
    });
    return this.sendTransaction(transaction, this.receiverIdentity.pubkey);
  }
}

describe("Full atomic swap", () => {
  // TODO: handle different fees... right now assumes the same fee is used for all send txs
  it("works", async () => {
    pendingWithoutEthereum();

    const alice = await Actor.create(testConfig.mnemonic, 0, 100);

    expect(alice.sendAddress).toEqual("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");
    expect(alice.receiveAddress).toEqual("0x3DD3246a7a0D3b31D07379b0C422556637Bc0e20");

    const bob = await Actor.create(testConfig.mnemonic, 2, 102);

    expect(bob.sendAddress).toEqual("0x585ec8C463C8f9481f606456402cE7CACb8D2d2A");
    expect(bob.receiveAddress).toEqual("0x25e50d0DF784d81edD11d4D70FbaBD3Ade0C6811");

    // We need to send some tokens to the other ones to allow claim fees
    const claimQuantity = "42000000000000000";
    await alice.sendEther(alice.receiveAddress, {
      quantity: claimQuantity,
      fractionalDigits: 18,
      tokenTicker: ETH,
    });
    await bob.sendEther(bob.receiveAddress, {
      quantity: claimQuantity,
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // Alice has ETH in her sender account but not receiver account
    const aliceInitialSender = await alice.getSenderBalance();
    const aliceInitialReceiver = await alice.getReceiverBalance();
    expect(aliceInitialSender.gtn(100_000_000_000_000_000)).toEqual(true);

    // Bob has ETH in his sender account but not receiver account
    const bobInitialSender = await bob.getSenderBalance();
    const bobInitialReceiver = await bob.getReceiverBalance();
    expect(bobInitialSender.gtn(100_000_000_000_000_000)).toEqual(true);

    // A secret that only Alice knows
    await alice.generatePreimage();

    await alice.sendSwapOffer(bob.receiveAddress, {
      quantity: "2000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // Alice's Ether are locked in the contract (also includes fee)
    expect(aliceInitialSender.sub(await alice.getSenderBalance()).gtn(2000000000000000000)).toEqual(true);

    // review offer
    const bobReceiverSwaps = await bob.getReceiverSwaps();
    const aliceOffer = bobReceiverSwaps[bobReceiverSwaps.length - 1];
    expect(aliceOffer.kind).toEqual(SwapProcessState.Open);
    expect(aliceOffer.data.recipient).toEqual(bob.receiveAddress);
    expect(aliceOffer.data.amounts.length).toEqual(1);
    expect(aliceOffer.data.amounts[0]).toEqual({
      quantity: "2000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    await bob.sendSwapCounter(
      alice.receiveAddress,
      {
        quantity: "5000000000000000000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      },
      aliceOffer,
    );

    // Bob's Ether are locked in the contract (also includes fee)
    expect(bobInitialSender.sub(await bob.getSenderBalance()).gtn(5000000000000000000)).toEqual(true);

    // review counteroffer
    const aliceReceiverSwaps = await alice.getReceiverSwaps();
    const counter = aliceReceiverSwaps[aliceReceiverSwaps.length - 1];
    expect(counter.kind).toEqual(SwapProcessState.Open);
    expect(counter.data.recipient).toEqual(alice.receiveAddress);
    expect(counter.data.amounts.length).toEqual(1);
    expect(counter.data.amounts[0]).toEqual({
      quantity: "5000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    await alice.claimFromKnownPreimage(counter);

    // Alice revealed her secret and should unlock the funds
    expect((await alice.getReceiverBalance()).sub(aliceInitialReceiver).gtn(4900000000000000000)).toEqual(
      true,
    );

    // find claim
    const bobSenderSwaps = await bob.getSenderSwaps();
    const aliceClaimed = bobSenderSwaps[bobSenderSwaps.length - 1];
    expect(aliceClaimed.kind).toEqual(SwapProcessState.Claimed);

    const bobReceiverSwaps2 = await bob.getReceiverSwaps();
    const aliceOffer2 = bobReceiverSwaps2[bobReceiverSwaps2.length - 1];
    expect(aliceOffer2.kind).toEqual(SwapProcessState.Open);

    await bob.claimFromRevealedPreimage(aliceOffer2 as OpenSwap, aliceClaimed as ClaimedSwap);

    // Bob used Alice's preimage to claim unlock his funds
    expect((await bob.getReceiverBalance()).sub(bobInitialReceiver).gtn(4900000000000000000)).toEqual(true);

    // Alice and Bob's funds were not returned to sender
    expect(aliceInitialSender.sub(await alice.getSenderBalance()).gtn(2000000000000000000)).toEqual(true);
    expect(bobInitialSender.sub(await bob.getSenderBalance()).gtn(5000000000000000000)).toEqual(true);
  });
});
