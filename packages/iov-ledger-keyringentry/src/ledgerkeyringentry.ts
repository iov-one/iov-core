import { PrehashType, SignableBytes } from "@iov/bcp-types";
import {
  DefaultValueProducer,
  KeyringEntry,
  KeyringEntryImplementationIdString,
  KeyringEntrySerializationString,
  LocalIdentity,
  PublicIdentity,
  ValueAndUpdates,
} from "@iov/keycontrol";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

export class LedgerKeyringEntry implements KeyringEntry {
  public readonly label: ValueAndUpdates<string | undefined>;
  public readonly canSign = new ValueAndUpdates(new DefaultValueProducer(true));
  public readonly implementationId = "ledger" as KeyringEntryImplementationIdString;

  private readonly labelProducer: DefaultValueProducer<string | undefined>;

  constructor() {
    this.labelProducer = new DefaultValueProducer<string | undefined>(undefined);
    this.label = new ValueAndUpdates(this.labelProducer);
  }

  public setLabel(label: string | undefined): void {
    this.labelProducer.update(label);
  }

  public async createIdentity(): Promise<LocalIdentity> {
    const newIdentity: LocalIdentity = {
      pubkey: {
        algo: Algorithm.ED25519,
        data: new Uint8Array([]) as PublicKeyBytes,
      },
      label: "Yet another address",
    };
    return newIdentity;
  }

  public setIdentityLabel(_1: PublicIdentity, _2: string | undefined): void {
    // TODO: implement
  }

  public getIdentities(): ReadonlyArray<LocalIdentity> {
    // TODO: implement
    return [];
  }

  public async createTransactionSignature(
    _1: PublicIdentity,
    _2: SignableBytes,
    _3: PrehashType,
    _4: ChainId,
  ): Promise<SignatureBytes> {
    // TODO: implement
    return new Uint8Array([0x11]) as SignatureBytes;
  }

  public serialize(): KeyringEntrySerializationString {
    // TODO: implement
    return "" as KeyringEntrySerializationString;
  }

  public clone(): KeyringEntry {
    // TODO: implement
    return new LedgerKeyringEntry();
  }
}
