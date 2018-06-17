import { Ed25519, Encoding, Random } from "@iov/crypto";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignableBytes, SignatureBytes } from "@iov/types";

import { KeyDataString, KeyringEntry, PublicIdentity } from "../keyring";

export class Ed25519KeyringEntry implements KeyringEntry {
  private static identityId(identity: PublicKeyBundle): string {
    return identity.algo + "|" + Encoding.toHex(identity.data);
  }

  private readonly identities: PublicIdentity[];
  private readonly privkeys: Map<string, Uint8Array>;

  constructor(data?: KeyDataString) {
    const identities: PublicIdentity[] = [];
    const privkeys = new Map<string, Uint8Array>();
    if (data) {
      const decodedData = JSON.parse(data);
      for (const record of decodedData) {
        const identity: PublicIdentity = {
          algo: record.publicIdentity.algo,
          data: Encoding.fromHex(record.publicIdentity.data) as PublicKeyBytes,
          nickname: record.publicIdentity.nickname,
          canSign: true, // TODO: get from serialized data
        };
        const identityId = Ed25519KeyringEntry.identityId(identity);
        identities.push(identity);
        privkeys.set(identityId, Encoding.fromHex(record.privkey));
      }
    }

    this.identities = identities;
    this.privkeys = privkeys;
  }

  public async createIdentity(): Promise<PublicIdentity> {
    const seed = await Random.getBytes(32);
    const keypair = await Ed25519.generateKeypair(seed);

    const newIdentity: PublicIdentity = {
      algo: Algorithm.ED25519,
      data: keypair.pubkey as PublicKeyBytes,
      canSign: true,
    };
    const identityId = Ed25519KeyringEntry.identityId(newIdentity);
    this.privkeys.set(identityId, keypair.privkey);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public async setIdentityNickname(identity: PublicKeyBundle, nickname: string | undefined): Promise<void> {
    const identityId = Ed25519KeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519KeyringEntry.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    // tslint:disable-next-line:no-object-mutation
    this.identities[index] = {
      algo: this.identities[index].algo,
      data: this.identities[index].data,
      nickname,
      canSign: this.identities[index].canSign,
    };
  }

  public async getIdentities(): Promise<ReadonlyArray<PublicIdentity>> {
    return this.identities;
  }

  public async createTransactionSignature(
    identity: PublicKeyBundle,
    tx: SignableBytes,
    _: ChainId,
  ): Promise<SignatureBytes> {
    const privkey = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, privkey);
    return signature as SignatureBytes;
  }

  public async serialize(): Promise<KeyDataString> {
    const out = this.identities.map(identity => {
      const privkey = this.privateKeyForIdentity(identity);
      return {
        publicIdentity: {
          algo: identity.algo,
          data: Encoding.toHex(identity.data),
          nickname: identity.nickname,
          canSign: identity.canSign,
        },
        privkey: Encoding.toHex(privkey),
      };
    });
    return JSON.stringify(out) as KeyDataString;
  }

  // This throws an exception when private key is missing
  private privateKeyForIdentity(identity: PublicKeyBundle): Uint8Array {
    const identityId = Ed25519KeyringEntry.identityId(identity);
    const privkey = this.privkeys.get(identityId);
    if (!privkey) {
      throw new Error("No private key found for identity '" + identityId + "'");
    }
    return privkey;
  }
}
