import Long from "long";

import {
  Address,
  BcpConnection,
  BcpTransactionResponse,
  Nonce,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { bnsCodec, Client as BnsClient } from "@iov/bns";
import { KeyringEntryId, PublicIdentity, UserProfile } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";

/**
 * An internal helper to pass around the tuple
 */
interface ChainConnection {
  readonly client: BcpConnection;
  readonly codec: TxCodec;
}

/**
 * An internal helper to establish a BCP connection
 */
async function connectChain(x: ChainConnector): Promise<ChainConnection> {
  return {
    client: await x.client(),
    codec: x.codec,
  };
}

/*
IovWriter handles all private key material, as well as connections to multiple chains.
It must have a codec along with each chain to properly encode the transactions,
and calculate chain-specific addresses from public keys,
even if bcp-proxy will handle translating all reads.
*/
export class IovWriter {
  public readonly profile: UserProfile;
  private readonly knownChains: Map<string, ChainConnection>;

  // initialize a write with a userProfile with secret info,
  // chains we want to connect to added with addChain (to keep async out of constructor)
  constructor(profile: UserProfile) {
    this.profile = profile;
    this.knownChains = new Map<string, ChainConnection>();
  }

  public chainIds(): ReadonlyArray<ChainId> {
    return Array.from(this.knownChains.keys()).map(key => key as ChainId);
  }

  public reader(chainId: ChainId): BcpConnection {
    return this.getChain(chainId).client;
  }

  public async addChain(connector: ChainConnector): Promise<void> {
    const connection = await connectChain(connector);
    const chainId = connection.client.chainId();
    if (this.knownChains.has(chainId)) {
      throw new Error(`Chain ${chainId} is already registered`);
    }
    this.knownChains.set(chainId, connection);
  }

  public keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address {
    return this.getChain(chainId).codec.keyToAddress(key);
  }

  // getNonce will return one value for the address, 0 if not found
  // not the ful bcp info.
  public async getNonce(chainId: ChainId, addr: Address): Promise<Nonce> {
    const nonce = await this.getChain(chainId).client.getNonce({ address: addr });
    return nonce.data.length === 0 ? (Long.fromInt(0) as Nonce) : nonce.data[0].nonce;
  }

  // signAndCommit will sign the transaction given the signer specified in
  // the transaction and look up the private key for this public key
  // in the given keyring.
  // It finds the nonce, signs properly, and posts the tx to the blockchain.
  public async signAndCommit(
    tx: UnsignedTransaction,
    keyring: number | KeyringEntryId,
  ): Promise<BcpTransactionResponse> {
    const chainId = tx.chainId;
    const { client, codec } = this.getChain(chainId);

    const signer = tx.signer;
    const signerAddr = this.keyToAddress(chainId, signer);
    const nonce = await this.getNonce(chainId, signerAddr);

    // We have the publickey bundle from the transaction, but need
    // a PublicIdentity to sign. Same information content, so I fake it.
    // TODO: Simon, a cleaner solution would be nicer. How?
    const fakeId: PublicIdentity = { pubkey: signer };
    const signed = await this.profile.signTransaction(keyring, fakeId, tx, codec, nonce);
    const txBytes = codec.bytesToPost(signed);
    const post = await client.postTx(txBytes);
    return post;
  }

  /**
   * Throws for unknown chain ID
   */
  private getChain(chainId: ChainId): ChainConnection {
    const connector = this.knownChains.get(chainId);
    if (connector === undefined) {
      throw new Error(`No such chain: ${chainId}`);
    }
    return connector;
  }
}

export interface ChainConnector {
  readonly client: () => Promise<BcpConnection>;
  readonly codec: TxCodec;
}

// bnsConnector is a helper to connect to a bns-based chain at a given url
export const bnsConnector = (url: string): ChainConnector => ({
  client: () => BnsClient.connect(url),
  codec: bnsCodec,
});
