import {
  Address,
  BcpConnection,
  ChainConnector,
  ChainId,
  Nonce,
  PostTxResponse,
  PublicIdentity,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { WalletId } from "@iov/keycontrol";

/**
 * An internal helper to pass around the tuple
 */
interface Chain {
  readonly connection: BcpConnection;
  readonly codec: TxCodec;
}

/**
 * An internal helper to establish a BCP connection
 */
async function connectChain(x: ChainConnector): Promise<Chain> {
  return {
    connection: await x.client(),
    codec: x.codec,
  };
}

/**
 * TransactionSigner is just the methods on `UserProfile` that we need in `MultiChainSigner`.
 * By only requiring this interface, we allow the use of other implementations with custom
 * logic for key derivation, etc.
 */
export interface Profile {
  readonly signTransaction: (
    id: WalletId,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;

  readonly appendSignature: (
    id: WalletId,
    identity: PublicIdentity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;
}

/*
MultiChainSigner handles all private key material, as well as connections to multiple chains.
It must have a codec along with each chain to properly encode the transactions,
and calculate chain-specific addresses from public keys,
even if bcp-proxy will handle translating all reads.
*/
export class MultiChainSigner {
  private readonly knownChains: Map<string, Chain>;
  private readonly profile: Profile;

  // initialize a write with a userProfile with secret info,
  // chains we want to connect to added with addChain (to keep async out of constructor)
  constructor(profile: Profile) {
    this.profile = profile;
    this.knownChains = new Map<string, Chain>();
  }

  public chainIds(): ReadonlyArray<ChainId> {
    return Array.from(this.knownChains.keys()).map(key => key as ChainId);
  }

  public connection(chainId: ChainId): BcpConnection {
    return this.getChain(chainId).connection;
  }

  /**
   * Connects to a chain using the provided connector.
   *
   * @returns an object of chain information, currently just a BcpConnection
   */
  public async addChain(connector: ChainConnector): Promise<{ readonly connection: BcpConnection }> {
    const chain = await connectChain(connector);
    const chainId = chain.connection.chainId();
    if (connector.expectedChainId && connector.expectedChainId !== chainId) {
      throw new Error(
        `Connected chain ID does not match. Got ${chainId} but expected ${connector.expectedChainId}.`,
      );
    }
    if (this.knownChains.has(chainId)) {
      throw new Error(`Chain ${chainId} is already registered`);
    }
    this.knownChains.set(chainId, chain);
    return {
      connection: chain.connection,
    };
  }

  /**
   * Calculate an address in a blockchain-specific way
   */
  public identityToAddress(identity: PublicIdentity): Address {
    return this.getChain(identity.chainId).codec.identityToAddress(identity);
  }

  /**
   * Queries the nonce, signs the transaction and posts it to the blockchain.
   *
   * The transaction signer is determined by the transaction content. A lookup for
   * the private key for the signer in the given wallet ID is done automatically.
   */
  public async signAndPost(tx: UnsignedTransaction, walletId: WalletId): Promise<PostTxResponse> {
    const { connection, codec } = this.getChain(tx.creator.chainId);

    const nonce = await connection.getNonce({ pubkey: tx.creator.pubkey });

    const signed = await this.profile.signTransaction(walletId, tx.creator, tx, codec, nonce);
    const txBytes = codec.bytesToPost(signed);
    const post = await connection.postTx(txBytes);
    return post;
  }

  /**
   * Throws for unknown chain ID
   */
  private getChain(chainId: ChainId): Chain {
    const connector = this.knownChains.get(chainId);
    if (connector === undefined) {
      throw new Error(`No such chain: ${chainId}`);
    }
    return connector;
  }
}
