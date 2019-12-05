import { ChainId, Identity, PostTxResponse, TransactionId, UnsignedTransaction } from "@iov/bcp";
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
   *
   * @param reason An explanation why the autorization is requested. This is created by the website and shown to the user.
   * @param matchingIdentities The identities that match the requested chain IDs.
   * @param meta An object that is passed by reference from request handlers into the callback.
   */
  (reason: string, matchingIdentities: readonly Identity[], meta?: any): Promise<readonly Identity[]>;
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
   *
   * @param reason An explanation why the autorization is requested. This is created by the website and shown to the user.
   * @param transaction The transaction to be signed.
   * @param meta An object that is passed by reference from request handlers into the callback.
   */
  (reason: string, transaction: UnsignedTransaction, meta?: any): Promise<boolean>;
}

export interface SignedAndPosted {
  readonly transaction: UnsignedTransaction;
  readonly postResponse: PostTxResponse;
}

export class SigningServerCore {
  public readonly signedAndPosted: ValueAndUpdates<readonly SignedAndPosted[]>;

  private readonly signer: MultiChainSigner;
  private readonly profile: UserProfile;
  private readonly authorizeGetIdentities: GetIdentitiesAuthorization;
  private readonly authorizeSignAndPost: SignAndPostAuthorization;
  private readonly signedAndPostedProducer = new DefaultValueProducer<readonly SignedAndPosted[]>([]);
  private readonly logError: (error: any) => void;

  public constructor(
    profile: UserProfile,
    signer: MultiChainSigner,
    authorizeGetIdentities: GetIdentitiesAuthorization,
    authorizeSignAndPost: SignAndPostAuthorization,
    logError?: (error: any) => void,
  ) {
    this.signer = signer;
    this.profile = profile;
    this.authorizeGetIdentities = authorizeGetIdentities;
    this.authorizeSignAndPost = authorizeSignAndPost;
    this.logError = logError || (() => 0);

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
    chainIds: readonly ChainId[],
    meta?: any,
  ): Promise<readonly Identity[]> {
    const matchingIdentities = this.profile.getAllIdentities().filter(identity => {
      return chainIds.some(chainId => identity.chainId === chainId);
    });

    let authorizedIdentities: readonly Identity[];
    try {
      authorizedIdentities = await this.authorizeGetIdentities(reason, matchingIdentities, meta);
    } catch (error) {
      this.logError(error);
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
  public async signAndPost(
    identity: Identity,
    reason: string,
    transaction: UnsignedTransaction,
    meta?: any,
  ): Promise<TransactionId | null> {
    let authorized: boolean;
    try {
      authorized = await this.authorizeSignAndPost(reason, transaction, meta);
    } catch (error) {
      this.logError(error);
      // don't expose callback error details over the server
      throw new Error("Internal server error");
    }

    if (authorized) {
      const response = await this.signer.signAndPost(identity, transaction);
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
