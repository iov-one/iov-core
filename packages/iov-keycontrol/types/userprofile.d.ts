import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";
import { Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { Keyring } from "./keyring";
import { LocalIdentity, PublicIdentity, Wallet, WalletId } from "./wallet";
import { Ed25519Wallet } from "./wallets";
export interface UserProfileOptions {
    readonly createdAt: ReadonlyDate;
    readonly keyring: Keyring;
}
/**
 * Read-only information about one wallet in a keyring/user profile
 */
export interface WalletInfo {
    readonly id: WalletId;
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
    readonly createdAt: ReadonlyDate;
    readonly locked: ValueAndUpdates<boolean>;
    readonly wallets: ValueAndUpdates<ReadonlyArray<WalletInfo>>;
    private keyring;
    private readonly lockedProducer;
    private readonly walletsProducer;
    constructor(options?: UserProfileOptions);
    storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<void>;
    lock(): void;
    /**
     * Adds a copy of the wallet to the primary keyring
     */
    addWallet(wallet: Wallet): WalletInfo;
    /** Sets the label of the wallet with the given ID in the primary keyring  */
    setWalletLabel(id: WalletId, label: string | undefined): void;
    /** Creates an identitiy in the wallet with the given ID in the primary keyring */
    createIdentity(id: WalletId, options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number): Promise<LocalIdentity>;
    /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
    setIdentityLabel(id: WalletId, identity: PublicIdentity, label: string | undefined): void;
    /** Get identities of the wallet with the given ID in the primary keyring  */
    getIdentities(id: WalletId): ReadonlyArray<LocalIdentity>;
    signTransaction(id: WalletId, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    appendSignature(id: WalletId, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
    /**
     * Exposes the secret data of a wallet in a printable format for
     * backup purposes.
     *
     * The format depends on the implementation and may change over time,
     * so do not try to parse the result or make any kind of assumtions on
     * how the result looks like.
     */
    printableSecret(id: WalletId): string;
    /** Throws if wallet does not exist in primary keyring */
    private findWalletInPrimaryKeyring;
    private walletInfos;
}
