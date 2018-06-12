import {
  Algorithm,
  ChainID,
  PublicKeyBundle,
  PublicKeyBytes,
  SignableBytes,
  SignatureBytes,
} from "@iov/types";

import { Ed25519 } from "@iov/crypto";

declare const KeyDataSymbol: unique symbol;
type KeyData = typeof KeyDataSymbol;
export type KeyDataString = KeyData & string;

declare const KeyringNameSymbol: unique symbol;
export type KeyringName = typeof KeyringNameSymbol & string;

// PublicIdentity is a public key we can identify with on a blockchain,
// as well as local info, like our nickname and if it is enabled currently
export interface PublicIdentity extends PublicKeyBundle {
  // nickname is an optional, local name.
  // this is not exposed to other people, use BNS registration for that
  readonly nickname?: string;

  // canSign flag means the private key is currently accessible.
  // if a hardware ledger is not plugged in, we may
  // see the public keys, but have it "inactive"
  // as long as this flag is false
  readonly canSign: boolean;
}

/*
A Keyring is a list of KeyringEntrys
TODO: define interface
*/

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
  readonly createIdentity: () => Promise<PublicIdentity>;

  // setIdentityName sets the name associated with the public key, if it exists
  readonly setIdentityName: (identity: PublicKeyBundle, name: string) => Promise<void>;

  // getIdentities returns all identities currently registered
  readonly getIdentities: () => Promise<ReadonlyArray<PublicIdentity>>;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  readonly createTransactionSignature: (
    identity: PublicKeyBundle,
    tx: SignableBytes,
    chainID: ChainID,
  ) => Promise<SignatureBytes>;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  readonly serialize: () => Promise<KeyDataString>;
}

// A KeyringEntryFactory is a constructor, but since `new` cannot be
// asynchronous, we use the factory model.
//
// The first time a KeyringEntry is created, it will receive no data and
// is responsible for initializing a random state.
// When a KeyringEntry is loaded from stored data, it will be passed
// a KeyDataString that came out of the `serialize` method of the
// same class on a prior run.
export type KeyringEntryFactory = (data?: KeyDataString) => Promise<KeyringEntry>;

export class Ed25519KeyringEntry implements KeyringEntry {
  private readonly identities: PublicIdentity[] = [];
  private readonly privkeys = new Map<string, Uint8Array>();
  private readonly names = new Map<string, string>();

  public async createIdentity(): Promise<PublicIdentity> {
    const keypair = await Ed25519.generateKeypair();

    const newIdentity: PublicIdentity = {
      algo: Algorithm.ED25519,
      data: keypair.pubkey as PublicKeyBytes,
      canSign: true,
    };
    const id = this.identityId(newIdentity);
    this.privkeys.set(id, keypair.privkey);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public async setIdentityName(identity: PublicKeyBundle, name: string): Promise<void> {
    const id = this.identityId(identity);
    this.names.set(id, name);
  }

  public async getIdentities(): Promise<ReadonlyArray<PublicIdentity>> {
    return this.identities;
  }

  public async createTransactionSignature(
    identity: PublicKeyBundle,
    tx: SignableBytes,
    _: ChainID,
  ): Promise<SignatureBytes> {
    const id = this.identityId(identity);
    const privkey = this.privkeys.get(id);
    if (!privkey) {
      throw new Error("No private key found for identity '" + id + "'");
    }

    const signature = await Ed25519.createSignature(tx, privkey);
    return signature as SignatureBytes;
  }

  public async serialize(): Promise<KeyDataString> {
    const out = this.identities.map(identity => {
      const id = this.identityId(identity);
      const privkey = this.privkeys.get(id);
      if (!privkey) {
        throw new Error("No private key found for identity '" + id + "'");
      }
      return {
        publicIdentity: {
          algo: identity.algo,
          data: this.toHex(identity.data),
        },
        privkey: this.toHex(privkey),
        name: this.names.get(id),
      };
    });
    return JSON.stringify(out) as KeyDataString;
  }

  private toHex(data: Uint8Array): string {
    // tslint:disable-next-line:no-let
    let out: string = "";
    for (const byte of data) {
      out += ("0" + byte.toString(16)).slice(-2);
    }
    return out;
  }

  private identityId(identity: PublicKeyBundle): string {
    return identity.algo + "|" + this.toHex(identity.data);
  }
}
