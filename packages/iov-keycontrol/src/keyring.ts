import { ChainId, Identity, identityEquals } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { As } from "type-tagger";

import {
  ReadonlyWallet,
  Wallet,
  WalletId,
  WalletImplementationIdString,
  WalletSerializationString,
} from "./wallet";
import { Ed25519HdWallet, Ed25519Wallet, Secp256k1HdWallet } from "./wallets";

export type KeyringSerializationString = string & As<"keyring-serialization">;

/**
 * Read-only information about one wallet in a keyring
 */
export interface WalletInfo {
  readonly id: WalletId;
  readonly label: string | undefined;
}

interface WalletSerialization {
  readonly implementationId: WalletImplementationIdString;
  readonly data: WalletSerializationString;
}

interface KeyringSerialization {
  readonly formatVersion: number;
  readonly wallets: WalletSerialization[];
}

export type WalletDeserializer = (data: WalletSerializationString) => Wallet;

function deserialize(data: KeyringSerializationString): KeyringSerialization {
  const doc = JSON.parse(data);
  const formatVersion = doc.formatVersion;

  if (typeof formatVersion !== "number") {
    throw new Error("Expected property 'formatVersion' of type number");
  }

  // Case distinctions / migrations based on formatVersion go here
  switch (formatVersion) {
    case 1:
      break;
    default:
      throw new Error(`Got unsupported format version: '${formatVersion}'`);
  }

  return doc;
}

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
  ] as readonly [string, WalletDeserializer][]);

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

  public constructor(data?: KeyringSerializationString) {
    this.wallets = [];

    if (data) {
      const parsedData = deserialize(data);
      for (const wallet of parsedData.wallets.map(Keyring.deserializeWallet)) {
        // use Keyring to utilize its identity collision checks
        this.add(wallet);
      }
    }
  }

  /**
   * Stores a copy of the given wallet in the Keyring.
   *
   * Outside changes of the wallet do not affect the Keyring. Use keyring's
   * setWalletLabel, createIdentity, setIdentityLabel to mutate wallets in the keyring.
   */
  public add(wallet: ReadonlyWallet): WalletInfo {
    this.ensureNoIdentityCollision(wallet.getIdentities());

    const copy = wallet.clone();
    this.wallets.push(copy);

    return {
      id: wallet.id,
      label: wallet.label.value,
    };
  }

  /**
   * Returns an array with immutable references.
   */
  public getWallets(): readonly ReadonlyWallet[] {
    return this.wallets;
  }

  /**
   * Finds a wallet and returns an immutable reference.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  public getWallet(id: WalletId): ReadonlyWallet | undefined {
    return this.wallets.find((wallet) => wallet.id === id);
  }

  /**
   * Finds a wallet for a given identity and returns an immutable reference.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  public getWalletByIdentity(identity: Identity): ReadonlyWallet | undefined {
    return this.wallets.find((wallet) => wallet.getIdentities().some(identityEquals.bind(null, identity)));
  }

  /** Sets the label of the wallet with the given ID in the primary keyring  */
  public setWalletLabel(walletId: WalletId, label: string | undefined): void {
    const wallet = this.getMutableWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet of id '${walletId}' does not exist in keyring`);
    }
    wallet.setLabel(label);
  }

  /**
   * Creates an identity in the wallet with the given ID in the primary keyring
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  public async createIdentity(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<Identity> {
    const wallet = this.getMutableWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet of id '${walletId}' does not exist in keyring`);
    }

    const previewIdentity = await wallet.previewIdentity(chainId, options);
    this.ensureNoIdentityCollision([previewIdentity]);

    return wallet.createIdentity(chainId, options);
  }

  /**
   * All identities of all wallets
   */
  public getAllIdentities(): readonly Identity[] {
    // Use Array.flat when available (https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
    const out = new Array<Identity>();
    for (const wallet of this.wallets) {
      out.push(...wallet.getIdentities());
    }
    return out;
  }

  /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
  public setIdentityLabel(identity: Identity, label: string | undefined): void {
    const wallet = this.getMutableWalletByIdentity(identity);
    if (!wallet) {
      throw new Error(`No wallet for identity '${JSON.stringify(identity)}' found in keyring`);
    }
    wallet.setIdentityLabel(identity, label);
  }

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  public serialize(): KeyringSerializationString {
    const out: KeyringSerialization = {
      formatVersion: 1,
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

  /**
   * Finds a wallet and returns a mutable reference. Thus e.g.
   * .getMutableWallet(xyz).createIdentity(...) will change the keyring.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  private getMutableWallet(id: WalletId): Wallet | undefined {
    return this.wallets.find((wallet) => wallet.id === id);
  }

  /**
   * Finds a wallet for a given identity and returns a mutable reference. Thus e.g.
   * .getWalletByIdentity(xyz).createIdentity(...) will change the keyring.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  private getMutableWalletByIdentity(identity: Identity): Wallet | undefined {
    return this.wallets.find((wallet) => wallet.getIdentities().some(identityEquals.bind(null, identity)));
  }

  /**
   * Throws if any of the new identities already exists in this keyring.
   */
  private ensureNoIdentityCollision(newIdentities: readonly Identity[]): void {
    const existingIdentities = this.getAllIdentities();

    for (const newIdentity of newIdentities) {
      for (const existingIdentity of existingIdentities) {
        if (identityEquals(newIdentity, existingIdentity)) {
          throw new Error(
            `Identity collision: ${JSON.stringify(newIdentity)} already exists in this Keyring`,
          );
        }
      }
    }
  }
}
