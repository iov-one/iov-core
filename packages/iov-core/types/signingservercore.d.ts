import { ChainId, PublicIdentity, TransactionId, UnsignedTransaction } from "@iov/bcp-types";
import { UserProfile } from "@iov/keycontrol";
import { MultiChainSigner } from "./multichainsigner";
export declare class SigningServerCore {
    private readonly signer;
    private readonly profile;
    constructor(profile: UserProfile, signer: MultiChainSigner);
    getIdentities(_: string, chainIds: ReadonlyArray<ChainId>): Promise<ReadonlyArray<PublicIdentity>>;
    signAndPost(_: string, transaction: UnsignedTransaction): Promise<TransactionId>;
    private allIdentities;
}
