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
      throw new Error(`Connected to chain id ${chainId} but expected ${connector.expectedChainId}`);
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
   * This is done automatically when you use signAndCommit().
   *
   * @todo This is not tested. Decide if we need to expose this method.
   */
  public async getNonce(chainId: ChainId, addr: Address): Promise<Nonce> {
    const nonce = await this.getChain(chainId).connection.getNonce({ address: addr });
    return nonce.data.length === 0 ? (new Int53(0) as Nonce) : nonce.data[0];
  }

  // signAndCommit will sign the transaction given the signer specified in
  // the transaction and look up the private key for this public key
  // in the given keyring.
  // It finds the nonce, signs properly, and posts the tx to the blockchain.
  public async signAndCommit(tx: UnsignedTransaction, walletId: WalletId): Promise<PostTxResponse> {
    const chainId = tx.chainId;
    const { connection, codec } = this.getChain(chainId);

    const nonceResponse = await this.getChain(chainId).connection.getNonce({ pubkey: tx.signer });
    const nonce = nonceResponse.data.length === 0 ? (new Int53(0) as Nonce) : nonceResponse.data[0];

    // We have the publickey bundle from the transaction, but need
    // a PublicIdentity to sign. Same information content, so I fake it.
    // TODO: Simon, a cleaner solution would be nicer. How?
    const fakeId: PublicIdentity = { pubkey: tx.signer };
    const signed = await this.profile.signTransaction(walletId, fakeId, tx, codec, nonce);
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
