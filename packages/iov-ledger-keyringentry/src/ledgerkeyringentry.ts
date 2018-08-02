import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  DefaultValueProducer,
  KeyringEntry,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  PublicIdentity,
  ValueAndUpdates,
} from "@iov/keycontrol";
import {
  connectToFirstLedger,
  getPublicKeyWithIndex,
  signTransactionWithIndex,
  Transport,
} from "@iov/ledger-bns";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

export class LedgerKeyringEntry implements KeyringEntry {
  private static identityId(identity: PublicIdentity): string {
    return identity.pubkey.algo + "|" + Encoding.toHex(identity.pubkey.data);
  }

  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign = new ValueAndUpdates(new DefaultValueProducer(true));
  public readonly implementationId = "ledger" as KeyringEntryImplementationIdString;

  private readonly labelProducer: DefaultValueProducer<string | undefined>;
  // tslint:disable-next-line:readonly-array
  private readonly identities: LocalIdentity[];

  // the `i` from https://github.com/iov-one/web4/blob/master/docs/KeyBase.md#simple-addresses
  private readonly simpleAddressIndices: Map<string, number>;

  constructor() {
    this.labelProducer = new DefaultValueProducer<string | undefined>(undefined);
    this.label = new ValueAndUpdates(this.labelProducer);
    this.identities = [];
    this.simpleAddressIndices = new Map();
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    const nextIndex = this.identities.length;
    const transport: Transport = connectToFirstLedger();

    const pubkey = await getPublicKeyWithIndex(transport, nextIndex);
    const newIdentity: LocalIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: pubkey as PublicKeyBytes,
      },
      label: undefined,
    };

    this.identities.push(newIdentity);

    const newIdentityId = LedgerKeyringEntry.identityId(newIdentity);
    this.simpleAddressIndices.set(newIdentityId, nextIndex);

    return newIdentity;
  }

  public setIdentityLabel(identity: PublicIdentity, label: string | undefined): void {
    const identityId = LedgerKeyringEntry.identityId(identity);
    const index = this.identities.findIndex(i => LedgerKeyringEntry.identityId(i) === identityId);
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
    const transport: Transport = connectToFirstLedger();

    const signature = await signTransactionWithIndex(transport, transactionBytes, simpleAddressIndex);
    return signature as SignatureBytes;
  }

  public serialize(): KeyringEntrySerializationString {
    // TODO: implement
    return "" as KeyringEntrySerializationString;
  }

  public clone(): KeyringEntry {
    // TODO: implement
    return new LedgerKeyringEntry();
  }

  // This throws an exception when private key is missing
  private simpleAddressIndex(identity: PublicIdentity): number {
    const identityId = LedgerKeyringEntry.identityId(identity);
    const out = this.simpleAddressIndices.get(identityId);
    if (out === undefined) {
      throw new Error("No address index found for identity '" + identityId + "'");
    }
    return out;
  }
}
