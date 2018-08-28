import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Slip0010RawIndex } from "@iov/crypto";
import { Algorithm, ChainId, PrivateKeyBytes, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";
import { KeyringEntryImplementationIdString, PublicIdentity } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";
export interface LocalIdentity extends PublicIdentity {
    readonly label?: string;
}
export interface LocalHDIdentity extends LocalIdentity {
    readonly path: ReadonlyArray<Slip0010RawIndex>;
}
export interface KeyringEntry<T extends PublicIdentity = LocalIdentity> {
    readonly setLabel: (label: string | undefined) => void;
    readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;
    readonly getIdentities: () => ValueAndUpdates<ReadonlyArray<T>>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
    readonly createTransactionSignature: (identity: PublicIdentity, transactionBytes: SignableBytes, prehash: PrehashType, chainId: ChainId) => Promise<SignatureBytes>;
}
export declare const enum KeyringType {
    HD = "HD",
    Mixed = "Mixed"
}
export interface HDKeyringEntry extends KeyringEntry<LocalHDIdentity> {
    readonly kind: KeyringType.HD;
    readonly createIdentityWithPathPrefix: (algo: Algorithm, path: ReadonlyArray<Slip0010RawIndex>, autoincrement: boolean) => Promise<LocalHDIdentity>;
}
export interface Keypair {
    readonly algo: Algorithm;
    readonly public: PublicKeyBytes;
    readonly private: PrivateKeyBytes;
}
export interface MixedKeyringEntry extends KeyringEntry<LocalIdentity> {
    readonly kind: KeyringType.Mixed;
    readonly createRandomIdentity: (algo: Algorithm) => Promise<LocalIdentity>;
    readonly importIdentity: (keypair: Keypair) => Promise<LocalIdentity>;
}
