import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";
import { Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { Keyring, KeyringEntry, LocalIdentity, PublicIdentity } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";
export interface UserProfileOptions {
    readonly createdAt: ReadonlyDate;
    readonly keyring: Keyring;
}
export declare class UserProfile {
    static loadFrom(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<UserProfile>;
    private static makeNonce;
    private static labels;
    readonly createdAt: ReadonlyDate;
    readonly locked: ValueAndUpdates<boolean>;
    readonly entriesCount: ValueAndUpdates<number>;
    readonly entryLabels: ValueAndUpdates<ReadonlyArray<string | undefined>>;
    private keyring;
    private readonly lockedProducer;
    private readonly entriesCountProducer;
    private readonly entryLabelsProducer;
    constructor(options?: UserProfileOptions);
    storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<void>;
    lock(): void;
    addEntry(entry: KeyringEntry): void;
    setEntryLabel(n: number, label: string | undefined): void;
    createIdentity(n: number): Promise<LocalIdentity>;
    setIdentityLabel(n: number, identity: PublicIdentity, label: string | undefined): void;
    getIdentities(n: number): ReadonlyArray<LocalIdentity>;
    signTransaction(n: number, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    appendSignature(n: number, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    private entryInPrimaryKeyring;
}
