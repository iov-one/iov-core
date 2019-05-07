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
import { Erc20ApproveTransaction, EthereumConnection, ethereumConnector } from "@iov/ethereum";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "../multichainsigner";

const CASH = "CASH" as TokenTicker;
const ETH = "ETH" as TokenTicker;
const ASH = "ASH" as TokenTicker;

// Copied from 'iov-ethereum/src/testconfig.spec.ts'
const ganacheMnemonic: string =
  "oxygen fall sure lava energy veteran enroll frown question detail include maximum";
const atomicSwapErc20ContractAddress = "0x9768ae2339B48643d710B11dDbDb8A7eDBEa15BC" as Address;
const ethereumBaseUrl: string = "http://localhost:8545";
const ethereumConnectionOptions = {
  wsUrl: "ws://localhost:8545/ws",
  // Low values to speedup test execution on the local ganache chain (using instant mine)
  pollInterval: 0.1,
  scraperApiUrl: undefined,
  atomicSwapEtherContractAddress: "0xE1C9Ea25A621Cf5C934a7E112ECaB640eC7D8d18" as Address,
  atomicSwapErc20ContractAddress: atomicSwapErc20ContractAddress,
  erc20Tokens: new Map([
    [
      "ASH" as TokenTicker,
      {
        contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
        decimals: 12,
        symbol: "ASH",
      },
    ],
  ]),
};

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

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    pending("Set ETHEREUM_ENABLED to enable ethereum-based tests");
  }
}

interface ActorData {
  readonly signer: MultiChainSigner;
  readonly bnsConnection: AtomicSwapConnection;
  readonly ethereumConnection: AtomicSwapConnection;
  readonly bnsIdentity: Identity;
  readonly ethereumIdentity: Identity;
}

