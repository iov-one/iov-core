import { As } from "type-tagger";
import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { ChainId, PublicKeyBundle, SignatureBytes } from "@iov/tendermint-types";
import { Ed25519Wallet } from "./wallets";
export declare type LocalIdentityId = string & As<"local-identity-id">;
/** a public key we can identify with on a blockchain */
export interface PublicIdentity {
    readonly pubkey: PublicKeyBundle;
}
/**
 * a local version of a PublicIdentity that contains
 * additional local information
 */
export interface LocalIdentity extends PublicIdentity {
    readonly id: LocalIdentityId;
    readonly label?: string;
}
export declare type WalletId = string & As<"wallet-id">;
export declare type WalletImplementationIdString = string & As<"wallet-implementation-id">;
export declare type WalletSerializationString = string & As<"wallet-serialization">;
/**
 * A is a generic interface for managing a set of keys and signing
 * data with them.
 *
 * A Wallet is responsible for storing private keys securely and
 * signing with them. Wallet can be implemented in software or as
 * a bridge to a hardware wallet.
 */
export interface Wallet {
    readonly label: ValueAndUpdates<string | undefined>;
    readonly id: WalletId;
    readonly setLabel: (label: string | undefined) => void;
    readonly createIdentity: (options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number) => Promise<LocalIdentity>;
    readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;
    readonly getIdentities: () => ReadonlyArray<LocalIdentity>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: WalletImplementationIdString;
    readonly createTransactionSignature: (identity: PublicIdentity, transactionBytes: SignableBytes, prehash: PrehashType, chainId: ChainId) => Promise<SignatureBytes>;
    readonly serialize: () => WalletSerializationString;
    readonly clone: () => Wallet;
}
