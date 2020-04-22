import {
  Address,
  Amount,
  AtomicSwapConnection,
  AtomicSwapHelpers,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  Preimage,
  SwapId,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import BN from "bn.js";

import { EthereumCodec } from "../ethereumcodec";
import { EthereumConnection } from "../ethereumconnection";
import {
  EscrowAbortTransaction,
  EscrowClaimTransaction,
  EscrowOpenTransaction,
} from "../smartcontracts/escrowcontract";
import { testConfig } from "../testconfig.spec";

const ETH = "ETH" as TokenTicker;
const ethereumCodec = new EthereumCodec({
  customSmartContractConfig: testConfig.connectionOptions.customSmartContractConfig,
});

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

interface ActorData {
  readonly profile: UserProfile;
  readonly connection: EthereumConnection;
  readonly identity: Identity;
}

class Actor {
  public static async create(mnemonic: string, addressIndex: number): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(mnemonic));
    const connection: EthereumConnection = await EthereumConnection.establish(testConfig.baseHttp, {
      ...testConfig.connectionOptions,
    });
    const path = HdPaths.ethereum(addressIndex);
    const identity = await profile.createIdentity(wallet.id, connection.chainId, path);
    return new Actor({
      profile: profile,
      connection: connection,
      identity: identity,
    });
  }

  public readonly identity: Identity;

  public get address(): Address {
    return ethereumCodec.identityToAddress(this.identity);
  }

  private readonly profile: UserProfile;
  private readonly connection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private hash?: Preimage;

  public constructor(data: ActorData) {
    this.profile = data.profile;
    this.connection = data.connection;
    this.identity = data.identity;
  }

  public async sendTransaction(transaction: UnsignedTransaction, identity: Identity): Promise<void> {
    const nonce = await this.connection.getNonce({ pubkey: identity.pubkey });
    const signed = await this.profile.signTransaction(identity, transaction, ethereumCodec, nonce);
    const postable = ethereumCodec.bytesToPost(signed);
    const post = await this.connection.postTx(postable);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
  }

  public async sendAbort(swapId: SwapId): Promise<void> {
    const { chainId } = this.identity;
    const transaction = await this.connection.withDefaultFee<EscrowAbortTransaction>({
      kind: "smartcontract/escrow_abort",
      chainId: chainId,
      sender: this.address,
      swapId: swapId,
    });
    return this.sendTransaction(transaction, this.identity);
  }

  public async sendClaim(swapId: SwapId, recipient: Address): Promise<void> {
    const { chainId } = this.identity;
    const transaction = await this.connection.withDefaultFee<EscrowClaimTransaction>({
      kind: "smartcontract/escrow_claim",
      chainId: chainId,
      sender: this.address,
      recipient: recipient,
      swapId: swapId,
    });
    return this.sendTransaction(transaction, this.identity);
  }

  public async sendEscrowOpen(
    swapId: SwapId,
    arbiter: Address,
    amount: Amount,
    timeout: number,
  ): Promise<void> {
    const { chainId } = this.identity;
    const transaction = await this.connection.withDefaultFee<EscrowOpenTransaction>({
      kind: "smartcontract/escrow_open",
      chainId: chainId,
      arbiter: arbiter,
      sender: this.address,
      hash: AtomicSwapHelpers.hashPreimage(this.hash!),
      swapId: swapId,
      timeout: {
        height: (await this.connection.height()) + timeout,
      },
      amount: amount,
    });
    return this.sendTransaction(transaction, this.identity);
  }

  public async getBalance(): Promise<BN> {
    const { pubkey } = this.identity;
    const account = await this.connection.getAccount({ pubkey: pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === ETH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async generateHash(): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    this.hash = await AtomicSwapHelpers.createPreimage();
  }
}

interface ActorSet {
  readonly alice: Actor;
  readonly bob: Actor;
  readonly arbiter: Actor;
}

xdescribe("Full escrow", () => {
  const TWO_ETH: Amount = {
    quantity: "2000000000000000000",
    fractionalDigits: 18,
    tokenTicker: ETH,
  };

  const initialize = async (): Promise<ActorSet> => {
    const alice = await Actor.create(testConfig.mnemonic, 0);
    expect(alice.address).toEqual("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");

    const bob = await Actor.create(testConfig.mnemonic, 1);
    expect(bob.address).toEqual("0x0A65766695A712Af41B5cfECAaD217B1a11CB22A");

    const arbiter = await Actor.create(testConfig.mnemonic, 2);
    expect(arbiter.address).toEqual("0x585ec8C463C8f9481f606456402cE7CACb8D2d2A");

    await alice.generateHash();
    return { alice: alice, bob: bob, arbiter: arbiter };
  };

  it("can send eth to escrow and abort after the timeout by sender", async () => {
    pendingWithoutEthereum();
    const { alice, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();
    const balance: BN = await alice.getBalance();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 1);
    const balanceAfter: BN = await alice.getBalance();
    expect(balance.sub(balanceAfter).gtn(2_000_000_000_000_000_000)).toEqual(true);
    // Wait for it to expire
    await new Promise((resolve: () => void) => setTimeout(resolve, 5000));
    await alice.sendAbort(swapId);
    expect(balanceAfter.sub(await alice.getBalance()).ltn(0)).toEqual(true);
  }, 30_000);

  it("can send eth to escrow and abort after the timeout by arbiter", async () => {
    pendingWithoutEthereum();
    const { alice, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();
    const balance: BN = await alice.getBalance();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 1);
    const balanceAfter: BN = await alice.getBalance();
    expect(balance.sub(balanceAfter).gtn(2_000_000_000_000_000_000)).toEqual(true);
    // Wait for it to expire
    await new Promise((resolve: () => void) => setTimeout(resolve, 5000));
    await arbiter.sendAbort(swapId);
    expect(balanceAfter.sub(await alice.getBalance()).ltn(0)).toEqual(true);
  }, 30_000);

  it("throws an error if not expired and try to abort by sender", async () => {
    pendingWithoutEthereum();
    const { alice, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();
    const balance: BN = await alice.getBalance();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 50);
    const balanceAfter: BN = await alice.getBalance();
    expect(balance.sub(balanceAfter).gtn(2_000_000_000_000_000_000)).toEqual(true);

    await expectAsync(alice.sendAbort(swapId)).toBeRejected();
    expect(balanceAfter.sub(await alice.getBalance()).ltn(0)).toEqual(false);
  }, 30_000);

  it("throws an error if not expired and try to abort by arbiter", async () => {
    pendingWithoutEthereum();
    const { alice, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();
    const balance: BN = await alice.getBalance();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 50);
    const balanceAfter: BN = await alice.getBalance();
    expect(balance.sub(balanceAfter).gtn(2_000_000_000_000_000_000)).toEqual(true);

    await expectAsync(arbiter.sendAbort(swapId)).toBeRejected();
    expect(balanceAfter.sub(await alice.getBalance()).ltn(0)).toEqual(false);
  }, 30_000);

  it("can claim deposit on escrow given the swap id", async () => {
    pendingWithoutEthereum();
    const { alice, bob, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();
    const aliceBalance: BN = await alice.getBalance();
    const bobBalance: BN = await bob.getBalance();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 50);
    expect(aliceBalance.sub(await alice.getBalance()).gtn(2_000_000_000_000_000_000)).toEqual(true);

    await arbiter.sendClaim(swapId, bob.address);
    expect(bobBalance.sub(await bob.getBalance()).ltn(2_000_000_000_000_000_000)).toEqual(true);
  }, 30_000);

  it("throws an error on claim deposit on escrow given the swap id if expired", async () => {
    pendingWithoutEthereum();
    const { alice, bob, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 1);
    // Wait for it to expire
    await new Promise((resolve: () => void) => setTimeout(resolve, 5000));
    // FIXME: check alice's balance was debited 2ETH
    await expectAsync(arbiter.sendClaim(swapId, bob.address)).toBeRejected();
    // FIXME: check alice's balance was credited 2ETH
  }, 30_000);

  it("throws an error on claim escrow deposit if not the arbiter (sender)", async () => {
    pendingWithoutEthereum();
    const { alice, bob, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 1);
    // Wait for it to expire
    await new Promise((resolve: () => void) => setTimeout(resolve, 5000));
    // FIXME: check alice's balance was debited 2ETH
    await expectAsync(alice.sendClaim(swapId, bob.address)).toBeRejected();
    // FIXME: check alice's balance was credited 2ETH
  }, 30_000);

  it("throws an error on claim escrow deposit if not the arbiter (recipient)", async () => {
    pendingWithoutEthereum();
    const { alice, bob, arbiter } = await initialize();
    const swapId: SwapId = await EthereumConnection.createEtherSwapId();

    await alice.sendEscrowOpen(swapId, arbiter.address, TWO_ETH, 1);
    // Wait for it to expire
    await new Promise((resolve: () => void) => setTimeout(resolve, 5000));
    // FIXME: check alice's balance was debited 2ETH
    await expectAsync(bob.sendClaim(swapId, bob.address)).toBeRejected();
    // FIXME: check alice's balance was credited 2ETH
  }, 30_000);
});
