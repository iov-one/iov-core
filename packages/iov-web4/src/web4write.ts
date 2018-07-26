import Long from "long";

import { bnsCodec, Client as BnsClient } from "@iov/bns";
import { PublicIdentity, UserProfile } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
import { Address, BcpTransactionResponse, Nonce, TxCodec, UnsignedTransaction, Web4Read } from "@iov/types";

// Web4Write is currently bound to one chain.
// TODO: We can expand this later to multichain
export class Web4Write {
  public readonly profile: UserProfile;
  private readonly knownChains: Map<string, ChainConnector>;

  // initialize a write with a userProfile with secret info,
  // and a set of known chains to connect to
  // knownChains can be a map or an array of pair,
  // the key is chainId
  constructor(profile: UserProfile, knownChains: Iterable<[string, ChainConnector]>) {
    this.profile = profile;
    // shallow copy input
    this.knownChains = new Map(knownChains);
  }

  public chainIds(): ReadonlyArray<ChainId> {
    return Array.from(this.knownChains).map(([x, _]: [string, ChainConnector]) => x as ChainId);
  }

  public reader(chainId: ChainId): Web4Read {
    return this.mustGet(chainId).client;
  }

  public async addChain(connector: ChainConnector): Promise<void> {
    const chainId = await connector.client.chainId();
    if (this.knownChains.get(chainId) !== undefined) {
      throw new Error(`Chain ${chainId} is already registered`);
    }
    this.knownChains.set(chainId, connector);
  }

  public keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address {
    return this.mustGet(chainId).codec.keyToAddress(key);
  }

  // getNonce will return one value for the address, 0 if not found
  // not the ful bcp info.
  public async getNonce(chainId: ChainId, addr: Address): Promise<Nonce> {
    const nonce = await this.mustGet(chainId).client.getNonce({ address: addr });
    return nonce.data.length === 0 ? (Long.fromInt(0) as Nonce) : nonce.data[0].nonce;
  }

  // signAndCommit will sign the transaction given the signer specified in
  // the transaction and look up the private key for this public key
  // in the given keyring.
  // It finds the nonce, signs properly, and posts the tx to the blockchain.
  public async signAndCommit(tx: UnsignedTransaction, keyring: number): Promise<BcpTransactionResponse> {
    const chainId = tx.chainId;
    const { client, codec } = this.mustGet(chainId);

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

  private mustGet(chainId: ChainId): ChainConnector {
    const connector = this.knownChains.get(chainId);
    if (connector === undefined) {
      throw new Error(`No such chain: ${chainId}`);
    }
    return connector;
  }
}

export interface ChainConnector {
  readonly client: Web4Read;
  readonly codec: TxCodec;
}

export const bnsFromOrToTag = BnsClient.fromOrToTag;

// bnsConnector is a helper to connect to a bns-based chain at a given url
export const bnsConnector = async (url: string): Promise<ChainConnector> => ({
  client: await BnsClient.connect(url),
  codec: bnsCodec,
});

const withChainId = async (x: ChainConnector): Promise<[string, ChainConnector]> => [
  await x.client.chainId(),
  x,
];

export const withConnectors = (
  // tsc demands a normal array to use the spread operator, tslint complains
  // tslint:disable-next-line:readonly-array
  ...connectors: ChainConnector[]
): Promise<ReadonlyArray<[string, ChainConnector]>> => {
  return Promise.all(connectors.map(withChainId));
};
