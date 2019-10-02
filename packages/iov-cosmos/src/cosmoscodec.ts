import {
  Address,
  ChainId,
  Identity,
  Nonce,
  PostableBytes,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";

import { isValidAddress, pubkeyToAddress } from "./address";

export class CosmosCodec implements TxCodec {
  public bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob {
    throw new Error("not implemented");
  }

  public bytesToPost(signed: SignedTransaction): PostableBytes {
    throw new Error("not implemented");
  }

  public identifier(signed: SignedTransaction): TransactionId {
    throw new Error("not implemented");
  }

  public parseBytes(bytes: PostableBytes, chainId: ChainId): SignedTransaction {
    throw new Error("not implemented");
  }

  public identityToAddress(identity: Identity): Address {
    return pubkeyToAddress(identity.pubkey);
  }

  public isValidAddress(address: string): boolean {
    return isValidAddress(address);
  }
}

export const cosmosCodec = new CosmosCodec();
