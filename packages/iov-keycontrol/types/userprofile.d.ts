import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";
import { Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { ValueAndUpdates } from "@iov/stream";
import { Keyring, KeyringEntry, KeyringEntryId, LocalIdentity, PublicIdentity } from "./keyring";
export interface UserProfileOptions {
    readonly createdAt: ReadonlyDate;
    readonly keyring: Keyring;
}
/**
 * Read-only information about one wallet in a keyring/user profile
 */
export interface WalletInfo {
    readonly id: KeyringEntryId;
    readonly label: string | undefined;
}
/**
 * All calls must go though the UserProfile. A newly created UserProfile
 * is unlocked until lock() is called, which removes access to private key
 * material. Once locked, a UserProfile cannot be unlocked anymore since the
 * corresponding storage is not available anymore. Instead, re-create the
 * UserProfile via the UserProfileController to get an unlocked UserProfile.
 */
export declare class UserProfile {
    static loadFrom(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<UserProfile>;
    private static makeNonce;
    readonly createdAt: ReadonlyDate;
    readonly locked: ValueAndUpdates<boolean>;
    readonly wallets: ValueAndUpdates<ReadonlyArray<WalletInfo>>;
    private keyring;
    private readonly lockedProducer;
    private readonly walletsProducer;
    constructor(options?: UserProfileOptions);
    storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<void>;
    lock(): void;
    addEntry(entry: KeyringEntry): void;
    setEntryLabel(id: KeyringEntryId, label: string | undefined): void;
    createIdentity(id: KeyringEntryId, options?: any): Promise<LocalIdentity>;
    setIdentityLabel(id: KeyringEntryId, identity: PublicIdentity, label: string | undefined): void;
    getIdentities(id: KeyringEntryId): ReadonlyArray<LocalIdentity>;
    signTransaction(id: KeyringEntryId, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    appendSignature(id: KeyringEntryId, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    private entryInPrimaryKeyring;
    private walletInfos;
}
