import PseudoRandom from "random-js";

import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Ed25519, Ed25519Keypair } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

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
  readonly privkey: string;
}

interface Ed25519WalletSerialization {
  readonly formatVersion: number;
  readonly id: string;
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

function deserialize(data: WalletSerializationString): Ed25519WalletSerialization {
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

export class Ed25519Wallet implements Wallet {
  private static readonly idPool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static readonly idsPrng: PseudoRandom.Engine = PseudoRandom.engines.mt19937().autoSeed();

  private static generateId(): WalletId {
    // this can be pseudo-random, just used for internal book-keeping
    const code = PseudoRandom.string(Ed25519Wallet.idPool)(Ed25519Wallet.idsPrng, 16);
    return code as WalletId;
  }

  private static identityId(identity: PublicIdentity): LocalIdentityId {
    const id = identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
    return id as LocalIdentityId;
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
  public readonly implementationId = "ed25519" as WalletImplementationIdString;
  public readonly id: WalletId;

  private readonly identities: LocalIdentity[];
  private readonly privkeys: Map<string, Ed25519Keypair>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data?: WalletSerializationString) {
    let id: WalletId;
    let label: string | undefined;
    const identities: LocalIdentity[] = [];
    const privkeys = new Map<string, Ed25519Keypair>();

    if (data) {
      const decodedData = deserialize(data);

      // label
      label = decodedData.label;
      id = decodedData.id as WalletId;

      // identities
      for (const record of decodedData.identities) {
        const keypair = new Ed25519Keypair(
          Encoding.fromHex(record.privkey),
          Encoding.fromHex(record.localIdentity.pubkey.data),
        );
        if (Ed25519Wallet.algorithmFromString(record.localIdentity.pubkey.algo) !== Algorithm.Ed25519) {
          throw new Error("This keyring only supports ed25519 private keys");
        }
        const identity = this.buildLocalIdentity(
          keypair.pubkey as PublicKeyBytes,
          record.localIdentity.label,
        );
        identities.push(identity);
        privkeys.set(identity.id, keypair);
      }
    } else {
      id = Ed25519Wallet.generateId();
    }

    this.identities = identities;
    this.privkeys = privkeys;
    this.labelProducer = new DefaultValueProducer<string | undefined>(label);
    this.label = new ValueAndUpdates(this.labelProducer);
    this.id = id;
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(options: unknown): Promise<LocalIdentity> {
    if (!(options instanceof Ed25519Keypair)) {
      throw new Error("Ed25519.createIdentity requires a keypair argument");
    }
    const keypair = options;

    const newIdentity = this.buildLocalIdentity(keypair.pubkey as PublicKeyBytes, undefined);

    if (this.identities.find(i => i.id === newIdentity.id)) {
      throw new Error(
        "Identity ID collision: this happens when you try to create multiple identities with the same keypair in the same wallet.",
      );
    }

    this.privkeys.set(newIdentity.id, keypair);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = Ed25519Wallet.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519Wallet.identityId(i) === identityId);
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
    const privkey = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(prehash(transactionBytes, prehashType), privkey);
    return signature as SignatureBytes;
  }

  public serialize(): WalletSerializationString {
    const out: Ed25519WalletSerialization = {
      formatVersion: 1,
      id: this.id,
      label: this.label.value,
      identities: this.identities.map(identity => {
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
      }),
    };
    return JSON.stringify(out) as WalletSerializationString;
  }

  public clone(): Ed25519Wallet {
    return new Ed25519Wallet(this.serialize());
  }

  // This throws an exception when private key is missing
  private privateKeyForIdentity(identity: PublicIdentity): Ed25519Keypair {
    const identityId = Ed25519Wallet.identityId(identity);
    const privkey = this.privkeys.get(identityId);
    if (!privkey) {
      throw new Error("No private key found for identity '" + identityId + "'");
    }
    return privkey;
  }

  private buildLocalIdentity(bytes: PublicKeyBytes, label: string | undefined): LocalIdentity {
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: bytes,
    };
    return {
      pubkey,
      label,
      id: Ed25519Wallet.identityId({ pubkey }),
    };
  }
}
