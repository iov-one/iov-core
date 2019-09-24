import {
  Algorithm,
  ChainId,
  Identity,
  PrehashType,
  PubkeyBytes,
  SignableBytes,
  SignatureBytes,
} from "@iov/bcp";
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
import PseudoRandom from "random-js";
import { As } from "type-tagger";

import { prehash } from "../prehashing";
import { Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "../wallet";

interface PubkeySerialization {
  readonly algo: string;
  readonly data: string;
}

interface LocalIdentitySerialization {
  readonly chainId: string;
  readonly pubkey: PubkeySerialization;
  readonly label?: string;
}

interface IdentitySerialization {
  readonly localIdentity: LocalIdentitySerialization;
  readonly privkeyPath: readonly number[];
}

interface Slip10WalletSerialization {
  readonly formatVersion: number;
  readonly id: string;
  readonly secret: string;
  readonly curve: string;
  readonly label: string | undefined;
  readonly identities: readonly IdentitySerialization[];
}

interface Slip10WalletConstructor {
  new (data: WalletSerializationString): Slip10Wallet;
}

function isPath(value: unknown): value is readonly Slip10RawIndex[] {
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
      throw new Error(
        "Wallet format version 1 detected. " +
          "No automatic migration is possible from that format since it is missing chain IDs in identities. " +
          "Use IOV-Core 0.9 or 0.10 to export the secret and re-create wallet in IOV-Core 0.11+.",
      );
    case 2:
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

type IdentityId = string & As<"identity-id">;

export class Slip10Wallet implements Wallet {
  public static fromEntropyWithCurve(
    curve: Slip10Curve,
    bip39Entropy: Uint8Array,
    cls?: Slip10WalletConstructor,
  ): Slip10Wallet {
    return this.fromMnemonicWithCurve(curve, Bip39.encode(bip39Entropy).toString(), cls);
  }

  // pass in proper class, so we have it available in javascript object, not just in the type definitions.
  public static fromMnemonicWithCurve(
    curve: Slip10Curve,
    mnemonicString: string,
    cls: Slip10WalletConstructor = Slip10Wallet,
  ): Slip10Wallet {
    const data: Slip10WalletSerialization = {
      formatVersion: 2,
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

  private static identityId(identity: Identity): IdentityId {
    const id = [identity.chainId, identity.pubkey.algo, Encoding.toHex(identity.pubkey.data)].join("|");
    return id as IdentityId;
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

  private static buildIdentity(curve: Slip10Curve, chainId: ChainId, bytes: PubkeyBytes): Identity {
    if (!chainId) {
      throw new Error("Got empty chain ID when tying to build a local identity.");
    }

    const algorithm = Slip10Wallet.algorithmFromCurve(curve);
    const identity: Identity = {
      chainId: chainId,
      pubkey: {
        algo: algorithm,
        data: bytes,
      },
    };
    return identity;
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
  public readonly implementationId = "override me!" as WalletImplementationIdString;
  public readonly id: WalletId;

  // wallet
  private readonly secret: EnglishMnemonic;
  private readonly curve: Slip10Curve;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  // identities
  private readonly identities: Identity[];
  private readonly privkeyPaths: Map<IdentityId, readonly Slip10RawIndex[]>;
  private readonly labels: Map<IdentityId, string | undefined>;

  public constructor(data: WalletSerializationString) {
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
    const identities: Identity[] = [];
    const privkeyPaths = new Map<IdentityId, readonly Slip10RawIndex[]>();
    const labels = new Map<IdentityId, string | undefined>();
    for (const record of decodedData.identities) {
      const algorithm = Slip10Wallet.algorithmFromString(record.localIdentity.pubkey.algo);
      if (algorithm !== Slip10Wallet.algorithmFromCurve(this.curve)) {
        throw new Error(
          "Identity algorithm does not match curve. This must not happen because each Slip10Wallet instance supports only one fixed curve",
        );
      }

      const identity = Slip10Wallet.buildIdentity(
        this.curve,
        record.localIdentity.chainId as ChainId,
        Encoding.fromHex(record.localIdentity.pubkey.data) as PubkeyBytes,
      );

      const privkeyPath: readonly Slip10RawIndex[] = record.privkeyPath.map(n => new Slip10RawIndex(n));
      privkeyPaths.set(Slip10Wallet.identityId(identity), privkeyPath);
      labels.set(Slip10Wallet.identityId(identity), record.localIdentity.label);
      identities.push(identity);
    }

    this.identities = identities;

    this.privkeyPaths = privkeyPaths;
    this.labels = labels;
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async previewIdentity(chainId: ChainId, options: unknown): Promise<Identity> {
    if (!isPath(options)) {
      throw new Error("Did not get the correct argument type. Expected array of Slip10RawIndex");
    }
    const path = options;

    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip10.derivePath(this.curve, seed, path);

    let pubkeyBytes: PubkeyBytes;
    switch (this.curve) {
      case Slip10Curve.Ed25519:
        {
          const keypair = await Ed25519.makeKeypair(derivationResult.privkey);
          pubkeyBytes = keypair.pubkey as PubkeyBytes;
        }
        break;
      case Slip10Curve.Secp256k1:
        {
          const keypair = await Secp256k1.makeKeypair(derivationResult.privkey);
          pubkeyBytes = keypair.pubkey as PubkeyBytes;
        }
        break;
      default:
        throw new Error("Unknown curve");
    }

    return Slip10Wallet.buildIdentity(this.curve, chainId, pubkeyBytes);
  }

  public async createIdentity(chainId: ChainId, options: unknown): Promise<Identity> {
    if (!isPath(options)) {
      throw new Error("Did not get the correct argument type. Expected array of Slip10RawIndex");
    }
    const path = options;

    const newIdentity = await this.previewIdentity(chainId, options);
    const newIdentityId = Slip10Wallet.identityId(newIdentity);

    if (this.identities.find(i => Slip10Wallet.identityId(i) === newIdentityId)) {
      throw new Error(
        "Identity ID collision: this happens when you try to create multiple identities with the same path in the same wallet.",
      );
    }

    this.privkeyPaths.set(newIdentityId, path);
    this.labels.set(newIdentityId, undefined);
    this.identities.push(newIdentity);

    return newIdentity;
  }

  public setIdentityLabel(identity: Identity, label: string | undefined): void {
    const identityId = Slip10Wallet.identityId(identity);
    const index = this.identities.findIndex(i => Slip10Wallet.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }
    this.labels.set(identityId, label);
  }

  public getIdentityLabel(identity: Identity): string | undefined {
    const identityId = Slip10Wallet.identityId(identity);
    const index = this.identities.findIndex(i => Slip10Wallet.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    return this.labels.get(identityId);
  }

  public getIdentities(): readonly Identity[] {
    // copy array to avoid internal updates to affect caller and vice versa
    return [...this.identities];
  }

  public async createTransactionSignature(
    identity: Identity,
    transactionBytes: SignableBytes,
    prehashType: PrehashType,
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
        // Secp256k1 signatures come in the fixed length encoding. You
        // probably cannot use this directly, but ExtendedSecp256k1Signature
        // is there to parse and use. E.g.
        //   ExtendedSecp256k1Signature.fromFixedLength(signatureBytes).toDer()
        // or
        //   const sig = ExtendedSecp256k1Signature.fromFixedLength(signatureBytes);
        //   const r = sig.r();
        //   const s = sig.s();
        //   const recoveryParam = sig.recovery;
        signature = (await Secp256k1.createSignature(message, privkey)).toFixedLength();
        break;
      default:
        throw new Error("Unknown curve");
    }
    return signature as SignatureBytes;
  }

  public printableSecret(): string {
    return this.secret.toString();
  }

  public serialize(): WalletSerializationString {
    const serializedIdentities = this.identities.map(
      (identity): IdentitySerialization => {
        const label = this.getIdentityLabel(identity);
        const privkeyPath = this.privkeyPathForIdentity(identity);
        return {
          localIdentity: {
            chainId: identity.chainId,
            pubkey: {
              algo: identity.pubkey.algo,
              data: Encoding.toHex(identity.pubkey.data),
            },
            label: label,
          },
          privkeyPath: privkeyPath.map(rawIndex => rawIndex.toNumber()),
        };
      },
    );

    const out: Slip10WalletSerialization = {
      formatVersion: 2,
      id: this.id,
      secret: this.secret.toString(),
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
  private privkeyPathForIdentity(identity: Identity): readonly Slip10RawIndex[] {
    const identityId = Slip10Wallet.identityId(identity);
    const privkeyPath = this.privkeyPaths.get(identityId);
    if (!privkeyPath) {
      throw new Error("No private key path found for identity '" + identityId + "'");
    }
    return privkeyPath;
  }

  // This throws an exception when private key is missing
  private async privkeyForIdentity(identity: Identity): Promise<Uint8Array> {
    const privkeyPath = this.privkeyPathForIdentity(identity);
    const seed = await Bip39.mnemonicToSeed(this.secret);
    const derivationResult = Slip10.derivePath(this.curve, seed, privkeyPath);
    return derivationResult.privkey;
  }
}
