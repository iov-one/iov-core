import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { KeyringEntry, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity, ValueAndUpdates } from "@iov/keycontrol";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
export declare class LedgerKeyringEntry implements KeyringEntry {
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    private readonly labelProducer;
    constructor();
    setLabel(label: string | undefined): void;
    createIdentity(): Promise<LocalIdentity>;
    setIdentityLabel(_1: PublicIdentity, _2: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(_1: PublicIdentity, _2: SignableBytes, _3: PrehashType, _4: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): KeyringEntry;
}
