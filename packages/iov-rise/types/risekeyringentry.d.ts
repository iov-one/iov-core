import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { KeyringEntry, KeyringEntryId, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity, ValueAndUpdates } from "@iov/keycontrol";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
export declare class RISEKeyringEntry implements KeyringEntry {
    static readonly implementationId: KeyringEntryImplementationIdString;
    /**
     * A convenience function to register this entry type with the global Keyring class
     */
    static registerWithKeyring(): void;
    private static readonly idsPrng;
    private static generateId;
    private static identityId;
    private static algorithmFromString;
    private static buildLocalIdentity;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly id: KeyringEntryId;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    private readonly labelProducer;
    private readonly identities;
    private readonly passphrases;
    constructor(data?: KeyringEntrySerializationString);
    getIdentities(): ReadonlyArray<LocalIdentity>;
    setLabel(label: string | undefined): void;
    createIdentity(passphrase?: string): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    serialize(): KeyringEntrySerializationString;
    clone(): KeyringEntry;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    private passphraseForIdentity;
}
