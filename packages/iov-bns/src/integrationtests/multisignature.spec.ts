import {
  Address,
  Amount,
  ChainId,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  SendTransaction,
  SignedTransaction,
  TokenTicker,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Slip10RawIndex } from "@iov/crypto";
import { Uint64 } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import BN from "bn.js";

import { bnsCodec } from "../bnscodec";
import { BnsConnection } from "../bnsconnection";
import { multisignatureIdToAddress } from "../conditions";
import { CreateMultisignatureTx, MultisignatureTx, Participant } from "../types";

const CASH = "CASH" as TokenTicker;
const bnsUrl = "ws://localhost:23456";
const chainId = "local-iov-devnet" as ChainId;
// Address: tiov1xwvnaxahzcszkvmk362m7vndjkzumv8ufmzy3m
const aliceMnemonic = "host century wave huge seed boost success right brave general orphan lion";
// Address: tiov1qrw95py2x7fzjw25euuqlj6dq6t0jahe7rh8wp
const bobMnemonic = "dad kiss slogan offer outer bomb usual dream awkward jeans enlist mansion";
const defaultFeeAmount = 10000000;

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
  readonly profile: UserProfile;
  readonly connection: BnsConnection;
  readonly identity: Identity;
}

class Actor {
  public static async create(mnemonic: string, hdPath: readonly Slip10RawIndex[]): Promise<Actor> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));

    const connection = await BnsConnection.establish(bnsUrl);

    const identity = await profile.createIdentity(wallet.id, connection.chainId(), hdPath);

    return new Actor({
      profile: profile,
      connection: connection,
      identity: identity,
    });
  }

  public get address(): Address {
    return bnsCodec.identityToAddress(this.identity);
  }

  private readonly connection: BnsConnection;
  private readonly profile: UserProfile;
  private readonly identity: Identity;

  public constructor(data: ActorData) {
    this.profile = data.profile;
    this.connection = data.connection;
    this.identity = data.identity;
  }

  public async getBalance(address: Address): Promise<BN> {
    const account = await this.connection.getAccount({ address: address });
    const balance = account ? account.balance : [];
    const amount = balance.find(row => row.tokenTicker === CASH);
    return new BN(amount ? amount.quantity : 0);
  }

  public async signTransaction(transaction: UnsignedTransaction): Promise<SignedTransaction> {
    const nonce = await this.connection.getNonce({ pubkey: this.identity.pubkey });
    return this.profile.signTransaction(transaction, bnsCodec, nonce);
  }

  public async appendSignature(signedTransaction: SignedTransaction): Promise<SignedTransaction> {
    const nonce = await this.connection.getNonce({ pubkey: this.identity.pubkey });
    return this.profile.appendSignature(this.identity, signedTransaction, bnsCodec, nonce);
  }

  public async postTransaction(signedTransaction: SignedTransaction): Promise<Uint8Array | undefined> {
    const txBytes = bnsCodec.bytesToPost(signedTransaction);
    const post = await this.connection.postTx(txBytes);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed");
    }
    await tendermintSearchIndexUpdated();
    return blockInfo.result;
  }

  public async signAndPost(transaction: UnsignedTransaction): Promise<Uint8Array | undefined> {
    const signed = await this.signTransaction(transaction);
    return this.postTransaction(signed);
  }

  public async sendCash(recipient: Address, quantity: string): Promise<Uint8Array | undefined> {
    const tx = await this.connection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: this.identity,
      sender: this.address,
      recipient: recipient,
      amount: {
        quantity: quantity,
        fractionalDigits: 9,
        tokenTicker: CASH,
      },
    });

    return this.signAndPost(tx);
  }

  public async createMultisignatureContract(
    participants: readonly Participant[],
    activationThreshold: number,
    adminThreshold: number,
  ): Promise<number> {
    const tx = await this.connection.withDefaultFee<CreateMultisignatureTx & WithCreator>({
      kind: "bns/create_multisignature_contract",
      creator: this.identity,
      participants: participants,
      activationThreshold: activationThreshold,
      adminThreshold: adminThreshold,
    });
    const result = await this.signAndPost(tx);
    if (result === undefined) {
      throw new Error("Created a multisignature contract but received no ID back");
    }
    return Uint64.fromBytesBigEndian(result).toNumber();
  }

  public async createSendTransaction(
    multisignatureId: number,
    sender: Address,
    recipient: Address,
    amount: Amount,
  ): Promise<SendTransaction & WithCreator> {
    return this.connection.withDefaultFee<SendTransaction & WithCreator & MultisignatureTx>({
      kind: "bcp/send",
      multisig: [multisignatureId],
      creator: this.identity,
      sender: sender,
      recipient: recipient,
      amount: amount,
    });
  }
}

