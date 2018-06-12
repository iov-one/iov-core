import {
  FullSignature,
  FungibleToken,
  // Nonce,
  PostableBytes,
  SendTx,
  SignableBytes,
  SignableTransaction,
  TransactionIDBytes,
  TxCodec,
} from "@iov/types";
import codec from "./codec";

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
  public static bytesToPost(tx: SignableTransaction): PostableBytes {
    switch (tx.transaction.kind) {
      case "send":
        const obj = buildSendTx(tx.transaction, tx.signatures);
        return codec.app.Tx.encode(obj).finish() as PostableBytes;
    }
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

function buildSendTx(/*tx: SendTx, sigs: ReadonlyArray<FullSignature>*/): codec.app.ITx {
  throw new Error("not implemented");
}

function encodeSig(sig: FullSignature): codec.sigs.IStdSignature {
  throw new Error("not implemented");
}

function encodeToken(token: FungibleToken): codec.x.ICoin {
  return codec.x.Coin.create({
    whole: token.whole,
    fractional: token.fractional,
    ticker: token.tokenTicker,
  });
}

/*
function buildSendTx(Tx, sender, rcpt, amount, currency, chainID) {
  rcpt = Buffer.from(rcpt, 'hex');  // may be bytes or a hex string
  let msg = weave.cash.SendMsg.create({
      src: sender.addressBytes(),
      dest: rcpt,
      amount: weave.x.Coin.create({whole: amount, ticker: currency})
  });
  let tx = Tx.create({
      sendMsg: msg
  });
  return signTx(Tx, tx, sender, chainID);
}
*/
