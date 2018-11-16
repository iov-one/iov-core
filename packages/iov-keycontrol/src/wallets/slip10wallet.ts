import PseudoRandom from "random-js";

import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import { PrehashType, SignableBytes } from "@iov/bcp-types";
import {
  Bip39,
  Ed25519,
  EnglishMnemonic,
  Secp256k1,
  Slip10,
  Slip10Curve,
  slip10CurveFromString,
  Slip10RawIndex,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { prehash } from "../prehashing";
import {
  LocalIdentity,
  LocalIdentityId,
  PublicIdentity,
  Wallet,
  WalletId,
  WalletImplementationIdString,
  WalletSerializationString,
} from "../wallet";

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

interface Slip10WalletSerialization {
  readonly formatVersion: number;
  readonly id: string;
  readonly secret: string;
  readonly curve: string;
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

interface Slip10WalletConstructor {
  new (data: WalletSerializationString): Slip10Wallet;
}

function isPath(value: unknown): value is ReadonlyArray<Slip10RawIndex> {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(item => item instanceof Slip10RawIndex);
}

function deserialize(data: WalletSerializationString): Slip10WalletSerialization {
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

  // other checks

  const id = doc.id;
  if (typeof id !== "string") {
    throw new Error("Expected property 'id' of type string");
  }

  if (!id.match(/^[a-zA-Z0-9]+$/)) {
    throw new Error(`Property 'id' does not match expected format. Got: '${id}'`);
  }

  return doc;
}

export class Slip10Wallet implements Wallet {
  public static fromEntropyWithCurve(
    curve: Slip10Curve,
    bip39Entropy: Uint8Array,
    cls?: Slip10WalletConstructor,
  ): Slip10Wallet {
    return this.fromMnemonicWithCurve(curve, Bip39.encode(bip39Entropy).asString(), cls);
  }

  // pass in proper class, so we have it available in javascript object, not just in the type definitions.
  public static fromMnemonicWithCurve(
    curve: Slip10Curve,
    mnemonicString: string,
    cls: Slip10WalletConstructor = Slip10Wallet,
  ): Slip10Wallet {
    const data: Slip10WalletSerialization = {
      formatVersion: 1,
      id: Slip10Wallet.generateId(),
      secret: mnemonicString,
      curve: curve,
      label: undefined,
      identities: [],
    };
    return new cls(JSON.stringify(data) as WalletSerializationString);
  }

  private static readonly idPool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static readonly idsPrng: PseudoRandom.Engine = PseudoRandom.engines.mt19937().autoSeed();

  private static generateId(): WalletId {
    // this can be pseudo-random, just used for internal book-keeping
    const code = PseudoRandom.string(Slip10Wallet.idPool)(Slip10Wallet.idsPrng, 16);
    return code as WalletId;
  }

  private static identityId(identity: PublicIdentity): LocalIdentityId {
    const id = identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
    return id as LocalIdentityId;
  }

  private static algorithmFromCurve(curve: Slip10Curve): Algorithm {
    switch (curve) {
      case Slip10Curve.Ed25519:
        return Algorithm.Ed25519;
      case Slip10Curve.Secp256k1:
        return Algorithm.Secp256k1;
      default:
        throw new Error("Unknown curve input");
    }
  }

  private static algorithmFromString(input: string): Algorithm {
    switch (input) {
      case "ed25519":
        return Algorithm.Ed25519;
      case "secp256k1":
        return Algorithm.Secp256k1;
      default:
        throw new Error("Unknown algorithm string found");
    }
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign = new ValueAndUpdates(new DefaultValueProducer(true));
  public readonly implementationId = "override me!" as WalletImplementationIdString;
  public readonly id: WalletId;

  private readonly secret: EnglishMnemonic;
  private readonly curve: Slip10Curve;
  private readonly identities: LocalIdentity[];
  private readonly privkeyPaths: Map<string, ReadonlyArray<Slip10RawIndex>>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data: WalletSerializationString) {
    const decodedData = deserialize(data);

    // id
    this.id = decodedData.id as WalletId;

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
      const algorithm = Slip10Wallet.algorithmFromString(record.localIdentity.pubkey.algo);
      if (algorithm !== Slip10Wallet.algorithmFromCurve(this.curve)) {
        throw new Error(
          "Identity algorithm does not match curve. This must not happen because each Slip10Wallet instance supports only one fixed curve",
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
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(options: unknown): Promise<LocalIdentity> {
    if (!isPath(options)) {
      throw new Error("Did not get the correct argument type. Expected array of Slip10RawIndex");
    }
    const path = options;

    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip10.derivePath(this.curve, seed, path);

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

    if (this.identities.find(i => i.id === newIdentity.id)) {
      throw new Error(
        "Identity ID collision: this happens when you try to create multiple identities with the same path in the same wallet.",
      );
    }

    this.privkeyPaths.set(newIdentity.id, path);
    this.identities.push(newIdentity);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = Slip10Wallet.identityId(identity);
    const index = this.identities.findIndex(i => Slip10Wallet.identityId(i) === identityId);
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
    // validate curve/prehash combination
    switch (this.curve) {
      case Slip10Curve.Ed25519:
        // no restrictions, go ahead
        break;
      case Slip10Curve.Secp256k1:
        switch (prehashType) {
          case PrehashType.None:
            throw new Error("Prehashing required for Secp256k1");
        }
        break;
      default:
        throw new Error("Unknown curve");
    }

    const privkey = await this.privkeyForIdentity(identity);
    const message = prehash(transactionBytes, prehashType);

    let signature: Uint8Array;
    switch (this.curve) {
      case Slip10Curve.Ed25519:
        signature = await Ed25519.createSignature(message, await Ed25519.makeKeypair(privkey));
        break;
      case Slip10Curve.Secp256k1:
        signature =
          prehashType === PrehashType.Keccak256
            ? await Secp256k1.createSignatureEth(message, privkey)
            : await Secp256k1.createSignature(message, privkey);
        break;
      default:
        throw new Error("Unknown curve");
    }
    return signature as SignatureBytes;
  }

  public printableSecret(): string {
    return this.secret.asString();
  }

  public serialize(): WalletSerializationString {
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

    const out: Slip10WalletSerialization = {
      formatVersion: 1,
      id: this.id,
      secret: this.secret.asString(),
      curve: this.curve,
      label: this.label.value,
      identities: serializedIdentities,
    };
    return JSON.stringify(out) as WalletSerializationString;
  }

  public clone(): Slip10Wallet {
    return new Slip10Wallet(this.serialize());
  }

  // This throws an exception when private key is missing
  private privkeyPathForIdentity(identity: PublicIdentity): ReadonlyArray<Slip10RawIndex> {
    const identityId = Slip10Wallet.identityId(identity);
    const privkeyPath = this.privkeyPaths.get(identityId);
    if (!privkeyPath) {
      throw new Error("No private key path found for identity '" + identityId + "'");
    }
    return privkeyPath;
  }

  // This throws an exception when private key is missing
  private async privkeyForIdentity(identity: PublicIdentity): Promise<Uint8Array> {
    const privkeyPath = this.privkeyPathForIdentity(identity);
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip10.derivePath(this.curve, seed, privkeyPath);
    return derivationResult.privkey;
  }

  private buildLocalIdentity(bytes: PublicKeyBytes, label: string | undefined): LocalIdentity {
    const algorithm = Slip10Wallet.algorithmFromCurve(this.curve);
    const pubkey: PublicKeyBundle = {
      algo: algorithm,
      data: bytes,
    };
    return {
      pubkey,
      label,
      id: Slip10Wallet.identityId({ pubkey }),
    };
  }
}
