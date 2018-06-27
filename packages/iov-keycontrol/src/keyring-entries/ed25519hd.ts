import {
  Bip39,
  Ed25519,
  Ed25519Keypair,
  Encoding,
  EnglishMnemonic,
  Slip0010,
  Slip0010Curve,
  Slip0010RawIndex,
} from "@iov/crypto";
import {
  Algorithm,
  ChainId,
  PublicKeyBundle,
  PublicKeyBytes,
  SignableBytes,
  SignatureBytes,
} from "@iov/types";

import { KeyDataString, KeyringEntry, PublicIdentity } from "../keyring";

export class Ed25519HdKeyringEntry implements KeyringEntry {
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdKeyringEntry {
    const mnemonic = Bip39.encode(bip39Entropy);
    const data = {
      secret: mnemonic.asString(),
    };
    return new Ed25519HdKeyringEntry(JSON.stringify(data) as KeyDataString);
  }

  private static identityId(identity: PublicKeyBundle): string {
    return identity.algo + "|" + Encoding.toHex(identity.data);
  }

  public readonly canSign: boolean = true;

  private readonly secret: EnglishMnemonic;
  private readonly identities: PublicIdentity[];
  private readonly privkeys: Map<string, Ed25519Keypair>;

  constructor(data: KeyDataString) {
    this.secret = new EnglishMnemonic(JSON.parse(data).secret);

    // TODO: deserialize
    this.identities = [];
    this.privkeys = new Map<string, Ed25519Keypair>();
  }

  public async createIdentity(): Promise<PublicIdentity> {
    const nextIndex = this.identities.length;

    const seed = await Bip39.mnemonicToSeed(this.secret);
    const path: ReadonlyArray<Slip0010RawIndex> = [Slip0010RawIndex.hardened(nextIndex)];
    const derivationResult = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
    const keypair = await Ed25519.makeKeypair(derivationResult.privkey);

    const newIdentity = {
      algo: Algorithm.ED25519,
      data: keypair.pubkey as PublicKeyBytes,
      nickname: undefined,
    };
    const newIdentityId = Ed25519HdKeyringEntry.identityId(newIdentity);

    this.privkeys.set(newIdentityId, keypair);
    this.identities.push(newIdentity);

    return newIdentity;
  }

  public async setIdentityNickname(identity: PublicKeyBundle, nickname: string | undefined): Promise<void> {
    const identityId = Ed25519HdKeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519HdKeyringEntry.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    // tslint:disable-next-line:no-object-mutation
    this.identities[index] = {
      algo: this.identities[index].algo,
      data: this.identities[index].data,
      nickname: nickname,
    };
  }

  public getIdentities(): ReadonlyArray<PublicIdentity> {
    return this.identities;
  }

  public async createTransactionSignature(
    identity: PublicKeyBundle,
    tx: SignableBytes,
    _: ChainId,
  ): Promise<SignatureBytes> {
    const keypair = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, keypair);
    return signature as SignatureBytes;
  }

  public async serialize(): Promise<KeyDataString> {
    const identities = this.identities.map(identity => {
      const keypair = this.privateKeyForIdentity(identity);
      return {
        publicIdentity: {
          algo: identity.algo,
          data: Encoding.toHex(identity.data),
          nickname: identity.nickname,
        },
        privkey: Encoding.toHex(keypair.privkey),
      };
    });

    const out = {
      secret: this.secret.asString(),
      identities: identities,
    };
    return JSON.stringify(out) as KeyDataString;
  }

  // This throws an exception when private key is missing
  private privateKeyForIdentity(identity: PublicKeyBundle): Ed25519Keypair {
    const identityId = Ed25519HdKeyringEntry.identityId(identity);
    const privkey = this.privkeys.get(identityId);
    if (!privkey) {
      throw new Error("No private key found for identity '" + identityId + "'");
    }
    return privkey;
  }
}
