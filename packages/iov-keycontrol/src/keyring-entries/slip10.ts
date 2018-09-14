import { PrehashType, SignableBytes } from "@iov/bcp-types";
import {
  Bip39,
  Ed25519,
  Ed25519Keypair,
  EnglishMnemonic,
  Secp256k1,
  Sha256,
  Slip10,
  Slip10Curve,
  slip10CurveFromString,
  Slip10RawIndex,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import {
  KeyringEntry,
  KeyringEntryId,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  LocalIdentityId,
  PublicIdentity,
} from "../keyring";
import { prehash } from "../prehashing";
import { DefaultValueProducer, ValueAndUpdates } from "../valueandupdates";

interface PubkeySerialization {
  readonly algo: string;
  readonly data: string;
}

interface LocalIdentitySerialization {
  readonly pubkey: PubkeySerialization;
  readonly label?: string;
}

interface IdentitySerialization {
  readonly localIdentity: LocalIdentitySerialization;
  readonly privkeyPath: ReadonlyArray<number>;
}

interface Slip10KeyringEntrySerialization {
  readonly secret: string;
  readonly curve: string;
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

interface Slip10KeyringEntryConstructor {
  new (data: KeyringEntrySerializationString): Slip10KeyringEntry;
}

export class Slip10KeyringEntry implements KeyringEntry {
  public static fromEntropyWithCurve(
    curve: Slip10Curve,
    bip39Entropy: Uint8Array,
    cls?: Slip10KeyringEntryConstructor,
  ): Slip10KeyringEntry {
    return this.fromMnemonicWithCurve(curve, Bip39.encode(bip39Entropy).asString(), cls);
  }

  // pass in proper class, so we have it available in javascript object, not just in the type definitions.
  public static fromMnemonicWithCurve(
    curve: Slip10Curve,
    mnemonicString: string,
    cls: Slip10KeyringEntryConstructor = Slip10KeyringEntry,
  ): Slip10KeyringEntry {
    const data: Slip10KeyringEntrySerialization = {
      secret: mnemonicString,
      curve: curve,
      label: undefined,
      identities: [],
    };
    return new cls(JSON.stringify(data) as KeyringEntrySerializationString);
  }

  private static identityId(identity: PublicIdentity): LocalIdentityId {
    const id = identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
    return id as LocalIdentityId;
  }

  private static algorithmFromCurve(curve: Slip10Curve): Algorithm {
    switch (curve) {
      case Slip10Curve.Ed25519:
        return Algorithm.ED25519;
      case Slip10Curve.Secp256k1:
        return Algorithm.SECP256K1;
      default:
        throw new Error("Unknown curve input");
    }
  }

  private static algorithmFromString(input: string): Algorithm {
    switch (input) {
      case "ed25519":
        return Algorithm.ED25519;
      case "secp256k1":
        return Algorithm.SECP256K1;
      default:
        throw new Error("Unknown algorithm string found");
    }
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign = new ValueAndUpdates(new DefaultValueProducer(true));
  public readonly implementationId = "override me!" as KeyringEntryImplementationIdString;
  public readonly id: KeyringEntryId;

  private readonly secret: EnglishMnemonic;
  private readonly curve: Slip10Curve;
  private readonly identities: LocalIdentity[];
  private readonly privkeyPaths: Map<string, ReadonlyArray<Slip10RawIndex>>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data: KeyringEntrySerializationString, implementationId?: KeyringEntryImplementationIdString) {
    /*
      We need to set implementationId here, as we use it to construct the id below.
      The default auto-generated constructor earlier looked like this:
        constructor() {
          super(...arguments);
          this.implementationId = "ed25519-simpleaddress";
        }
      And we always got "override me!" as the beginning of the id.
    */
    if (implementationId) {
      this.implementationId = implementationId;
    }

    const decodedData: Slip10KeyringEntrySerialization = JSON.parse(data);

    // secret
    this.secret = new EnglishMnemonic(decodedData.secret);

    // curve
    this.curve = slip10CurveFromString(decodedData.curve);

    // label
    this.labelProducer = new DefaultValueProducer<string | undefined>(decodedData.label);
    this.label = new ValueAndUpdates(this.labelProducer);

    // identities
    const identities: LocalIdentity[] = [];
    const privkeyPaths = new Map<string, ReadonlyArray<Slip10RawIndex>>();
    for (const record of decodedData.identities) {
      const algorithm = Slip10KeyringEntry.algorithmFromString(record.localIdentity.pubkey.algo);
      if (algorithm !== Slip10KeyringEntry.algorithmFromCurve(this.curve)) {
        throw new Error(
          "Identity algorithm does not match curve. This must not happen because each Slip10KeyringEntry instance supports only one fixed curve",
        );
      }

      const identity = this.buildLocalIdentity(
        Encoding.fromHex(record.localIdentity.pubkey.data) as PublicKeyBytes,
        record.localIdentity.label,
      );
      const privkeyPath: ReadonlyArray<Slip10RawIndex> = record.privkeyPath.map(n => new Slip10RawIndex(n));

      identities.push(identity);
      privkeyPaths.set(identity.id, privkeyPath);
    }

    this.identities = identities;
    this.privkeyPaths = privkeyPaths;

    // id depends on the secret and the subclass implementation
    this.id = this.calculateId();
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    throw new Error("Slip10KeyringEntry.createIdentity must not be called directly. Use derived type.");
  }

  public async createIdentityWithPath(path: ReadonlyArray<Slip10RawIndex>): Promise<LocalIdentity> {
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip10.derivePath(this.curve, seed, path);

    // tslint:disable-next-line:no-let
    let pubkeyBytes: PublicKeyBytes;
    switch (this.curve) {
      case Slip10Curve.Ed25519:
        {
          const keypair = await Ed25519.makeKeypair(derivationResult.privkey);
          pubkeyBytes = keypair.pubkey as PublicKeyBytes;
        }
        break;
      case Slip10Curve.Secp256k1:
        {
          const keypair = await Secp256k1.makeKeypair(derivationResult.privkey);
          pubkeyBytes = keypair.pubkey as PublicKeyBytes;
        }
        break;
      default:
        throw new Error("Unknown curve");
    }

    const newIdentity = this.buildLocalIdentity(pubkeyBytes, undefined);
    this.privkeyPaths.set(newIdentity.id, path);
    this.identities.push(newIdentity);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = Slip10KeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Slip10KeyringEntry.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    // tslint:disable-next-line:no-object-mutation
    this.identities[index] = {
      ...this.identities[index],
      label: label,
    };
  }

  public getIdentities(): ReadonlyArray<LocalIdentity> {
    return this.identities;
  }

  public async createTransactionSignature(
    identity: PublicIdentity,
    transactionBytes: SignableBytes,
    prehashType: PrehashType,
    _: ChainId,
  ): Promise<SignatureBytes> {
    const keypair = await this.privkeyForIdentity(identity);
    const signature = await Ed25519.createSignature(prehash(transactionBytes, prehashType), keypair);
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

    const out: Slip10KeyringEntrySerialization = {
      secret: this.secret.asString(),
      curve: this.curve,
      label: this.label.value,
      identities: serializedIdentities,
    };
    return JSON.stringify(out) as KeyringEntrySerializationString;
  }

  public clone(): Slip10KeyringEntry {
    return new Slip10KeyringEntry(this.serialize());
  }

  // This throws an exception when private key is missing
  private privkeyPathForIdentity(identity: PublicIdentity): ReadonlyArray<Slip10RawIndex> {
    const identityId = Slip10KeyringEntry.identityId(identity);
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
    const derivationResult = Slip10.derivePath(Slip10Curve.Ed25519, seed, privkeyPath);
    const keypair = await Ed25519.makeKeypair(derivationResult.privkey);
    return keypair;
  }

  private buildLocalIdentity(bytes: PublicKeyBytes, label: string | undefined): LocalIdentity {
    const algorithm = Slip10KeyringEntry.algorithmFromCurve(this.curve);
    const pubkey: PublicKeyBundle = {
      algo: algorithm,
      data: bytes,
    };
    return {
      pubkey,
      label,
      id: Slip10KeyringEntry.identityId({ pubkey }),
    };
  }

  // calculate id returns the tripple sha256 hash of the bip39 entropy as hex-string
  // prepended by implementationId of the concrete class (to differentiate eg. secp256k1 and ed25519 keyrings)
  private calculateId(): KeyringEntryId {
    /* tslint:disable:no-let */
    let data = Bip39.decode(this.secret);
    for (let i = 0; i < 3; i++) {
      data = new Sha256(data).digest();
    }
    const hex = Encoding.toHex(data);
    return `${this.implementationId}:${hex}` as KeyringEntryId;
  }
}
