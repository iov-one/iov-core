import { ChainId, PublicIdentity, TransactionId, UnsignedTransaction } from "@iov/bcp";
import { UserProfile } from "@iov/keycontrol";
import { MultiChainSigner } from "./multichainsigner";
export interface GetIdentitiesAuthorization {
    /**
     * Called by the signing server and lets user decide which of the
     * available identities should be revealed to the application.
     *
     * Must return a list of identities selected by the user, which is
     * the empty list in case of full request denial.
     *
     * Any error (thrown or returned as a rejected promise) from this
     * callback is sent to the RPC client as an unspecified
     * "Internal server error" and the callback author should
     * ensure this does not happen.
     */
    (reason: string, matchingIdentities: ReadonlyArray<PublicIdentity>): Promise<ReadonlyArray<PublicIdentity>>;
}
export interface SignAndPostAuthorization {
    /**
     * Called by the signing server and lets user decide if they want to
     * authorize a sign and post request.
     *
     * Must return true if the user authorized the signing and false if the
     * user rejects it.
     *
     * Any error (thrown or returned as a rejected promise) from this
     * callback is sent to the RPC client as an unspecified
     * "Internal server error" and the callback author should
     * ensure this does not happen.
     */
    (reason: string, transaction: UnsignedTransaction): Promise<boolean>;
}
export declare class SigningServerCore {
    private readonly signer;
    private readonly profile;
    private readonly authorizeGetIdentities;
    private readonly authorizeSignAndPost;
    constructor(profile: UserProfile, signer: MultiChainSigner, authorizeGetIdentities: GetIdentitiesAuthorization, authorizeSignAndPost: SignAndPostAuthorization);
    getIdentities(reason: string, chainIds: ReadonlyArray<ChainId>): Promise<ReadonlyArray<PublicIdentity>>;
    signAndPost(reason: string, transaction: UnsignedTransaction): Promise<TransactionId | undefined>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
    private allIdentities;
}
