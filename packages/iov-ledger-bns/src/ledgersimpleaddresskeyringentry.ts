// tslint:disable:readonly-array
import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  DefaultValueProducer,
  Keyring,
  KeyringEntry,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  PublicIdentity,
  ValueAndUpdates,
} from "@iov/keycontrol";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { getPublicKeyWithIndex, signTransactionWithIndex } from "./app";
import { connectToFirstLedger } from "./exchange";

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
  readonly simpleAddressIndex: number;
}

interface LedgerKeyringEntrySerialization {
  readonly label: string | undefined;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

export class LedgerSimpleAddressKeyringEntry implements KeyringEntry {
  public static readonly implementationId = "ledger-simpleaddress" as KeyringEntryImplementationIdString;

  /**
   * A convenience function to register this entry type with the global Keyring class
   */
  public static registerWithKeyring(): void {
    const implId = LedgerSimpleAddressKeyringEntry.implementationId;
    Keyring.registerEntryType(implId, (data: KeyringEntrySerializationString) => {
      return new LedgerSimpleAddressKeyringEntry(data);
    });
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
        throw new Error("Unknown algorithm string found");
    }
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign: ValueAndUpdates<boolean>;
  public readonly implementationId = LedgerSimpleAddressKeyringEntry.implementationId;

  private readonly labelProducer: DefaultValueProducer<string | undefined>;
  private readonly canSignProducer: DefaultValueProducer<boolean>;
  private readonly identities: LocalIdentity[];

  // the `i` from https://github.com/iov-one/iov-core/blob/master/docs/KeyBase.md#simple-addresses
  private readonly simpleAddressIndices: Map<string, number>;

  constructor(data?: KeyringEntrySerializationString) {
    this.canSignProducer = new DefaultValueProducer(true);
    this.canSign = new ValueAndUpdates(this.canSignProducer);

    // tslint:disable-next-line:no-let
    let label: string | undefined;
    const identities: LocalIdentity[] = [];
    const simpleAddressIndices = new Map<string, number>();

    if (data) {
      const decodedData: LedgerKeyringEntrySerialization = JSON.parse(data);

      // label
      label = decodedData.label;

      // identities
      for (const record of decodedData.identities) {
        const identity: LocalIdentity = {
          pubkey: {
            algo: LedgerSimpleAddressKeyringEntry.algorithmFromString(record.localIdentity.pubkey.algo),
            data: Encoding.fromHex(record.localIdentity.pubkey.data) as PublicKeyBytes,
          },
          label: record.localIdentity.label,
        };
        const identityId = LedgerSimpleAddressKeyringEntry.identityId(identity);
        identities.push(identity);
        simpleAddressIndices.set(identityId, record.simpleAddressIndex);
      }
    }

    this.labelProducer = new DefaultValueProducer<string | undefined>(label);
    this.label = new ValueAndUpdates(this.labelProducer);
    this.identities = identities;
    this.simpleAddressIndices = simpleAddressIndices;
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    const nextIndex = this.identities.length;
    const transport = await connectToFirstLedger();

    const pubkey = await getPublicKeyWithIndex(transport, nextIndex);
    const newIdentity: LocalIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: pubkey as PublicKeyBytes,
      },
      label: undefined,
    };

    this.identities.push(newIdentity);

    const newIdentityId = LedgerSimpleAddressKeyringEntry.identityId(newIdentity);
    this.simpleAddressIndices.set(newIdentityId, nextIndex);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = LedgerSimpleAddressKeyringEntry.identityId(identity);
    const index = this.identities.findIndex(
      i => LedgerSimpleAddressKeyringEntry.identityId(i) === identityId,
    );
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
    if (prehashType !== PrehashType.Sha512) {
      throw new Error("Only prehash typer sha512 is supported on the Ledger");
    }

    const simpleAddressIndex = this.simpleAddressIndex(identity);
    const transport = await connectToFirstLedger();

    const signature = await signTransactionWithIndex(transport, transactionBytes, simpleAddressIndex);
    return signature as SignatureBytes;
  }

  public serialize(): KeyringEntrySerializationString {
    const out: LedgerKeyringEntrySerialization = {
      label: this.label.value,
      identities: this.identities.map(identity => {
        const simpleAddressIndex = this.simpleAddressIndex(identity);
        return {
          localIdentity: {
            pubkey: {
              algo: identity.pubkey.algo,
              data: Encoding.toHex(identity.pubkey.data),
            },
            label: identity.label,
          },
          simpleAddressIndex: simpleAddressIndex,
        };
      }),
    };
    return JSON.stringify(out) as KeyringEntrySerializationString;
  }

  public clone(): KeyringEntry {
    return new LedgerSimpleAddressKeyringEntry(this.serialize());
  }

  // This throws an exception when address index is missing
  private simpleAddressIndex(identity: PublicIdentity): number {
    const identityId = LedgerSimpleAddressKeyringEntry.identityId(identity);
    const out = this.simpleAddressIndices.get(identityId);
    if (out === undefined) {
      throw new Error("No address index found for identity '" + identityId + "'");
    }
    return out;
  }
}
