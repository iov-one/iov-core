import { ChainId, PostTxResponse, PublicIdentity, TransactionId, UnsignedTransaction } from "@iov/bcp";
import { UserProfile } from "@iov/keycontrol";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

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

export class SigningServerCore {
  public readonly signedAndPosted: ValueAndUpdates<ReadonlyArray<SignedAndPosted>>;

  private readonly signer: MultiChainSigner;
  private readonly profile: UserProfile;
  private readonly authorizeGetIdentities: GetIdentitiesAuthorization;
  private readonly authorizeSignAndPost: SignAndPostAuthorization;
  private readonly signedAndPostedProducer = new DefaultValueProducer<ReadonlyArray<SignedAndPosted>>([]);

  constructor(
    profile: UserProfile,
    signer: MultiChainSigner,
    authorizeGetIdentities: GetIdentitiesAuthorization,
    authorizeSignAndPost: SignAndPostAuthorization,
  ) {
    this.signer = signer;
    this.profile = profile;
    this.authorizeGetIdentities = authorizeGetIdentities;
    this.authorizeSignAndPost = authorizeSignAndPost;

    this.signedAndPosted = new ValueAndUpdates(this.signedAndPostedProducer);
  }

  /**
   * Handles a identities request
   *
   * Returns the a list of identities selected by the user. In case
   * the user selected no identity or rejected the request entirely,
   * this returns an empty list.
   */
  public async getIdentities(
    reason: string,
    chainIds: ReadonlyArray<ChainId>,
  ): Promise<ReadonlyArray<PublicIdentity>> {
    const matchingIdentities = this.profile.getAllIdentities().filter(identity => {
      return chainIds.some(chainId => identity.chainId === chainId);
    });

    let authorizedIdentities: ReadonlyArray<PublicIdentity>;
    try {
      authorizedIdentities = await this.authorizeGetIdentities(reason, matchingIdentities);
    } catch (error) {
      // don't expose callback error details over the server
      throw new Error("Internal server error");
    }

    return authorizedIdentities;
  }

  /**
   * Handles a transaction signing request
   *
   * @returns the transaction ID in case the user authorized the signing
   * and `null` in case the user rejected.
   */
  public async signAndPost(reason: string, transaction: UnsignedTransaction): Promise<TransactionId | null> {
    let authorized: boolean;
    try {
      authorized = await this.authorizeSignAndPost(reason, transaction);
    } catch (error) {
      // don't expose callback error details over the server
      throw new Error("Internal server error");
    }

    if (authorized) {
      const response = await this.signer.signAndPost(transaction);
      const signedAndPosted: SignedAndPosted = {
        transaction: transaction,
        postResponse: response,
      };
      this.signedAndPostedProducer.update([...this.signedAndPostedProducer.value, signedAndPosted]);
      return response.transactionId;
    } else {
      return null;
    }
  }

  /**
   * Call this to free ressources when server is not needed anymore
   */
  public shutdown(): void {
    this.signer.shutdown();
  }
}
