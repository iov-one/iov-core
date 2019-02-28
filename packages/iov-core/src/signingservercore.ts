import { ChainId, PublicIdentity, publicIdentityEquals, TransactionId, UnsignedTransaction } from "@iov/bcp";
import { UserProfile, WalletId } from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";

export interface GetIdentitiesAuthorization {
  /**
   * Called by the signing server and lets user decide which of the
   * available identities should be revealed to the application.
   *
   * Must return a list of identities selected by the user, which is
   * the empty list in case of full request denial.
   *
   * Any error thrown in this callback is sent to the RPC client as an
   * unspecified "Internal server error" and the callback author should
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
   * Any error thrown in this callback is sent to the RPC client as an
   * unspecified "Internal server error" and the callback author should
   * ensure this does not happen.
   */
  (reason: string, transaction: UnsignedTransaction): Promise<boolean>;
}

export class SigningServerCore {
  private readonly signer: MultiChainSigner;
  private readonly profile: UserProfile;
  private readonly authorizeGetIdentities: GetIdentitiesAuthorization;
  private readonly authorizeSignAndPost: SignAndPostAuthorization;

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
  }

  public async getIdentities(
    reason: string,
    chainIds: ReadonlyArray<ChainId>,
  ): Promise<ReadonlyArray<PublicIdentity>> {
    const matchingIdentities = this.allIdentities().filter(identity => {
      return chainIds.some(chainId => identity.chainId === chainId);
    });

    const authorizedIdentities = this.authorizeGetIdentities(reason, matchingIdentities);

    return authorizedIdentities;
  }

  public async signAndPost(
    reason: string,
    transaction: UnsignedTransaction,
  ): Promise<TransactionId | undefined> {
    let walletId: WalletId;
    const wallets = this.profile.wallets.value.filter(wallet => {
      const firstMatchIndex = this.profile.getIdentities(wallet.id).findIndex(identity => {
        return publicIdentityEquals(identity, transaction.creator);
      });
      return firstMatchIndex !== -1;
    });
    switch (wallets.length) {
      case 0:
        throw new Error("No wallet found to sign this transation");
      case 1:
        walletId = wallets[0].id;
        break;
      default:
        throw new Error("More than one wallets contain the identity to sign this transaction");
    }

    if (this.authorizeSignAndPost(reason, transaction)) {
      const response = await this.signer.signAndPost(transaction, walletId);
      return response.transactionId;
    } else {
      return undefined;
    }
  }

  /**
   * Call this to free ressources when server is not needed anymore
   */
  public shutdown(): void {
    this.signer.shutdown();
  }

  private allIdentities(): ReadonlyArray<PublicIdentity> {
    // tslint:disable-next-line:readonly-array
    const out: PublicIdentity[] = [];
    for (const wallet of this.profile.wallets.value) {
      const localIdentities = this.profile.getIdentities(wallet.id);
      out.push(
        ...localIdentities.map(local => ({
          chainId: local.chainId,
          pubkey: local.pubkey,
        })),
      );
    }
    return out;
  }
}
