import PseudoRandom from "random-js";

import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Ed25519, Ed25519Keypair, Random } from "@iov/crypto";
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
  readonly privkey: string;
}

interface Ed25519KeyringEntrySerialization {
  readonly id: string;
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

export class Ed25519KeyringEntry implements KeyringEntry {
  private static readonly idsPrng: PseudoRandom.Engine = PseudoRandom.engines.mt19937().autoSeed();

  private static identityId(identity: PublicIdentity): LocalIdentityId {
    const id = identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
    return id as LocalIdentityId;
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
  public readonly implementationId = "ed25519" as KeyringEntryImplementationIdString;
  // id represents the state of the Keyring...
  // since there is no seed (like slip10), and no default state, we just create
  // an arbitrary string upon construction, which is persisted through clone and serialization
  // this doesn't change as keys are added to the KeyringEntry
  public readonly id: KeyringEntryId;

  private readonly identities: LocalIdentity[];
  private readonly privkeys: Map<string, Ed25519Keypair>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data?: KeyringEntrySerializationString) {
    // tslint:disable-next-line:no-let
    let id: KeyringEntryId;
    // tslint:disable-next-line:no-let
    let label: string | undefined;
    const identities: LocalIdentity[] = [];
    const privkeys = new Map<string, Ed25519Keypair>();

    if (data) {
      const decodedData: Ed25519KeyringEntrySerialization = JSON.parse(data);

      // label
      label = decodedData.label;
      id = decodedData.id as KeyringEntryId;

      // identities
      for (const record of decodedData.identities) {
        const keypair = new Ed25519Keypair(
          Encoding.fromHex(record.privkey),
          Encoding.fromHex(record.localIdentity.pubkey.data),
        );
        if (Ed25519KeyringEntry.algorithmFromString(record.localIdentity.pubkey.algo) !== Algorithm.ED25519) {
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
      id = this.randomId();
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

  public async createIdentity(): Promise<LocalIdentity> {
    const seed = await Random.getBytes(32);
    const keypair = await Ed25519.makeKeypair(seed);

    const newIdentity = this.buildLocalIdentity(keypair.pubkey as PublicKeyBytes, undefined);
    this.privkeys.set(newIdentity.id, keypair);
    this.identities.push(newIdentity);
    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = Ed25519KeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => Ed25519KeyringEntry.identityId(i) === identityId);
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

  public serialize(): KeyringEntrySerializationString {
    const out: Ed25519KeyringEntrySerialization = {
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
    return JSON.stringify(out) as KeyringEntrySerializationString;
  }

  public clone(): Ed25519KeyringEntry {
    return new Ed25519KeyringEntry(this.serialize());
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

  private buildLocalIdentity(bytes: PublicKeyBytes, label: string | undefined): LocalIdentity {
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: bytes,
    };
    return {
      pubkey,
      label,
      id: Ed25519KeyringEntry.identityId({ pubkey }),
    };
  }

  private randomId(): KeyringEntryId {
    // this can be pseudo-random, just used for internal book-keeping
    const code = PseudoRandom.string()(Ed25519KeyringEntry.idsPrng, 10);
    return `ed25519:${code}` as KeyringEntryId;
  }
}
