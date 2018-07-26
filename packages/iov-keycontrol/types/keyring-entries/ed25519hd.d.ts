import { Slip0010RawIndex } from "@iov/crypto";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
import { PrehashType, SignableBytes } from "@iov/types";
import { KeyringEntry, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity } from "../keyring";
import { ValueAndUpdates } from "../valueandupdates";
export declare class Ed25519HdKeyringEntry implements KeyringEntry {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519HdKeyringEntry;
    private static identityId;
    private static algorithmFromString;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    private readonly secret;
    private readonly identities;
    private readonly privkeyPaths;
    private readonly labelProducer;
    constructor(data: KeyringEntrySerializationString);
    setLabel(label: string | undefined): void;
    createIdentity(): Promise<LocalIdentity>;
    createIdentityWithPath(path: ReadonlyArray<Slip0010RawIndex>): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): Ed25519HdKeyringEntry;
    private privkeyPathForIdentity;
    private privkeyForIdentity;
}
