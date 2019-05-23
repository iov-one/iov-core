import { ChainId, PrehashType, PublicIdentity, SignableBytes, SignatureBytes } from "@iov/bcp";
import { Slip10Curve } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "../wallet";
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
    private static buildIdentity;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: WalletImplementationIdString;
    readonly id: WalletId;
    private readonly secret;
    private readonly curve;
    private readonly labelProducer;
    private readonly identities;
    private readonly privkeyPaths;
    private readonly labels;
    constructor(data: WalletSerializationString);
    setLabel(label: string | undefined): void;
    previewIdentity(chainId: ChainId, options: unknown): Promise<PublicIdentity>;
    createIdentity(chainId: ChainId, options: unknown): Promise<PublicIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentityLabel(identity: PublicIdentity): string | undefined;
    getIdentities(): readonly PublicIdentity[];
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType): Promise<SignatureBytes>;
    printableSecret(): string;
    serialize(): WalletSerializationString;
    clone(): Slip10Wallet;
    private privkeyPathForIdentity;
    private privkeyForIdentity;
}
export {};
