import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { KeyringEntry, KeyringEntryId, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity } from "@iov/keycontrol";
import { ValueAndUpdates } from "@iov/stream";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
import { LedgerState } from "./statetracker";
export declare class LedgerSimpleAddressKeyringEntry implements KeyringEntry {
    static readonly implementationId: KeyringEntryImplementationIdString;
    /**
     * A convenience function to register this entry type with the global Keyring class
     */
    static registerWithKeyring(): void;
    private static identityId;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly deviceState: ValueAndUpdates<LedgerState>;
    id: KeyringEntryId;
    private readonly deviceTracker;
    private readonly labelProducer;
    private readonly canSignProducer;
    private readonly identities;
    private readonly simpleAddressIndices;
    constructor(data?: KeyringEntrySerializationString);
    /**
     * Turn on tracking USB devices.
     *
     * This is must be called before every hardware interaction,
     * i.e. createIdentity() and createTransactionSignature() and to
     * use the canSign and deviceState properties.
     */
    startDeviceTracking(): void;
    /**
     * Turn off tracking USB devices.
     *
     * Use this to save resources when LedgerSimpleAddressKeyringEntry is not used anymore.
     * With device tracking turned off, canSign and deviceState are not updated anymore.
     */
    stopDeviceTracking(): void;
    setLabel(label: string | undefined): void;
    createIdentity(index: number): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): KeyringEntry;
    private simpleAddressIndex;
    private buildLocalIdentity;
}