describe("Multisignature wallets", () => {
  it("does not send funds with insufficient signatures", async () => {
    pendingWithoutBnsd();

    const alice = await Actor.create(aliceMnemonic, HdPaths.iov(0));
    const bob = await Actor.create(bobMnemonic, HdPaths.iov(0));

    // Create multisignature contract
    const participants: readonly Participant[] = [
      {
        address: alice.address,
        weight: 1,
      },
      {
        address: bob.address,
        weight: 1,
      },
    ];
    const activationThreshold = 2;
    const adminThreshold = 2;
    const multisignatureId = await alice.createMultisignatureContract(
      participants,
      activationThreshold,
      adminThreshold,
    );

    const multisignatureAddress = multisignatureIdToAddress(chainId, multisignatureId);

    // Fund multisignature account
    await alice.sendCash(multisignatureAddress, "1234567890");
    const multisignatureBalanceBefore = await alice.getBalance(multisignatureAddress);

    // Create send tx
    const amount = {
      quantity: "123",
      fractionalDigits: 9,
      tokenTicker: CASH,
    };
    const sendTx = await alice.createSendTransaction(
      multisignatureId,
      multisignatureAddress,
      alice.address,
      amount,
    );
    try {
      await alice.signAndPost(sendTx);
      fail("Expected transaction to fail with insufficient signatures");
    } catch (err) {
      expect(err).toMatch(/weight is not enough to activate/i);
    }

    // Balance should be unchanged
    const multisignatureBalanceAfter = await alice.getBalance(multisignatureAddress);
    expect(multisignatureBalanceAfter).toEqual(multisignatureBalanceBefore);
  });

  it("sends funds with sufficient signatures", async () => {
    pendingWithoutBnsd();

    const alice = await Actor.create(aliceMnemonic, HdPaths.iov(0));
    const bob = await Actor.create(bobMnemonic, HdPaths.iov(0));

    // Create multisignature contract
    const participants: readonly Participant[] = [
      {
        address: alice.address,
        weight: 1,
      },
      {
        address: bob.address,
        weight: 1,
      },
    ];
    const activationThreshold = 2;
    const adminThreshold = 2;
    const multisignatureId = await alice.createMultisignatureContract(
      participants,
      activationThreshold,
      adminThreshold,
    );

    const multisignatureAddress = multisignatureIdToAddress(chainId, multisignatureId);

    // Fund multisignature account
    await alice.sendCash(multisignatureAddress, "1234567890");
    const multisignatureBalanceBefore = await alice.getBalance(multisignatureAddress);

    // Create send tx
    const amount = {
      quantity: "123",
      fractionalDigits: 9,
      tokenTicker: CASH,
    };
    const sendTx = await alice.createSendTransaction(
      multisignatureId,
      multisignatureAddress,
      alice.address,
      amount,
    );
    const signedByAlice = await alice.signTransaction(sendTx);
    const signedByBob = await bob.appendSignature(signedByAlice);

    await alice.postTransaction(signedByBob);

    // Balance should be updated
    const multisignatureBalanceAfter = await alice.getBalance(multisignatureAddress);
    expect(multisignatureBalanceAfter.lt(multisignatureBalanceBefore)).toEqual(true);
    expect(
      multisignatureBalanceBefore.sub(multisignatureBalanceAfter).eq(new BN(123 + defaultFeeAmount)),
    ).toEqual(true);
  });
});
