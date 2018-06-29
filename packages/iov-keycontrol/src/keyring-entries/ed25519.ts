import { Ed25519, Ed25519Keypair, Encoding, Random } from "@iov/crypto";
import { Algorithm, ChainId, PublicKeyBytes, SignableBytes, SignatureBytes } from "@iov/types";

import { KeyDataString, KeyringEntry, LocalIdentity, PublicIdentity } from "../keyring";

export class Ed25519KeyringEntry implements KeyringEntry {
  private static identityId(identity: PublicIdentity): string {
    return identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
  }

  public readonly canSign = true;

  private readonly identities: LocalIdentity[];
  private readonly privkeys: Map<string, Ed25519Keypair>;

  constructor(data?: KeyDataString) {
    const identities: LocalIdentity[] = [];
    const privkeys = new Map<string, Ed25519Keypair>();
    if (data) {
      const decodedData = JSON.parse(data);
      for (const record of decodedData) {
        const keypair = new Ed25519Keypair(
          Encoding.fromHex(record.privkey),
          Encoding.fromHex(record.localIdentity.pubkey.data),
        );
        const identity: LocalIdentity = {
          pubkey: {
            algo: record.localIdentity.pubkey.algo,
            data: keypair.pubkey as PublicKeyBytes,
          },
          label: record.localIdentity.label,
        };
        const identityId = Ed25519KeyringEntry.identityId(identity);
        identities.push(identity);
        privkeys.set(identityId, keypair);
      }
    }

    this.identities = identities;
    this.privkeys = privkeys;
  }

  public async createIdentity(): Promise<LocalIdentity> {
    const seed = await Random.getBytes(32);
    const keypair = await Ed25519.makeKeypair(seed);

    const newIdentity: LocalIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: keypair.pubkey as PublicKeyBytes,
      },
      label: undefined,
    };
    const identityId = Ed25519KeyringEntry.identityId(newIdentity);
    this.privkeys.set(identityId, keypair);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public async setIdentityLabel(identity: PublicIdentity, label: string | undefined): Promise<void> {
    const identityId = Ed25519KeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519KeyringEntry.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    // tslint:disable-next-line:no-object-mutation
    this.identities[index] = {
      pubkey: this.identities[index].pubkey,
      label: label,
    };
  }

  public getIdentities(): ReadonlyArray<LocalIdentity> {
    return this.identities;
  }

  public async createTransactionSignature(
    identity: PublicIdentity,
    tx: SignableBytes,
    _: ChainId,
  ): Promise<SignatureBytes> {
    const privkey = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, privkey);
    return signature as SignatureBytes;
  }

  public async serialize(): Promise<KeyDataString> {
    const out = this.identities.map(identity => {
      const keypair = this.privateKeyForIdentity(identity);
      return {
        localIdentity: {
          pubkey: {
            algo: identity.pubkey.algo,
            data: Encoding.toHex(identity.pubkey.data),
          },
          label: identity.label,
        },
        privkey: Encoding.toHex(keypair.privkey),
      };
    });
    return JSON.stringify(out) as KeyDataString;
  }

  // This throws an exception when private key is missing
  private privateKeyForIdentity(identity: PublicIdentity): Ed25519Keypair {
    const identityId = Ed25519KeyringEntry.identityId(identity);
    const privkey = this.privkeys.get(identityId);
    if (!privkey) {
      throw new Error("No private key found for identity '" + identityId + "'");
    }
    return privkey;
  }
}
