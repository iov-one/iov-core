import {
  Address,
  Amount,
  AtomicSwapConnection,
  AtomicSwapHelpers,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  Preimage,
  SendTransaction,
  TokenTicker,
  UnsignedTransaction, SwapId,
} from "@iov/bcp";
import { HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import BN from "bn.js";

import { EthereumCodec } from "../ethereumcodec";
import { EthereumConnection } from "../ethereumconnection";
import { EscrowOpenTransaction } from "../smartcontracts/escrowcontract";
import { testConfig } from "../testconfig.spec";

const ETH = "ETH" as TokenTicker;
const ASH = "ASH" as TokenTicker;
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
  readonly senderIdentity: Identity;
  readonly receiverIdentity: Identity;
}

class Actor {
  public static async create(mnemonic: string, addressIndex1: number, addressIndex2: number): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(mnemonic));
    const connection: EthereumConnection = await EthereumConnection.establish(testConfig.baseHttp, {
      ...testConfig.connectionOptions,
    });
    const path1 = HdPaths.ethereum(addressIndex1);
    const path2 = HdPaths.ethereum(addressIndex2);
    const senderIdentity = await profile.createIdentity(wallet.id, connection.chainId, path1);
    const receiverIdentity = await profile.createIdentity(wallet.id, connection.chainId, path2);
    return new Actor({
      profile: profile,
      connection: connection,
      senderIdentity: senderIdentity,
      receiverIdentity: receiverIdentity,
    });
  }

  public readonly senderIdentity: Identity;
  public readonly receiverIdentity: Identity;

  public get sendAddress(): Address {
    return ethereumCodec.identityToAddress(this.senderIdentity);
  }

  public get receiveAddress(): Address {
    return ethereumCodec.identityToAddress(this.receiverIdentity);
  }

  private readonly profile: UserProfile;
  private readonly connection: AtomicSwapConnection;
  // tslint:disable-next-line:readonly-keyword
  private hash?: Preimage;

  public constructor(data: ActorData) {
    this.profile = data.profile;
    this.connection = data.connection;
    this.senderIdentity = data.senderIdentity;
    this.receiverIdentity = data.receiverIdentity;
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

  public async sendEther(recipient: Address, amount: Amount): Promise<void> {
    const transaction = await this.connection.withDefaultFee<SendTransaction>({
      kind: "bcp/send",
      chainId: this.senderIdentity.chainId,
      sender: ethereumCodec.identityToAddress(this.senderIdentity),
      recipient: recipient,
      amount: amount,
    });
    return this.sendTransaction(transaction, this.senderIdentity);
  }

  /*public async sendAbort(swapId: SwapId): Promise<void> {

  }*/

  public async sendEscrowOpen(arbiter: Address, amount: Amount): Promise<void> {
    const transaction = await this.connection.withDefaultFee<EscrowOpenTransaction>({
      kind: "smartcontract/escrow_open",
      chainId: this.senderIdentity.chainId,
      arbiter: arbiter,
      sender: this.sendAddress,
      hash: AtomicSwapHelpers.hashPreimage(this.hash!),
      swapId: await EthereumConnection.createEtherSwapId(),
      timeout: {
        height: (await this.connection.height()) + 50,
      },
      amount: amount,
    });
    return this.sendTransaction(transaction, this.senderIdentity);
  }

  public async getSenderEtherBalance(): Promise<BN> {
    const account = await this.connection.getAccount({ pubkey: this.senderIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === ETH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async getReceiverEtherBalance(): Promise<BN> {
    const account = await this.connection.getAccount({ pubkey: this.receiverIdentity.pubkey });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === ETH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async generateHash(): Promise<void> {
    // tslint:disable-next-line:no-object-mutation
    this.hash = await AtomicSwapHelpers.createPreimage();
  }
}

fdescribe("Full escrow escrow", () => {
  // TODO: handle different fees... right now assumes the same fee is used for all send txs
  it("works for Ether", async () => {
    pendingWithoutEthereum();

    const alice = await Actor.create(testConfig.mnemonic, 1, 2);

    expect(alice.sendAddress).toEqual("0x0A65766695A712Af41B5cfECAaD217B1a11CB22A");
    expect(alice.receiveAddress).toEqual("0x585ec8C463C8f9481f606456402cE7CACb8D2d2A"); // 0x3DD3246a7a0D3b31D07379b0C422556637Bc0e20");

    const bob = await Actor.create(testConfig.mnemonic, 3, 4);

    expect(bob.sendAddress).toEqual("0xD095a4C96497Dd6Ab954Bc7e37658276C87bf61A");
    expect(bob.receiveAddress).toEqual("0xfA2DFaE9ADAFA28F3b565BC3dd19f9a47D47aC88"); // 0x25e50d0DF784d81edD11d4D70FbaBD3Ade0C6811");

    const arbiter = await Actor.create(testConfig.mnemonic, 5, 6);
    expect(arbiter.sendAddress).toEqual("0x3ae7300d7A3d87821eD5cb7e610a7DD128dDc711");
    expect(arbiter.receiveAddress).toEqual("0xdFdF9FDd9FeB1c4892c417Af6fb63458dfA157FD");

    // We need to send some tokens to the other ones to allow claim fees
    /* const claimQuantity = "42000000000000000";
    await alice.sendEther(alice.receiveAddress, {
      quantity: claimQuantity,
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    await bob.sendEther(bob.receiveAddress, {
      quantity: claimQuantity,
      fractionalDigits: 18,
      tokenTicker: ETH,
    });*/

    // Alice has ETH in her sender account but not receiver account
    const aliceInitialSender = await alice.getSenderEtherBalance();
    const aliceInitialReceiver = await alice.getReceiverEtherBalance();
    expect(aliceInitialSender.gtn(100_000_000_000_000_000_000)).toEqual(true);

    // Bob has ETH in his sender account but not receiver account
    const bobInitialSender = await bob.getSenderEtherBalance();
    const bobInitialReceiver = await bob.getReceiverEtherBalance();
    expect(bobInitialSender.gtn(100_000_000_000_000_000_000)).toEqual(true);

    await alice.generateHash();

    await alice.sendEscrowOpen(arbiter.receiveAddress, {
      quantity: "2000000000000000000",
      fractionalDigits: 18,
      tokenTicker: ETH,
    });

    // Alice's Ether are locked in the contract (also includes fee)
    /*expect(
      aliceInitialSender.sub(await alice.getSenderEtherBalance()).gtn(2_000_000_000_000_000_000),
    ).toEqual(true);*/
  }, 30_000);
});
