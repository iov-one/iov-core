import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Slip10Curve, Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
import { KeyringEntry, KeyringEntryId, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity } from "../keyring";
interface Slip10WalletConstructor {
    new (data: KeyringEntrySerializationString): Slip10Wallet;
}
export declare class Slip10Wallet implements KeyringEntry {
    static fromEntropyWithCurve(curve: Slip10Curve, bip39Entropy: Uint8Array, cls?: Slip10WalletConstructor): Slip10Wallet;
    static fromMnemonicWithCurve(curve: Slip10Curve, mnemonicString: string, cls?: Slip10WalletConstructor): Slip10Wallet;
    private static readonly idsPrng;
    private static generateId;
    private static identityId;
    private static algorithmFromCurve;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly id: KeyringEntryId;
    private readonly secret;
    private readonly curve;
    private readonly identities;
    private readonly privkeyPaths;
    private readonly labelProducer;
    constructor(data: KeyringEntrySerializationString);
    setLabel(label: string | undefined): void;
    createIdentity(_?: any): Promise<LocalIdentity>;
    createIdentityWithPath(path: ReadonlyArray<Slip10RawIndex>): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): Slip10Wallet;
    private privkeyPathForIdentity;
    private privkeyForIdentity;
    private buildLocalIdentity;
}
export {};
