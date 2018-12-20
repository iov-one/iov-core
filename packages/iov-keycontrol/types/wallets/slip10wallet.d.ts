import { ChainId, PrehashType, SignableBytes, SignatureBytes } from "@iov/bcp-types";
import { Slip10Curve } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { LocalIdentity, PublicIdentity, Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "../wallet";
interface Slip10WalletConstructor {
    new (data: WalletSerializationString): Slip10Wallet;
}
export declare class Slip10Wallet implements Wallet {
    static fromEntropyWithCurve(curve: Slip10Curve, bip39Entropy: Uint8Array, cls?: Slip10WalletConstructor): Slip10Wallet;
    static fromMnemonicWithCurve(curve: Slip10Curve, mnemonicString: string, cls?: Slip10WalletConstructor): Slip10Wallet;
    private static readonly idPool;
    private static readonly idsPrng;
    private static generateId;
    private static identityId;
    private static algorithmFromCurve;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: WalletImplementationIdString;
    readonly id: WalletId;
    private readonly secret;
    private readonly curve;
    private readonly identities;
    private readonly privkeyPaths;
    private readonly labelProducer;
    constructor(data: WalletSerializationString);
    setLabel(label: string | undefined): void;
    createIdentity(options: unknown): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    printableSecret(): string;
    serialize(): WalletSerializationString;
    clone(): Slip10Wallet;
    private privkeyPathForIdentity;
    private privkeyForIdentity;
    private buildLocalIdentity;
}
export {};
