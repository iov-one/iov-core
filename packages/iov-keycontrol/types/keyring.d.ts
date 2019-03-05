import { As } from "type-tagger";
import { ChainId, PublicIdentity } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { ReadonlyWallet, Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "./wallet";
export declare type KeyringSerializationString = string & As<"keyring-serialization">;
/**
 * Read-only information about one wallet in a keyring
 */
export interface WalletInfo {
    readonly id: WalletId;
    readonly label: string | undefined;
}
export declare type WalletDeserializer = (data: WalletSerializationString) => Wallet;
/**
 * A collection of wallets
 */
export declare class Keyring {
    static registerWalletType(implementationId: WalletImplementationIdString, deserializer: WalletDeserializer): void;
    private static readonly deserializationRegistry;
    private static deserializeWallet;
    private readonly wallets;
    constructor(data?: KeyringSerializationString);
    add(wallet: Wallet): WalletInfo;
    /**
     * Returns an array with immutable references.
     */
    getWallets(): ReadonlyArray<ReadonlyWallet>;
    /**
     * Finds a wallet and returns an immutable references.
     *
     * @returns a wallet if ID is found, undefined otherwise
     */
    getWallet(id: WalletId): ReadonlyWallet | undefined;
    /** Sets the label of the wallet with the given ID in the primary keyring  */
    setWalletLabel(walletId: WalletId, label: string | undefined): void;
    /**
     * Creates an identitiy in the wallet with the given ID in the primary keyring
     *
     * The identity is bound to one chain ID to encourage using different
     * keypairs on different chains.
     */
    createIdentity(walletId: WalletId, chainId: ChainId, options: Ed25519Keypair | ReadonlyArray<Slip10RawIndex> | number): Promise<PublicIdentity>;
    /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
    setIdentityLabel(walletId: WalletId, identity: PublicIdentity, label: string | undefined): void;
    serialize(): KeyringSerializationString;
    clone(): Keyring;
    /**
     * Finds a wallet and returns a mutable references. Thus e.g.
     * .getMutableWallet(xyz).createIdentity(...) will change the keyring.
     *
     * @returns a wallet if ID is found, undefined otherwise
     */
    private getMutableWallet;
    /**
     * Throws if any of the new identities already exists in this keyring.
     */
    private ensureNoIdentityCollision;
}
