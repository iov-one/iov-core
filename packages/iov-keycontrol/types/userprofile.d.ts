import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";
import { Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { Keyring, KeyringEntry, KeyringEntryId, LocalIdentity, PublicIdentity } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";
export interface UserProfileOptions {
    readonly createdAt: ReadonlyDate;
    readonly keyring: Keyring;
}
export declare class UserProfile {
    static loadFrom(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<UserProfile>;
    private static makeNonce;
    private static labels;
    private static ids;
    readonly createdAt: ReadonlyDate;
    readonly locked: ValueAndUpdates<boolean>;
    readonly entriesCount: ValueAndUpdates<number>;
    readonly entryLabels: ValueAndUpdates<ReadonlyArray<string | undefined>>;
    readonly entryIds: ValueAndUpdates<ReadonlyArray<KeyringEntryId>>;
    private keyring;
    private readonly lockedProducer;
    private readonly entriesCountProducer;
    private readonly entryLabelsProducer;
    private readonly entryIdsProducer;
    constructor(options?: UserProfileOptions);
    storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<void>;
    lock(): void;
    addEntry(entry: KeyringEntry): void;
    setEntryLabel(id: number | KeyringEntryId, label: string | undefined): void;
    createIdentity(id: number | KeyringEntryId): Promise<LocalIdentity>;
    setIdentityLabel(id: number | KeyringEntryId, identity: PublicIdentity, label: string | undefined): void;
    getIdentities(id: number | KeyringEntryId): ReadonlyArray<LocalIdentity>;
    signTransaction(id: number | KeyringEntryId, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    appendSignature(id: number | KeyringEntryId, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    private entryInPrimaryKeyring;
}
