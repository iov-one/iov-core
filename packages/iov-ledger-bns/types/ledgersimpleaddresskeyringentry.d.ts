import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { KeyringEntry, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity, ValueAndUpdates } from "@iov/keycontrol";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
export declare class LedgerSimpleAddressKeyringEntry implements KeyringEntry {
    static readonly implementationId: KeyringEntryImplementationIdString;
    static registerWithKeyring(): void;
    private static identityId;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    private readonly labelProducer;
    private readonly canSignProducer;
    private readonly deviceTracker;
    private readonly identities;
    private readonly simpleAddressIndices;
    constructor(data?: KeyringEntrySerializationString);
    setLabel(label: string | undefined): void;
    createIdentity(): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): KeyringEntry;
    private simpleAddressIndex;
}
