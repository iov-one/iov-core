import { As } from "type-tagger";
import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { ChainId, PublicKeyBundle, SignatureBytes } from "@iov/tendermint-types";
import { ValueAndUpdates } from "./valueandupdates";
export declare type KeyringEntrySerializationString = string & As<"keyring-entry-serialization">;
export declare type KeyringSerializationString = string & As<"keyring-serialization">;
export declare type KeyringEntryImplementationIdString = string & As<"keyring-entry-implementation-id">;
export interface PublicIdentity {
    readonly pubkey: PublicKeyBundle;
}
export interface LocalIdentity extends PublicIdentity {
    readonly label?: string;
}
export interface KeyringEntrySerialization {
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly data: KeyringEntrySerializationString;
}
export interface KeyringSerialization {
    readonly entries: KeyringEntrySerialization[];
}
export declare class Keyring {
    private static deserializeKeyringEntry;
    private readonly entries;
    constructor(data?: KeyringSerializationString);
    add(entry: KeyringEntry): void;
    getEntries(): ReadonlyArray<KeyringEntry>;
    serialize(): KeyringSerializationString;
    clone(): Keyring;
}
export interface KeyringEntry {
    readonly label: ValueAndUpdates<string | undefined>;
    readonly setLabel: (label: string | undefined) => void;
    readonly createIdentity: () => Promise<LocalIdentity>;
    readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;
    readonly getIdentities: () => ReadonlyArray<LocalIdentity>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly createTransactionSignature: (identity: PublicIdentity, transactionBytes: SignableBytes, prehash: PrehashType, chainId: ChainId) => Promise<SignatureBytes>;
    readonly serialize: () => KeyringEntrySerializationString;
    readonly clone: () => KeyringEntry;
}
