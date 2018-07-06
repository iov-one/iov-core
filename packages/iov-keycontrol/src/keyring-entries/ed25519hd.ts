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
import { Algorithm, ChainId, PublicKeyBytes, SignableBytes, SignatureBytes } from "@iov/types";

import {
  KeyringEntry,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  PublicIdentity,
} from "../keyring";
import { DefaultValueProducer, ValueAndUpdates } from "../valueandupdates";

export interface PubkeySerialization {
  readonly algo: string;
  readonly data: string;
}

export interface LocalIdentitySerialization {
  readonly pubkey: PubkeySerialization;
  readonly label?: string;
}

export interface IdentitySerialization {
  readonly localIdentity: LocalIdentitySerialization;
  readonly privkeyPath: ReadonlyArray<number>;
}

// Only exported to be used in tests. This is implementation detail
// for applications and must not be exported outside of the package.
export interface Ed25519HdKeyringEntrySerialization {
  readonly secret: string;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

export class Ed25519HdKeyringEntry implements KeyringEntry {
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdKeyringEntry {
    return this.fromMnemonic(Bip39.encode(bip39Entropy).asString());
  }

  public static fromMnemonic(mnemonicString: string): Ed25519HdKeyringEntry {
    const data: Ed25519HdKeyringEntrySerialization = {
      secret: mnemonicString,
      identities: [],
    };
    return new this(JSON.stringify(data) as KeyringEntrySerializationString);
  }

  private static identityId(identity: PublicIdentity): string {
    return identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
  }

  private static algorithmFromString(input: string): Algorithm {
    switch (input) {
      case "ed25519":
        return Algorithm.ED25519;
      case "secp256k1":
        return Algorithm.SECP256K1;
      default:
        throw new Error("Unknown alogorithm string found");
    }
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign = new ValueAndUpdates(new DefaultValueProducer(true));
  public readonly implementationId = "override me!" as KeyringEntryImplementationIdString;

  private readonly secret: EnglishMnemonic;
  private readonly identities: LocalIdentity[];
  private readonly privkeyPaths: Map<string, ReadonlyArray<Slip0010RawIndex>>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data: KeyringEntrySerializationString) {
    const decodedData: Ed25519HdKeyringEntrySerialization = JSON.parse(data);

    this.secret = new EnglishMnemonic(decodedData.secret);

    const identities: LocalIdentity[] = [];
    const privkeyPaths = new Map<string, ReadonlyArray<Slip0010RawIndex>>();
    for (const record of decodedData.identities) {
      const identity: LocalIdentity = {
        pubkey: {
          algo: Ed25519HdKeyringEntry.algorithmFromString(record.localIdentity.pubkey.algo),
          data: Encoding.fromHex(record.localIdentity.pubkey.data) as PublicKeyBytes,
        },
        label: record.localIdentity.label,
      };
      const privkeyPath: ReadonlyArray<Slip0010RawIndex> = record.privkeyPath.map(
        n => new Slip0010RawIndex(n),
      );

      const identityId = Ed25519HdKeyringEntry.identityId(identity);
      identities.push(identity);
      privkeyPaths.set(identityId, privkeyPath);
    }

    this.identities = identities;
    this.privkeyPaths = privkeyPaths;
    this.labelProducer = new DefaultValueProducer<string | undefined>(undefined); // TODO: set
    this.label = new ValueAndUpdates(this.labelProducer);
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    throw new Error("Ed25519HdKeyringEntry.createIdentity must not be called directly. Use derived type.");
  }

  public async createIdentityWithPath(path: ReadonlyArray<Slip0010RawIndex>): Promise<LocalIdentity> {
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
    const keypair = await Ed25519.makeKeypair(derivationResult.privkey);

    const newIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: keypair.pubkey as PublicKeyBytes,
      },
      label: undefined,
    };
    const newIdentityId = Ed25519HdKeyringEntry.identityId(newIdentity);

    this.privkeyPaths.set(newIdentityId, path);
    this.identities.push(newIdentity);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = Ed25519HdKeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519HdKeyringEntry.identityId(i) === identityId);
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
    const keypair = await this.privkeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, keypair);
    return signature as SignatureBytes;
  }

  public serialize(): KeyringEntrySerializationString {
    const serializedIdentities = this.identities.map(
      (identity): IdentitySerialization => {
        const privkeyPath = this.privkeyPathForIdentity(identity);
        return {
          localIdentity: {
            pubkey: {
              algo: identity.pubkey.algo,
              data: Encoding.toHex(identity.pubkey.data),
            },
            label: identity.label,
          },
          privkeyPath: privkeyPath.map(rawIndex => rawIndex.asNumber()),
        };
      },
    );

    const out: Ed25519HdKeyringEntrySerialization = {
      secret: this.secret.asString(),
      identities: serializedIdentities,
    };
    return JSON.stringify(out) as KeyringEntrySerializationString;
  }

  public clone(): Ed25519HdKeyringEntry {
    return new Ed25519HdKeyringEntry(this.serialize());
  }

  // This throws an exception when private key is missing
  private privkeyPathForIdentity(identity: PublicIdentity): ReadonlyArray<Slip0010RawIndex> {
    const identityId = Ed25519HdKeyringEntry.identityId(identity);
    const privkeyPath = this.privkeyPaths.get(identityId);
    if (!privkeyPath) {
      throw new Error("No private key path found for identity '" + identityId + "'");
    }
    return privkeyPath;
  }

  // This throws an exception when private key is missing
  private async privkeyForIdentity(identity: PublicIdentity): Promise<Ed25519Keypair> {
    const privkeyPath = this.privkeyPathForIdentity(identity);
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, privkeyPath);
    const keypair = await Ed25519.makeKeypair(derivationResult.privkey);
    return keypair;
  }
}
