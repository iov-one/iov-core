import { As } from "type-tagger";

import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { ChainId, PublicKeyBundle, SignatureBytes } from "@iov/tendermint-types";

import { Ed25519HdWallet, Ed25519KeyringEntry, Secp256k1HdWallet } from "./keyring-entries";

export type KeyringSerializationString = string & As<"keyring-serialization">;
export type WalletImplementationIdString = string & As<"wallet-implementation-id">;
export type WalletSerializationString = string & As<"wallet-serialization">;

export type LocalIdentityId = string & As<"local-identity-id">;
export type WalletId = string & As<"wallet-id">;

// PublicIdentity is a public key we can identify with on a blockchain
export interface PublicIdentity {
  readonly pubkey: PublicKeyBundle;
}

// LocalIdentity is a local version of a PublicIdentity that contains
// additional local information
export interface LocalIdentity extends PublicIdentity {
  // immutible id string based on pubkey
  readonly id: LocalIdentityId;

  // An optional, local label.
  // This is not exposed to other people or other devices. Use BNS registration for that.
  readonly label?: string;
}

export interface KeyringEntrySerialization {
  readonly implementationId: WalletImplementationIdString;
  readonly data: WalletSerializationString;
}

export interface KeyringSerialization {
  readonly entries: KeyringEntrySerialization[];
}

export type KeyringEntryDeserializer = (data: WalletSerializationString) => Wallet;

/*
A Keyring a collection of KeyringEntrys
*/
export class Keyring {
  public static registerEntryType(
    implementationId: WalletImplementationIdString,
    deserializer: KeyringEntryDeserializer,
  ): void {
    if (Keyring.deserializationRegistry.has(implementationId)) {
      throw new Error(`Entry type "${implementationId}" already registered.`);
    }
    Keyring.deserializationRegistry.set(implementationId, deserializer);
  }

  private static readonly deserializationRegistry = new Map([
    ["ed25519", (data: WalletSerializationString) => new Ed25519KeyringEntry(data)],
    ["ed25519-hd", (data: WalletSerializationString) => new Ed25519HdWallet(data)],
    ["secp256k1-hd", (data: WalletSerializationString) => new Secp256k1HdWallet(data)],
  ] as ReadonlyArray<[string, KeyringEntryDeserializer]>);

  private static deserializeKeyringEntry(serializedEntry: KeyringEntrySerialization): Wallet {
    const implId = serializedEntry.implementationId;

    const deserializer = Keyring.deserializationRegistry.get(implId);
    if (!deserializer) {
      throw new Error(`No deserializer registered for keyring entry of type "${implId}".`);
    }

    try {
      return deserializer(serializedEntry.data);
    } catch (e) {
      throw new Error(`Error creating keyring entry of type ${implId}: ${e.message}`);
    }
  }

  private readonly entries: Wallet[];

  constructor(data?: KeyringSerializationString) {
    if (data) {
      const parsedData = JSON.parse(data) as KeyringSerialization;
      this.entries = parsedData.entries.map(Keyring.deserializeKeyringEntry);
    } else {
      this.entries = [];
    }
  }

  public add(entry: Wallet): void {
    this.entries.push(entry);
  }

  // Note: this returns an array with mutable element references. Thus e.g.
  // .getEntries().createIdentity() will change the keyring.
  public getEntries(): ReadonlyArray<Wallet> {
    return this.entries;
  }

  // if you stored the immutible keyring entry reference, you can get the object back here
  public getEntryById(id: string): Wallet | undefined {
    return this.entries.find(e => e.id === id);
  }

  // if you stored the immutible keyring entry reference, you can get the object back here
  public getEntryByIndex(n: number): Wallet | undefined {
    return this.entries.find((_, index) => index === n);
  }

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  public serialize(): KeyringSerializationString {
    const out: KeyringSerialization = {
      entries: this.entries.map(
        (entry): KeyringEntrySerialization => ({
          implementationId: entry.implementationId,
          data: entry.serialize(),
        }),
      ),
    };
    return JSON.stringify(out) as KeyringSerializationString;
  }

  public clone(): Keyring {
    return new Keyring(this.serialize());
  }
}

/**
 * A is a generic interface for managing a set of keys and signing
 * data with them.
 *
 * A Wallet is responsible for storing private keys securely and
 * signing with them. Wallet can be implemented in software or as
 * a bridge to a hardware wallet.
 */
export interface Wallet {
  readonly label: ValueAndUpdates<string | undefined>;

  // id is a unique identifier based on the content of the keyring
  // the same implementation with same seed/secret should have same identifier
  // otherwise, they will be different
  readonly id: WalletId;

  // Sets a label associated with the keyring entry to be displayed in the UI.
  // To clear the label, set it to undefined.
  readonly setLabel: (label: string | undefined) => void;

  // createIdentity will create one new identity
  readonly createIdentity: (
    options: Ed25519KeyringEntry | ReadonlyArray<Slip10RawIndex> | number,
  ) => Promise<LocalIdentity>;

  // Sets a local label associated with the public identity to be displayed in the UI.
  // To clear a label, set it to undefined
  readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;

  // getIdentities returns all identities currently registered
  readonly getIdentities: () => ReadonlyArray<LocalIdentity>;

  // canSign flag means the private key material is currently accessible.
  // If a hardware ledger is not plugged in, we may see the public keys,
  // but have it "inactive" as long as this flag is false.
  readonly canSign: ValueAndUpdates<boolean>;

  // A string identifying the concrete implementation of this interface
  // for deserialization purpose
  readonly implementationId: WalletImplementationIdString;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    transactionBytes: SignableBytes,
    prehash: PrehashType,
    chainId: ChainId,
  ) => Promise<SignatureBytes>;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  readonly serialize: () => WalletSerializationString;

  readonly clone: () => Wallet;
}
