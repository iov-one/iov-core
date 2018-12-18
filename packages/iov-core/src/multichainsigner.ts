import { ChainId, PublicKeyBundle } from "@iov/base-types";
import {
  Address,
  BcpConnection,
  ChainConnector,
  Nonce,
  PostTxResponse,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";
import { PublicIdentity, UserProfile, WalletId } from "@iov/keycontrol";

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

/*
MultiChainSigner handles all private key material, as well as connections to multiple chains.
It must have a codec along with each chain to properly encode the transactions,
and calculate chain-specific addresses from public keys,
even if bcp-proxy will handle translating all reads.
*/
export class MultiChainSigner {
  public readonly profile: UserProfile;
  private readonly knownChains: Map<string, Chain>;

  // initialize a write with a userProfile with secret info,
  // chains we want to connect to added with addChain (to keep async out of constructor)
  constructor(profile: UserProfile) {
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

  public keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address {
    return this.getChain(chainId).codec.keyToAddress(key);
  }

  /**
   * Returns one value for the address, 0 if not found.
   *
   * This is done automatically when you use signAndPost().
   *
   * @deprecated will be removed in 0.11. See https://github.com/iov-one/iov-core/issues/620
   */
  public async getNonce(chainId: ChainId, addr: Address): Promise<Nonce> {
    const nonce = await this.getChain(chainId).connection.getNonce({ address: addr });
    return nonce.data.length === 0 ? (new Int53(0) as Nonce) : nonce.data[0];
  }

  /**
   * Queries the nonce, signs the transaction and posts it to the blockchain.
   *
   * The transaction signer is determined by the transaction content. A lookup for
   * the private key for the signer in the given wallet ID is done automatically.
   */
  public async signAndPost(tx: UnsignedTransaction, walletId: WalletId): Promise<PostTxResponse> {
    const { connection, codec } = this.getChain(tx.chainId);

    const nonceResponse = await connection.getNonce({ pubkey: tx.signer });
    const nonce = nonceResponse.data.length === 0 ? (new Int53(0) as Nonce) : nonceResponse.data[0];

    const signingIdentity: PublicIdentity = {
      pubkey: tx.signer,
      // TODO: add chainId (https://github.com/iov-one/iov-core/issues/621)
    };
    const signed = await this.profile.signTransaction(walletId, signingIdentity, tx, codec, nonce);
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
