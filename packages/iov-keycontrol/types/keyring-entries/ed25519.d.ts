import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Ed25519Keypair } from "@iov/crypto";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
import { KeyringEntry, KeyringEntryId, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity } from "../keyring";
import { ValueAndUpdates } from "../valueandupdates";
export declare class Ed25519KeyringEntry implements KeyringEntry {
    private static readonly idsPrng;
    private static generateId;
    private static identityId;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly id: KeyringEntryId;
    private readonly identities;
    private readonly privkeys;
    private readonly labelProducer;
    constructor(data?: KeyringEntrySerializationString);
    setLabel(label: string | undefined): void;
    createIdentity(keypair?: Ed25519Keypair): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): Ed25519KeyringEntry;
    private privateKeyForIdentity;
    private buildLocalIdentity;
}
