import {
  // Nonce,
  PostableBytes,
  SignableBytes,
  SignableTransaction,
  TransactionIDBytes,
  TxCodec,
} from "@iov/types";

class Codec {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  public static bytesToSign(): /*
    tx: SignableTransaction,
    nonce: Nonce,
    */
  SignableBytes {
    throw new Error("Not yet implemented");
  }

  // bytesToPost includes the raw transaction appended with the various signatures
  public static bytesToPost(/*tx: SignableTransaction*/): PostableBytes {
    throw new Error("Not yet implemented");
  }

  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  public static identifier(/*tx: SignableTransaction*/): TransactionIDBytes {
    throw new Error("Not yet implemented");
  }

  // parseBytes will recover bytes from the blockchain into a format we can use
  public static parseBytes(/*bytes: PostableBytes*/): SignableTransaction {
    throw new Error("Not yet implemented");
  }
}

// we need to create a const to properly type-check the export...
export const BNSCodec: TxCodec = Codec;
