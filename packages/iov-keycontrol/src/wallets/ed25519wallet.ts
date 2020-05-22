import {
  Algorithm,
  ChainId,
  Identity,
  PrehashType,
  PubkeyBytes,
  SignableBytes,
  SignatureBytes,
} from "@iov/bcp";
import { Ed25519, Ed25519Keypair } from "@iov/crypto";
import { fromHex, toHex } from "@iov/encoding";
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
  readonly privkey: string;
}

interface Ed25519WalletSerialization {
  readonly formatVersion: number;
  readonly id: string;
  readonly label: string | undefined;
  readonly identities: readonly IdentitySerialization[];
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

export class Ed25519Wallet implements Wallet {
  private static readonly idPool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static readonly idsPrng: PseudoRandom.Engine = PseudoRandom.engines.mt19937().autoSeed();

  private static generateId(): WalletId {
    // this can be pseudo-random, just used for internal book-keeping
    const code = PseudoRandom.string(Ed25519Wallet.idPool)(Ed25519Wallet.idsPrng, 16);
    return code as WalletId;
  }

  private static identityId(identity: Identity): IdentityId {
    const id = [identity.chainId, identity.pubkey.algo, toHex(identity.pubkey.data)].join("|");
    return id as IdentityId;
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

  private static buildIdentity(chainId: ChainId, bytes: PubkeyBytes): Identity {
    if (!chainId) {
      throw new Error("Got empty chain ID when tying to build a local identity.");
    }

    const identity: Identity = {
      chainId: chainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: bytes,
      },
    };
    return identity;
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly implementationId = "ed25519" as WalletImplementationIdString;
  public readonly id: WalletId;

  // wallet
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  // identities
  private readonly identities: Identity[];
  private readonly privkeys: Map<IdentityId, Ed25519Keypair>;
  private readonly labels: Map<IdentityId, string | undefined>;

  public constructor(data?: WalletSerializationString) {
    let id: WalletId;
    let label: string | undefined;
    const identities: Identity[] = [];
    const privkeys = new Map<IdentityId, Ed25519Keypair>();
    const labels = new Map<IdentityId, string | undefined>();

    if (data) {
      const decodedData = deserialize(data);

      // label
      label = decodedData.label;
      id = decodedData.id as WalletId;

      // identities
      for (const record of decodedData.identities) {
        const keypair = new Ed25519Keypair(
          fromHex(record.privkey),
          fromHex(record.localIdentity.pubkey.data),
        );
        if (Ed25519Wallet.algorithmFromString(record.localIdentity.pubkey.algo) !== Algorithm.Ed25519) {
          throw new Error("This keyring only supports ed25519 private keys");
        }
        const identity = Ed25519Wallet.buildIdentity(
          record.localIdentity.chainId as ChainId,
          keypair.pubkey as PubkeyBytes,
        );
        identities.push(identity);
        privkeys.set(Ed25519Wallet.identityId(identity), keypair);
        labels.set(Ed25519Wallet.identityId(identity), record.localIdentity.label);
      }
    } else {
      id = Ed25519Wallet.generateId();
    }

    this.identities = identities;
    this.privkeys = privkeys;
    this.labels = labels;
    this.labelProducer = new DefaultValueProducer<string | undefined>(label);
    this.label = new ValueAndUpdates(this.labelProducer);
    this.id = id;
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async previewIdentity(chainId: ChainId, options: unknown): Promise<Identity> {
    if (!(options instanceof Ed25519Keypair)) {
      throw new Error("Ed25519.createIdentity requires a keypair argument");
    }
    const keypair = options;
    return Ed25519Wallet.buildIdentity(chainId, keypair.pubkey as PubkeyBytes);
  }

  public async createIdentity(chainId: ChainId, options: unknown): Promise<Identity> {
    if (!(options instanceof Ed25519Keypair)) {
      throw new Error("Ed25519.createIdentity requires a keypair argument");
    }
    const keypair = options;

    const newIdentity = Ed25519Wallet.buildIdentity(chainId, keypair.pubkey as PubkeyBytes);
    const newIdentityId = Ed25519Wallet.identityId(newIdentity);

    if (this.identities.find((i) => Ed25519Wallet.identityId(i) === newIdentityId)) {
      throw new Error(
        "Identity ID collision: this happens when you try to create multiple identities with the same keypair in the same wallet.",
      );
    }

    this.privkeys.set(newIdentityId, keypair);
    this.labels.set(newIdentityId, undefined);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public setIdentityLabel(identity: Identity, label: string | undefined): void {
    const identityId = Ed25519Wallet.identityId(identity);
    const index = this.identities.findIndex((i) => Ed25519Wallet.identityId(i) === identityId);
    if (index === -1) {
      throw new Error("identity with id '" + identityId + "' not found");
    }

    this.labels.set(identityId, label);
  }

  public getIdentityLabel(identity: Identity): string | undefined {
    const identityId = Ed25519Wallet.identityId(identity);
    const index = this.identities.findIndex((i) => Ed25519Wallet.identityId(i) === identityId);
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
    const privkey = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(prehash(transactionBytes, prehashType), privkey);
    return signature as SignatureBytes;
  }

  public printableSecret(): string {
    const libsodiumPrivkeys = [...this.privkeys.values()].map((pair) => pair.toLibsodiumPrivkey());
    const hexstringsSorted = libsodiumPrivkeys
      .map((privkey) => toHex(privkey))
      .sort((a, b) => a.localeCompare(b));
    const outStrings = hexstringsSorted.map((hexstring) => (hexstring.match(/.{1,16}/g) || []).join(" "));
    return outStrings.join("; ");
  }

  public serialize(): WalletSerializationString {
    const out: Ed25519WalletSerialization = {
      formatVersion: 2,
      id: this.id,
      label: this.label.value,
      identities: this.identities.map((identity) => {
        const keypair = this.privateKeyForIdentity(identity);
        const label = this.getIdentityLabel(identity);
        return {
          localIdentity: {
            chainId: identity.chainId,
            pubkey: {
              algo: identity.pubkey.algo,
              data: toHex(identity.pubkey.data),
            },
            label: label,
          },
          privkey: toHex(keypair.privkey),
        };
      }),
    };
    return JSON.stringify(out) as WalletSerializationString;
  }

  public clone(): Ed25519Wallet {
    return new Ed25519Wallet(this.serialize());
  }

  // This throws an exception when private key is missing
  private privateKeyForIdentity(identity: Identity): Ed25519Keypair {
    const identityId = Ed25519Wallet.identityId(identity);
    const privkey = this.privkeys.get(identityId);
    if (!privkey) {
      throw new Error("No private key found for identity '" + identityId + "'");
    }
    return privkey;
  }
}
