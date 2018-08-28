import { Nonce, PrehashType, SignableBytes, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
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
    readonly getLabel: () => ValueAndUpdates<string | undefined>;
    readonly getIdentities: () => ValueAndUpdates<ReadonlyArray<T>>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
    readonly createTransactionSignature: (identity: PublicIdentity, transactionBytes: SignableBytes, prehash: PrehashType, chainId: ChainId) => Promise<SignatureBytes>;
}
export declare enum KeyringType {
    Slip0010Compatible = "Slip0010",
    Mixed = "Mixed"
}
export interface SlipKeyringEntry extends KeyringEntry<LocalHDIdentity> {
    readonly kind: KeyringType.Slip0010Compatible;
    readonly createBip44Identity: (algo: Algorithm, coinType: Slip0010RawIndex, account: Slip0010RawIndex, change: Slip0010RawIndex, addressIndex?: Slip0010RawIndex) => Promise<LocalHDIdentity>;
    readonly createBip32Identity: (algo: Algorithm, path: ReadonlyArray<Slip0010RawIndex>) => Promise<LocalHDIdentity>;
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
export interface UserProfile {
    readonly addEntry: (entry: KeyringEntry) => void;
    readonly getEntries: () => ValueAndUpdates<ReadonlyArray<KeyringEntry>>;
    readonly signTransaction: (identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
    readonly appendSignature: (identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
}
