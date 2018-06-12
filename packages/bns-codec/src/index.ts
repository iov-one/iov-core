import {
  Algorithm,
  FullSignature,
  FungibleToken,
  PostableBytes,
  PublicKeyBundle,
  SendTx,
  SignableBytes,
  SignableTransaction,
  SignatureBytes,
  TransactionIDBytes,
  // TxCodec,
} from "@iov/types";
import codec from "./codec";
import { keyToAddress } from "./util";

export class Codec {
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
  public static async bytesToPost(tx: SignableTransaction): Promise<PostableBytes> {
    switch (tx.transaction.kind) {
      case "send":
        const obj = await buildSendTx(tx.transaction, tx.signatures);
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
// export const BNSCodec: TxCodec = Codec;

async function buildSendTx(tx: SendTx, sigs: ReadonlyArray<FullSignature>): Promise<codec.app.ITx> {
  const msg = {
    sendMsg: codec.cash.SendMsg.create({
      src: await keyToAddress(tx.signer),
      dest: await keyToAddress(tx.recipient),
      amount: encodeToken(tx.amount),
    }),
  };
  return extendTx(msg, tx.fee, sigs);
}

async function extendTx(
  msg: codec.app.ITx,
  fee: FungibleToken,
  sigs: ReadonlyArray<FullSignature>,
): Promise<codec.app.ITx> {
  return codec.app.Tx.create({
    ...msg,
    fees: { fees: encodeToken(fee) },
    signatures: sigs.map(encodeFullSig),
  });
}

function encodeToken(token: FungibleToken): codec.x.ICoin {
  return codec.x.Coin.create({
    whole: token.whole,
    fractional: token.fractional,
    ticker: token.tokenTicker,
  });
}

function encodeFullSig(sig: FullSignature): codec.sigs.IStdSignature {
  return codec.sigs.StdSignature.create({
    sequence: sig.nonce,
    pubKey: encodePubKey(sig.publicKey),
    signature: encodeSignature(sig.publicKey.algo, sig.signature),
  });
}

function encodePubKey(publicKey: PublicKeyBundle): codec.crypto.IPublicKey {
  switch (publicKey.algo) {
    case Algorithm.ED25519:
      return { ed25519: publicKey.data };
    default:
      throw new Error("unsupported algorithm: " + publicKey.algo);
  }
}

// encodeSignature needs the PublicKeyBundle to determine the type
function encodeSignature(algo: Algorithm, sigs: SignatureBytes): codec.crypto.ISignature {
  switch (algo) {
    case Algorithm.ED25519:
      return { ed25519: sigs };
    default:
      throw new Error("unsupported algorithm: " + algo);
  }
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
