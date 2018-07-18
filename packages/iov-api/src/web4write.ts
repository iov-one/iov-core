import Long from "long";

import { PublicIdentity, UserProfile } from "@iov/keycontrol";
import {
  AddressBytes,
  BcpTransactionResponse,
  Nonce,
  PublicKeyBundle,
  TxCodec,
  UnsignedTransaction,
  Web4Read,
} from "@iov/types";

// Web4Write is currently bound to one chain.
// TODO: We can expand this later to multichain
export class Web4Write {
  public readonly profile: UserProfile;
  private readonly client: Web4Read;
  private readonly codec: TxCodec;

  constructor(profile: UserProfile, client: Web4Read, codec: TxCodec) {
    this.profile = profile;
    this.client = client;
    this.codec = codec;
  }

  // getNonce will return one value for the address, 0 if not found
  // not the ful bcp info.
  public async getNonce(addr: AddressBytes): Promise<Nonce> {
    const data = (await this.client.getNonce({ address: addr })).data;
    return data.length === 0 ? (Long.fromInt(0) as Nonce) : data[0].nonce;
  }

  public keyToAddress(key: PublicKeyBundle): AddressBytes {
    return this.codec.keyToAddress(key);
  }

  public async sendTx(tx: UnsignedTransaction, keyring: number): Promise<BcpTransactionResponse> {
    const chainId = await this.client.chainId();
    if (chainId !== tx.chainId) {
      // TODO: we can switch between implementations here
      throw new Error("Trying to write on a different chain");
    }
    const signer = tx.signer;
    const nonce = await this.getNonce(this.keyToAddress(signer));

    // We have the publickey bundle from the transaction, but need
    // a PublicIdentity to sign. Same information content, so I fake it.
    // TODO: Simon, a cleaner solution would be nicer. How?
    const fakeId: PublicIdentity = { pubkey: signer };
    const signed = await this.profile.signTransaction(keyring, fakeId, tx, this.codec, nonce);
    const txBytes = this.codec.bytesToPost(signed);
    const post = await this.client.postTx(txBytes);
    return post;
  }
}
