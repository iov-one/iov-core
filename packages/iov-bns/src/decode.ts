import {
  Algorithm,
  ChainId,
  FullSignature,
  newNonEmptyArray,
  Nonce,
  PubkeyBundle,
  PubkeyBytes,
  SignatureBytes,
  SignedTransaction,
  UnsignedTransaction,
} from "@iov/bcp";
import * as Long from "long";

import { decodeMsg } from "./decodemsg";
import { decodeAmount } from "./decodeobjects";
import { asIntegerNumber, decodeNumericId, ensure } from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import { MultisignatureTx, PrivkeyBundle, PrivkeyBytes } from "./types";
import { addressPrefix, encodeBnsAddress } from "./util";

export function decodeNonce(sequence: Long | number | null | undefined): Nonce {
  return asIntegerNumber(sequence) as Nonce;
}

export function decodeUserData(userData: codecImpl.sigs.IUserData): { readonly nonce: Nonce } {
  return { nonce: decodeNonce(userData.sequence) };
}

export function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PubkeyBundle {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: publicKey.ed25519 as PubkeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
}

export function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivkeyBundle {
  if (privateKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: privateKey.ed25519 as PrivkeyBytes,
    };
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export function decodeSignature(signature: codecImpl.crypto.ISignature): SignatureBytes {
  if (signature.ed25519) {
    return signature.ed25519 as SignatureBytes;
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export function decodeFullSig(sig: codecImpl.sigs.IStdSignature): FullSignature {
  return {
    nonce: decodeNonce(sig.sequence),
    pubkey: decodePubkey(ensure(sig.pubkey)),
    signature: decodeSignature(ensure(sig.signature)),
  };
}

function decodeBaseTx(tx: codecImpl.bnsd.ITx, chainId: ChainId): UnsignedTransaction {
  let base: UnsignedTransaction | (UnsignedTransaction & MultisignatureTx) = {
    kind: "",
    chainId: chainId,
  };
  if (tx.fees?.fees) {
    const prefix = addressPrefix(base.chainId);
    const payer = tx.fees.payer ? encodeBnsAddress(prefix, tx.fees.payer) : undefined;
    base = { ...base, fee: { tokens: decodeAmount(tx.fees.fees), payer: payer } };
  }
  if (tx.multisig?.length) {
    base = { ...base, multisig: tx.multisig.map(decodeNumericId) };
  }
  return base;
}

export function decodeSignedTx(tx: codecImpl.bnsd.ITx, chainId: ChainId): SignedTransaction {
  const signatures = ensure(tx.signatures, "signatures").map(decodeFullSig);
  let signaturesNonEmpty;
  try {
    signaturesNonEmpty = newNonEmptyArray(signatures);
  } catch (error) {
    throw new Error("Transaction has no signatures");
  }
  return {
    transaction: decodeMsg(decodeBaseTx(tx, chainId), tx),
    signatures: signaturesNonEmpty,
  };
}
