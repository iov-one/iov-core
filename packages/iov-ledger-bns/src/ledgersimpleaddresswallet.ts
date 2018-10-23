// tslint:disable:readonly-array
import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  Keyring,
  LocalIdentity,
  LocalIdentityId,
  PublicIdentity,
  Wallet,
  WalletId,
  WalletImplementationIdString,
  WalletSerializationString,
} from "@iov/keycontrol";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { getPublicKeyWithIndex, signTransactionWithIndex } from "./app";
import { connectToFirstLedger } from "./exchange";
import { LedgerState, StateTracker } from "./statetracker";

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
  readonly id: string;
  readonly identities: ReadonlyArray<IdentitySerialization>;
}

// this is the id of any LedgerSimpleAddressWallet until it connects with the app
const defaultId = "uninitialized" as WalletId;

export class LedgerSimpleAddressWallet implements Wallet {
  public static readonly implementationId = "ledger-simpleaddress" as WalletImplementationIdString;

  /**
   * A convenience function to register this entry type with the global Keyring class
   */
  public static registerWithKeyring(): void {
    const implId = LedgerSimpleAddressWallet.implementationId;
    Keyring.registerEntryType(implId, (data: WalletSerializationString) => {
      return new LedgerSimpleAddressWallet(data);
    });
  }

  private static identityId(identity: PublicIdentity): LocalIdentityId {
    const id = identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
    return id as LocalIdentityId;
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign: ValueAndUpdates<boolean>;
  public readonly implementationId = LedgerSimpleAddressWallet.implementationId;
  public readonly deviceState: ValueAndUpdates<LedgerState>;
  // id will be set the first time the keyring connects to a given device, "uninitialized" until then
  // tslint:disable-next-line:readonly-keyword
  public id: WalletId;

  private readonly deviceTracker = new StateTracker();
  private readonly labelProducer: DefaultValueProducer<string | undefined>;
  private readonly canSignProducer: DefaultValueProducer<boolean>;
  private readonly identities: LocalIdentity[];

  // the `i` from https://github.com/iov-one/iov-core/blob/master/docs/KeyBase.md#simple-addresses
  private readonly simpleAddressIndices: Map<string, number>;

  constructor(data?: WalletSerializationString) {
    this.canSignProducer = new DefaultValueProducer(false);
    this.canSign = new ValueAndUpdates(this.canSignProducer);

    this.deviceTracker.state.updates.subscribe({
      next: (value: LedgerState) => {
        this.canSignProducer.update(value === LedgerState.IovAppOpen);
      },
    });
    this.deviceState = this.deviceTracker.state;

    let label: string | undefined;
    let id = defaultId;
    const identities: LocalIdentity[] = [];
    const simpleAddressIndices = new Map<string, number>();

    if (data) {
      const decodedData: LedgerKeyringEntrySerialization = JSON.parse(data);

      // label
      label = decodedData.label;
      id = decodedData.id as WalletId;

      // identities
      for (const record of decodedData.identities) {
        const identity = this.buildLocalIdentity(
          Encoding.fromHex(record.localIdentity.pubkey.data) as PublicKeyBytes,
          record.localIdentity.label,
        );
        identities.push(identity);
        simpleAddressIndices.set(identity.id, record.simpleAddressIndex);
      }
    }

    this.labelProducer = new DefaultValueProducer<string | undefined>(label);
    this.label = new ValueAndUpdates(this.labelProducer);
    this.identities = identities;
    this.simpleAddressIndices = simpleAddressIndices;
    this.id = id;
  }

  /**
   * Turn on tracking USB devices.
   *
   * This is must be called before every hardware interaction,
   * i.e. createIdentity() and createTransactionSignature() and to
   * use the canSign and deviceState properties.
   */
  public startDeviceTracking(): void {
    this.deviceTracker.start();
  }

  /**
   * Turn off tracking USB devices.
   *
   * Use this to save resources when LedgerSimpleAddressWallet is not used anymore.
   * With device tracking turned off, canSign and deviceState are not updated anymore.
   */
  public stopDeviceTracking(): void {
    this.deviceTracker.stop();
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(options: unknown): Promise<LocalIdentity> {
    if (typeof options !== "number") {
      throw new Error("Expected numeric argument");
    }
    const index = options;

    if (!this.deviceTracker.running) {
      throw new Error("Device tracking off. Did you call startDeviceTracking()?");
    }

    await this.deviceState.waitFor(LedgerState.IovAppOpen);

    const transport = await connectToFirstLedger();

    const pubkey = await getPublicKeyWithIndex(transport, index);
    const newIdentity = this.buildLocalIdentity(pubkey as PublicKeyBytes, undefined);

    if (this.identities.find(i => i.id === newIdentity.id)) {
      throw new Error(
        "Identity Index collision: this happens when you try to create multiple identities with the same index in the same entry.",
      );
    }

    this.identities.push(newIdentity);
    this.simpleAddressIndices.set(newIdentity.id, index);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = LedgerSimpleAddressWallet.identityId(identity);
    const index = this.identities.findIndex(i => LedgerSimpleAddressWallet.identityId(i) === identityId);
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

    if (!this.deviceTracker.running) {
      throw new Error("Device tracking off. Did you call startDeviceTracking()?");
    }

    await this.deviceState.waitFor(LedgerState.IovAppOpen);

    const simpleAddressIndex = this.simpleAddressIndex(identity);
    const transport = await connectToFirstLedger();

    const signature = await signTransactionWithIndex(transport, transactionBytes, simpleAddressIndex);
    return signature as SignatureBytes;
  }

  public serialize(): WalletSerializationString {
    const out: LedgerKeyringEntrySerialization = {
      label: this.label.value,
      id: this.id,
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
    return JSON.stringify(out) as WalletSerializationString;
  }

  public clone(): Wallet {
    return new LedgerSimpleAddressWallet(this.serialize());
  }

  // This throws an exception when address index is missing
  private simpleAddressIndex(identity: PublicIdentity): number {
    const identityId = LedgerSimpleAddressWallet.identityId(identity);
    const out = this.simpleAddressIndices.get(identityId);
    if (out === undefined) {
      throw new Error("No address index found for identity '" + identityId + "'");
    }
    return out;
  }

  private buildLocalIdentity(bytes: PublicKeyBytes, label: string | undefined): LocalIdentity {
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519, // hardcoded until we support more curves in the ledger app
      data: bytes,
    };
    return {
      pubkey,
      label,
      id: LedgerSimpleAddressWallet.identityId({ pubkey }),
    };
  }
}