class Actor {
  public static async create(
    bnsMnemonic: string,
    bnsHdPath: ReadonlyArray<Slip10RawIndex>,
    ethereumMnemonic: string,
    ethereumHdPath: ReadonlyArray<Slip10RawIndex>,
  ): Promise<Actor> {
    const profile = new UserProfile();
    const ed25519HdWallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsMnemonic));
    const secp256k1HdWallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ethereumMnemonic));
    const signer = new MultiChainSigner(profile);

    const bnsConnection = (await signer.addChain(bnsConnector("ws://localhost:23456"))).connection;
    const ethereumConnection = (await signer.addChain(
      ethereumConnector(ethereumBaseUrl, ethereumConnectionOptions),
    )).connection;

    const bnsIdentity = await profile.createIdentity(ed25519HdWallet.id, bnsConnection.chainId(), bnsHdPath);
    const ethereumIdentity = await profile.createIdentity(
      secp256k1HdWallet.id,
      ethereumConnection.chainId(),
      ethereumHdPath,
    );

    return new Actor({
      signer: signer,
      bnsConnection: bnsConnection as AtomicSwapConnection,
      ethereumConnection: ethereumConnection as AtomicSwapConnection,
      bnsIdentity: bnsIdentity,
      ethereumIdentity: ethereumIdentity,
    });
  }

  public readonly bnsIdentity: Identity;
  public readonly ethereumIdentity: Identity;
  public get bnsAddress(): Address {
    return this.signer.identityToAddress(this.bnsIdentity);
  }
  public get ethereumAddress(): Address {
    return this.signer.identityToAddress(this.ethereumIdentity);
  }

  private readonly signer: MultiChainSigner;
  private readonly bnsConnection: AtomicSwapConnection;
  private readonly ethereumConnection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private preimage: Preimage | undefined;

  constructor(data: ActorData) {
    this.signer = data.signer;
    this.bnsConnection = data.bnsConnection;
    this.ethereumConnection = data.ethereumConnection;
    this.bnsIdentity = data.bnsIdentity;
    this.ethereumIdentity = data.ethereumIdentity;
  }

  // CASH is a token on BNS
  public async getCashBalance(): Promise<BN> {
    const account = await this.bnsConnection.getAccount({ pubkey: this.bnsIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === CASH);
    return new BN(amount ? amount.quantity : 0);
  }

  // ETH is the native token on Ethereum
  public async getEthBalance(): Promise<BN> {
    const account = await this.ethereumConnection.getAccount({ pubkey: this.ethereumIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === ETH);
    return new BN(amount ? amount.quantity : 0);
  }

  // ASH is a token on Ethereum
  public async getAshBalance(): Promise<BN> {
    const account = await this.ethereumConnection.getAccount({ pubkey: this.ethereumIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === ASH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async getBnsSwap(id: SwapId): Promise<AtomicSwap> {
    const swaps = await this.bnsConnection.getSwaps({ id: id });
    return swaps[swaps.length - 1];
  }

  public async getEthereumSwap(id: SwapId): Promise<AtomicSwap> {
    const swaps = await this.ethereumConnection.getSwaps({ id: id });
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

  public async sendEthereumTokens(recipient: Address, amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.ethereumConnection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: this.ethereumIdentity,
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction);
  }

  public async approveErc20Spend(amount: Amount): Promise<Uint8Array | undefined> {
    const transaction = await this.ethereumConnection.withDefaultFee<Erc20ApproveTransaction & WithCreator>({
      kind: "erc20/approve",
      creator: this.ethereumIdentity,
      spender: atomicSwapErc20ContractAddress,
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

  public async sendSwapCounterOnEthereum(
    offer: AtomicSwap,
    id: SwapId,
    recipient: Address,
    amount: Amount,
  ): Promise<Uint8Array | undefined> {
    const transaction = await this.ethereumConnection.withDefaultFee<SwapOfferTransaction & WithCreator>({
      kind: "bcp/swap_offer",
      creator: this.ethereumIdentity,
      swapId: id,
      amounts: [amount],
      recipient: recipient,
      timeout: {
        height: (await this.ethereumConnection.height()) + 10,
      },
      hash: offer.data.hash,
    });
    return this.sendTransaction(transaction);
  }

  public async claimFromKnownPreimageOnEthereum(offer: AtomicSwap): Promise<Uint8Array | undefined> {
    const transaction = await this.ethereumConnection.withDefaultFee<SwapClaimTransaction & WithCreator>({
      kind: "bcp/swap_claim",
      creator: this.ethereumIdentity,
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

describe("Full atomic swap between BNS and Ethereum", () => {
  // TODO: handle different fees... right now with assumes 0.01 of the main token as fee
  it("works for Ether", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const alice = await Actor.create(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.iov(0),
      ganacheMnemonic,
      HdPaths.ethereum(0),
    );
    expect(alice.bnsAddress).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");
    expect(alice.ethereumAddress).toEqual("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");

    const bob = await Actor.create(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
      ganacheMnemonic,
      HdPaths.ethereum(2),
    );
    expect(bob.bnsAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");
    expect(bob.ethereumAddress).toEqual("0x585ec8C463C8f9481f606456402cE7CACb8D2d2A");

    // We need to send a 0.01 tokens to the other ones to allow claim fees
    await alice.sendBnsTokens(bob.bnsAddress, {
      quantity: "10000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });
    await bob.sendEthereumTokens(alice.ethereumAddress, {
      quantity: "10000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // alice owns CASH on BNS but does not need ETH
    const aliceInitialCash = await alice.getCashBalance();
    const aliceInitialEth = await alice.getEthBalance();
    expect(aliceInitialCash.gtn(100_000000000)).toEqual(true);

    // bob owns ETH on Ethereum but does not need CASH
    const bobInitialCash = await bob.getCashBalance();
    const bobInitialEth = await bob.getEthBalance();
    expect(bobInitialEth.gtn(100_000000000)).toEqual(true);

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

    const bobOfferId = await EthereumConnection.createEtherSwapId();
    await bob.sendSwapCounterOnEthereum(aliceOffer, bobOfferId, alice.ethereumAddress, {
      quantity: "5000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // Bob's 5 ETH are locked in the contract (plus the fee deduction)
    expect(bobInitialEth.sub(await bob.getEthBalance()).gt(new BN("5000000000000000000"))).toEqual(true);
    expect(bobInitialEth.sub(await bob.getEthBalance()).lt(new BN("5100000000000000000"))).toEqual(true);

    // check correct counteroffer was made on BCP
    const bobOffer = await alice.getEthereumSwap(bobOfferId);
    expect(bobOffer.kind).toEqual(SwapProcessState.Open);
    expect(bobOffer.data.recipient).toEqual(alice.ethereumAddress);
    expect(bobOffer.data.amounts.length).toEqual(1);
    expect(bobOffer.data.amounts[0]).toEqual({
      quantity: "5000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });
    await alice.claimFromKnownPreimageOnEthereum(bobOffer);

    // Alice revealed her secret and should own 5 ETH now
    expect((await alice.getEthBalance()).sub(aliceInitialEth).lt(new BN("5000000000000000000"))).toEqual(
      true,
    );
    expect((await alice.getEthBalance()).sub(aliceInitialEth).gt(new BN("4900000000000000000"))).toEqual(
      true,
    );

    // check claim was made on BNS
    const aliceClaim = await bob.getEthereumSwap(bobOfferId);
    expect(aliceClaim.kind).toEqual(SwapProcessState.Claimed);

    await bob.claimFromRevealedPreimageOnBns(aliceClaim, aliceOfferId);

    // check claim was made on BNS
    const bobClaim = await alice.getBnsSwap(aliceOfferId);
    expect(bobClaim.kind).toEqual(SwapProcessState.Claimed);

    // Bob used Alice's preimage to claim his 2 CASH
    expect((await bob.getCashBalance()).sub(bobInitialCash).toString()).toEqual("1990000000");

    // Alice's CASH balance now down by 2 (plus fees)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2010000000");

    // Bob's ETH balance now down by 5 (plus fees)
    expect(bobInitialEth.sub(await bob.getEthBalance()).gt(new BN("5000000000000000000"))).toEqual(true);
    expect(bobInitialEth.sub(await bob.getEthBalance()).lt(new BN("5100000000000000000"))).toEqual(true);
  }, 30_000);

  it("works for ERC20", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const alice = await Actor.create(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
      HdPaths.iov(0),
      ganacheMnemonic,
      HdPaths.ethereum(0),
    );
    expect(alice.bnsAddress).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");
    expect(alice.ethereumAddress).toEqual("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");

    const bob = await Actor.create(
      "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion",
      HdPaths.iov(0),
      ganacheMnemonic,
      HdPaths.ethereum(2),
    );
    expect(bob.bnsAddress).toEqual("tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp");
    expect(bob.ethereumAddress).toEqual("0x585ec8C463C8f9481f606456402cE7CACb8D2d2A");

    // We need to send a 0.01 tokens to the other ones to allow claim fees
    await alice.sendBnsTokens(bob.bnsAddress, {
      quantity: "10000000",
      fractionalDigits: 9,
      tokenTicker: CASH,
    });
    await bob.sendEthereumTokens(alice.ethereumAddress, {
      quantity: "10000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // alice owns CASH on BNS but does not need ASH
    const aliceInitialCash = await alice.getCashBalance();
    const aliceInitialAsh = await alice.getAshBalance();
    expect(aliceInitialCash.gt(new BN(100_000000000))).toEqual(true);

    // bob owns ASH on Ethereum but does not need CASH
    const bobInitialCash = await bob.getCashBalance();
    const bobInitialAsh = await bob.getAshBalance();
    expect(bobInitialAsh.gt(new BN(10_000_000))).toEqual(true);

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

    const bobOfferId = await EthereumConnection.createErc20SwapId();
    const bobOfferAmount = {
      quantity: "5000000",
      fractionalDigits: 12,
      tokenTicker: ASH,
    };
    await bob.approveErc20Spend(bobOfferAmount);
    await bob.sendSwapCounterOnEthereum(aliceOffer, bobOfferId, alice.ethereumAddress, bobOfferAmount);

    // Bob's 0.000005 ASH are locked in the contract
    expect(bobInitialAsh.sub(await bob.getAshBalance()).eq(new BN("5000000"))).toEqual(true);

    // check correct counteroffer was made on BCP
    const bobOffer = await alice.getEthereumSwap(bobOfferId);
    expect(bobOffer.kind).toEqual(SwapProcessState.Open);
    expect(bobOffer.data.recipient).toEqual(alice.ethereumAddress);
    expect(bobOffer.data.amounts.length).toEqual(1);
    expect(bobOffer.data.amounts[0]).toEqual(bobOfferAmount);
    await alice.claimFromKnownPreimageOnEthereum(bobOffer);

    // Alice revealed her secret and should own 0.000005 ASH now
    expect((await alice.getAshBalance()).sub(aliceInitialAsh).eq(new BN("5000000"))).toEqual(true);

    // check claim was made on BCP
    const aliceClaim = await bob.getEthereumSwap(bobOfferId);
    expect(aliceClaim.kind).toEqual(SwapProcessState.Claimed);

    await bob.claimFromRevealedPreimageOnBns(aliceClaim, aliceOfferId);

    // check claim was made on BNS
    const bobClaim = await alice.getBnsSwap(aliceOfferId);
    expect(bobClaim.kind).toEqual(SwapProcessState.Claimed);

    // Bob used Alice's preimage to claim his 2 CASH
    expect((await bob.getCashBalance()).sub(bobInitialCash).toString()).toEqual("1990000000");

    // Alice's CASH balance now down by 2 (plus fees)
    expect(aliceInitialCash.sub(await alice.getCashBalance()).toString()).toEqual("2010000000");

    // Bob's ASH balance now down by 0.000005
    expect(bobInitialAsh.sub(await bob.getAshBalance()).eq(new BN("5000000"))).toEqual(true);
  }, 30_000);
});
