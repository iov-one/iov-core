import {
  Address,
  BlockchainConnection,
  ChainConnector,
  ChainId,
  Identity,
  Nonce,
  PostTxResponse,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";

/**
 * An internal helper to pass around the tuple
 */
interface Chain {
  readonly connection: BlockchainConnection;
  readonly codec: TxCodec;
}

/**
 * An internal helper to establish a BCP connection
 */
async function connectChain(x: ChainConnector): Promise<Chain> {
  return {
    connection: await x.establishConnection(),
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
    identity: Identity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;

  readonly appendSignature: (
    identity: Identity,
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
  public constructor(profile: Profile) {
    this.profile = profile;
    this.knownChains = new Map<string, Chain>();
  }

  public chainIds(): readonly ChainId[] {
    return Array.from(this.knownChains.keys()).map(key => key as ChainId);
  }

  public connection(chainId: ChainId): BlockchainConnection {
    return this.getChain(chainId).connection;
  }

  /**
   * Connects to a chain using the provided connector.
   *
   * @returns an object of chain information, currently just a BlockchainConnection
   */
  public async addChain(connector: ChainConnector): Promise<{ readonly connection: BlockchainConnection }> {
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
  public identityToAddress(identity: Identity): Address {
    return this.getChain(identity.chainId).codec.identityToAddress(identity);
  }

  /**
   * A chain-dependent validation of address
   */
  public isValidAddress(chainId: ChainId, address: string): boolean {
    return this.getChain(chainId).codec.isValidAddress(address);
  }

  /**
   * Queries the nonce, signs the transaction and posts it to the blockchain.
   */
  public async signAndPost(identity: Identity, transaction: UnsignedTransaction): Promise<PostTxResponse> {
    const { connection, codec } = this.getChain(identity.chainId);
    const nonce = await connection.getNonce({ pubkey: identity.pubkey });

    const signed = await this.profile.signTransaction(identity, transaction, codec, nonce);
    const txBytes = codec.bytesToPost(signed);
    const post = await connection.postTx(txBytes);
    return post;
  }

  /**
   * Call this to free ressources when signer is not needed anymore.
   * This disconnects all chains and other housekeeping if necessary.
   */
  public shutdown(): void {
    for (const chainId of this.chainIds()) {
      this.connection(chainId).disconnect();
    }
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
