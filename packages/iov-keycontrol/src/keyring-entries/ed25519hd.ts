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
      identities: [],
    };
    return new Ed25519HdKeyringEntry(JSON.stringify(data) as KeyDataString);
  }

  private static identityId(identity: PublicKeyBundle): string {
    return identity.algo + "|" + Encoding.toHex(identity.data);
  }

  public readonly canSign: boolean = true;

  private readonly secret: EnglishMnemonic;
  private readonly identities: PublicIdentity[];
  private readonly privkeyPaths: Map<string, ReadonlyArray<Slip0010RawIndex>>;

  constructor(data: KeyDataString) {
    const decodedData = JSON.parse(data);

    this.secret = new EnglishMnemonic(decodedData.secret);

    if (!Array.isArray(decodedData.identities)) {
      throw new Error("identities field is not a an array");
    }
    const identities: PublicIdentity[] = [];
    const privkeyPaths = new Map<string, ReadonlyArray<Slip0010RawIndex>>();
    for (const record of decodedData.identities) {
      const identity: PublicIdentity = {
        algo: record.publicIdentity.algo,
        data: Encoding.fromHex(record.publicIdentity.data) as PublicKeyBytes,
        nickname: record.publicIdentity.nickname,
      };
      const privkeyPath: ReadonlyArray<Slip0010RawIndex> = (record.privkeyPath as number[]).map(
        n => new Slip0010RawIndex(n),
      );

      const identityId = Ed25519HdKeyringEntry.identityId(identity);
      identities.push(identity);
      privkeyPaths.set(identityId, privkeyPath);
    }

    this.identities = identities;
    this.privkeyPaths = privkeyPaths;
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

    this.privkeyPaths.set(newIdentityId, path);
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
    const keypair = await this.privkeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, keypair);
    return signature as SignatureBytes;
  }

  public async serialize(): Promise<KeyDataString> {
    const identities = this.identities.map(identity => {
      const privkeyPath = this.privkeyPathForIdentity(identity);
      return {
        publicIdentity: {
          algo: identity.algo,
          data: Encoding.toHex(identity.data),
          nickname: identity.nickname,
        },
        privkeyPath: privkeyPath.map(rawIndex => rawIndex.asNumber()),
      };
    });

    const out = {
      secret: this.secret.asString(),
      identities: identities,
    };
    return JSON.stringify(out) as KeyDataString;
  }

  // This throws an exception when private key is missing
  private privkeyPathForIdentity(identity: PublicKeyBundle): ReadonlyArray<Slip0010RawIndex> {
    const identityId = Ed25519HdKeyringEntry.identityId(identity);
    const privkeyPath = this.privkeyPaths.get(identityId);
    if (!privkeyPath) {
      throw new Error("No private key path found for identity '" + identityId + "'");
    }
    return privkeyPath;
  }

  // This throws an exception when private key is missing
  private async privkeyForIdentity(identity: PublicKeyBundle): Promise<Ed25519Keypair> {
    const privkeyPath = this.privkeyPathForIdentity(identity);
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, privkeyPath);
    const keypair = await Ed25519.makeKeypair(derivationResult.privkey);
    return keypair;
  }
}
