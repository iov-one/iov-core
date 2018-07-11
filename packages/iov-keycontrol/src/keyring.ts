import { ChainId, Prehash, PublicKeyBundle, SignableBytes, SignatureBytes } from "@iov/types";

import { Ed25519KeyringEntry, Ed25519SimpleAddressKeyringEntry } from "./keyring-entries";
import { ValueAndUpdates } from "./valueandupdates";

// type tagging from https://github.com/Microsoft/TypeScript/issues/4895#issuecomment-399098397
declare class As<Tag extends string> {
  private readonly "_ _ _": Tag;
}

export type KeyringEntrySerializationString = string & As<"keyring-entry-serialization">;
export type KeyringSerializationString = string & As<"keyring-serialization">;
export type KeyringEntryImplementationIdString = string & As<"keyring-entry-implementation-id">;

// PublicIdentity is a public key we can identify with on a blockchain
export interface PublicIdentity {
  readonly pubkey: PublicKeyBundle;
}

// LocalIdentity is a local version of a PublicIdentity that contains
// additional local information
export interface LocalIdentity extends PublicIdentity {
  // An optional, local label.
  // This is not exposed to other people or other devices. Use BNS registration for that.
  readonly label?: string;
}

export interface KeyringEntrySerialization {
  readonly implementationId: KeyringEntryImplementationIdString;
  readonly data: KeyringEntrySerializationString;
}

export interface KeyringSerialization {
  readonly entries: KeyringEntrySerialization[];
}

/*
A Keyring a collection of KeyringEntrys
*/
export class Keyring {
  private static deserializeKeyringEntry(serializedEntry: KeyringEntrySerialization): KeyringEntry {
    switch (serializedEntry.implementationId) {
      case "ed25519":
        try {
          return new Ed25519KeyringEntry(serializedEntry.data);
        } catch (e) {
          throw new Error("Error creating Ed25519KeyringEntry: " + e.message);
        }
      case "ed25519simpleaddress":
        try {
          return new Ed25519SimpleAddressKeyringEntry(serializedEntry.data);
        } catch (e) {
          throw new Error("Error creating Ed25519SimpleAddressKeyringEntry: " + e.message);
        }
      default:
        throw new Error("Unknown implementationId found");
    }
  }

  private readonly entries: KeyringEntry[];

  constructor(data?: KeyringSerializationString) {
    if (data) {
      const parsedData = JSON.parse(data) as KeyringSerialization;
      this.entries = parsedData.entries.map(Keyring.deserializeKeyringEntry);
    } else {
      this.entries = [];
    }
  }

  public add(entry: KeyringEntry): void {
    this.entries.push(entry);
  }

  // Note: this returns an array with mutable element references. Thus e.g.
  // .getEntries().createIdentity() will change the keyring.
  public getEntries(): ReadonlyArray<KeyringEntry> {
    return this.entries;
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

/*
KeyringEntry is a generic interface for managing a set of keys and signing
data with them. A KeyringEntry is instanciated using KeyringEntryFactory
and assigned to a Keyring.

A KeyringEntry is responsible for generating secure (random) private keys
and signing with them. KeyringEntry can be implemented in software or as
a bridge to a hardware wallet.

It is inspired by metamask's design:
https://github.com/MetaMask/KeyringController/blob/master/docs/keyring.md
*/

export interface KeyringEntry {
  // createIdentity will create one new identity
  readonly createIdentity: () => Promise<LocalIdentity>;

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
  readonly implementationId: KeyringEntryImplementationIdString;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    tx: SignableBytes,
    prehash: Prehash,
    chainID: ChainId,
  ) => Promise<SignatureBytes>;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  readonly serialize: () => KeyringEntrySerializationString;

  readonly clone: () => KeyringEntry;
}
