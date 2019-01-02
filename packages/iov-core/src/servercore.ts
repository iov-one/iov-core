import {
  ChainId,
  PublicIdentity,
  publicIdentityEquals,
  TransactionId,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { UserProfile, WalletId } from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";

export class ServerCore {
  private readonly signer: MultiChainSigner;
  private readonly profile: UserProfile;

  constructor(profile: UserProfile, signer: MultiChainSigner) {
    this.signer = signer;
    this.profile = profile;
  }

  public async getIdentities(
    _: string,
    chainIds: ReadonlyArray<ChainId>,
  ): Promise<ReadonlyArray<PublicIdentity>> {
    const matchingIdentities = this.allIdentities().filter(identity => {
      return chainIds.some(chainId => identity.chainId === chainId);
    });

    // TODO: ask user for permission and allow selection of identities

    return matchingIdentities;
  }

  public async signAndPost(_: string, transaction: UnsignedTransaction): Promise<TransactionId> {
    const transactionCreator: PublicIdentity = {
      chainId: transaction.chainId,
      pubkey: transaction.signer,
    };

    let walletId: WalletId;
    const wallets = this.profile.wallets.value.filter(wallet => {
      const firstMatchIndex = this.profile.getIdentities(wallet.id).findIndex(identity => {
        return publicIdentityEquals(identity, transactionCreator);
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

    // TODO: ask user for permission

    const response = await this.signer.signAndPost(transaction, walletId);
    return response.transactionId;
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
