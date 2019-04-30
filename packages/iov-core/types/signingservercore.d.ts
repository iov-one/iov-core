import { ChainId, PostTxResponse, PublicIdentity, TransactionId, UnsignedTransaction } from "@iov/bcp";
import { UserProfile } from "@iov/keycontrol";
import { ValueAndUpdates } from "@iov/stream";
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
export interface SignedAndPosted {
    readonly transaction: UnsignedTransaction;
    readonly postResponse: PostTxResponse;
}
export declare class SigningServerCore {
    readonly signedAndPosted: ValueAndUpdates<ReadonlyArray<SignedAndPosted>>;
    private readonly signer;
    private readonly profile;
    private readonly authorizeGetIdentities;
    private readonly authorizeSignAndPost;
    private readonly signedAndPostedProducer;
    constructor(profile: UserProfile, signer: MultiChainSigner, authorizeGetIdentities: GetIdentitiesAuthorization, authorizeSignAndPost: SignAndPostAuthorization);
    /**
     * Handles a identities request
     *
     * Returns the a list of identities selected by the user. In case
     * the user selected no identity or rejected the request entirely,
     * this returns an empty list.
     */
    getIdentities(reason: string, chainIds: ReadonlyArray<ChainId>): Promise<ReadonlyArray<PublicIdentity>>;
    /**
     * Handles a transaction signing request
     *
     * @returns the transaction ID in case the user authorized the signing
     * and `null` in case the user rejected.
     */
    signAndPost(reason: string, transaction: UnsignedTransaction): Promise<TransactionId | null>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
}
