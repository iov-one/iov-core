import { As } from "type-tagger";
import { ChainId, PublicIdentity } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "./wallet";
export declare type KeyringSerializationString = string & As<"keyring-serialization">;
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
    add(wallet: Wallet): void;
    /**
     * this returns an array with mutable element references. Thus e.g.
     * .getWallets().createIdentity() will change the keyring.
     */
    getWallets(): ReadonlyArray<Wallet>;
    /**
     * Finds a wallet and returns a mutable references. Thus e.g.
     * .getWallet(xyz).createIdentity() will change the keyring.
     *
     * @returns a wallet if ID is found, undefined otherwise
     */
    getWallet(id: WalletId): Wallet | undefined;
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
}
