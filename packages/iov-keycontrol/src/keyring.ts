import { As } from "type-tagger";

import { Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "./wallet";
import { Ed25519HdWallet, Ed25519Wallet, Secp256k1HdWallet } from "./wallets";

export type KeyringSerializationString = string & As<"keyring-serialization">;

interface WalletSerialization {
  readonly implementationId: WalletImplementationIdString;
  readonly data: WalletSerializationString;
}

interface KeyringSerialization {
  readonly wallets: WalletSerialization[];
}

export type WalletDeserializer = (data: WalletSerializationString) => Wallet;

/**
 * A collection of wallets
 */
export class Keyring {
  public static registerWalletType(
    implementationId: WalletImplementationIdString,
    deserializer: WalletDeserializer,
  ): void {
    if (Keyring.deserializationRegistry.has(implementationId)) {
      throw new Error(`Wallet type "${implementationId}" already registered.`);
    }
    Keyring.deserializationRegistry.set(implementationId, deserializer);
  }

  private static readonly deserializationRegistry = new Map([
    ["ed25519", (data: WalletSerializationString) => new Ed25519Wallet(data)],
    ["ed25519-hd", (data: WalletSerializationString) => new Ed25519HdWallet(data)],
    ["secp256k1-hd", (data: WalletSerializationString) => new Secp256k1HdWallet(data)],
  ] as ReadonlyArray<[string, WalletDeserializer]>);

  private static deserializeWallet(serializedWallet: WalletSerialization): Wallet {
    const implId = serializedWallet.implementationId;

    const deserializer = Keyring.deserializationRegistry.get(implId);
    if (!deserializer) {
      throw new Error(`No deserializer registered for wallet of type "${implId}".`);
    }

    try {
      return deserializer(serializedWallet.data);
    } catch (e) {
      throw new Error(`Error creating wallet of type ${implId}: ${e.message}`);
    }
  }

  private readonly wallets: Wallet[];

  constructor(data?: KeyringSerializationString) {
    if (data) {
      const parsedData = JSON.parse(data) as KeyringSerialization;
      this.wallets = parsedData.wallets.map(Keyring.deserializeWallet);
    } else {
      this.wallets = [];
    }
  }

  public add(wallet: Wallet): void {
    this.wallets.push(wallet);
  }

  /**
   * this returns an array with mutable element references. Thus e.g.
   * .getWallets().createIdentity() will change the keyring.
   */
  public getWallets(): ReadonlyArray<Wallet> {
    return this.wallets;
  }

  /**
   * Finds a wallet and returns a mutable references. Thus e.g.
   * .getWallet(xyz).createIdentity() will change the keyring.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  public getWallet(id: WalletId): Wallet | undefined {
    return this.wallets.find(wallet => wallet.id === id);
  }

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  public serialize(): KeyringSerializationString {
    const out: KeyringSerialization = {
      wallets: this.wallets.map(
        (wallet): WalletSerialization => ({
          implementationId: wallet.implementationId,
          data: wallet.serialize(),
        }),
      ),
    };
    return JSON.stringify(out) as KeyringSerializationString;
  }

  public clone(): Keyring {
    return new Keyring(this.serialize());
  }
}
