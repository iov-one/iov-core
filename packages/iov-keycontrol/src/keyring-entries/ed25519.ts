import { Ed25519, Ed25519Keypair, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PrehashType, PublicKeyBytes, SignableBytes, SignatureBytes } from "@iov/types";

import {
  KeyringEntry,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  PublicIdentity,
} from "../keyring";
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
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

export class Ed25519KeyringEntry implements KeyringEntry {
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
  public readonly implementationId = "ed25519" as KeyringEntryImplementationIdString;

  private readonly identities: LocalIdentity[];
  private readonly privkeys: Map<string, Ed25519Keypair>;
  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor(data?: KeyringEntrySerializationString) {
    // tslint:disable-next-line:no-let
    let label: string | undefined;
    const identities: LocalIdentity[] = [];
    const privkeys = new Map<string, Ed25519Keypair>();

    if (data) {
      const decodedData: Ed25519KeyringEntrySerialization = JSON.parse(data);

      // label
      label = decodedData.label;

      // identities
      for (const record of decodedData.identities) {
        const keypair = new Ed25519Keypair(
          Encoding.fromHex(record.privkey),
          Encoding.fromHex(record.localIdentity.pubkey.data),
        );
        const identity: LocalIdentity = {
          pubkey: {
            algo: Ed25519KeyringEntry.algorithmFromString(record.localIdentity.pubkey.algo),
            data: keypair.pubkey as PublicKeyBytes,
          },
          label: record.localIdentity.label,
        };
        const identityId = Ed25519KeyringEntry.identityId(identity);
        identities.push(identity);
        privkeys.set(identityId, keypair);
      }
    }

    this.identities = identities;
    this.privkeys = privkeys;
    this.labelProducer = new DefaultValueProducer<string | undefined>(label);
    this.label = new ValueAndUpdates(this.labelProducer);
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    const seed = await Random.getBytes(32);
    const keypair = await Ed25519.makeKeypair(seed);

    const newIdentity: LocalIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: keypair.pubkey as PublicKeyBytes,
      },
      label: undefined,
    };
    const identityId = Ed25519KeyringEntry.identityId(newIdentity);
    this.privkeys.set(identityId, keypair);
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
    prehash: PrehashType,
    _: ChainId,
  ): Promise<SignatureBytes> {
    // TODO: use
    // tslint:disable-next-line:no-unused-expression
    prehash as any;

    const privkey = this.privateKeyForIdentity(identity);
    const signature = await Ed25519.createSignature(tx, privkey);
    return signature as SignatureBytes;
  }

  public serialize(): KeyringEntrySerializationString {
    const out: Ed25519KeyringEntrySerialization = {
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
}
