import {
  Algorithm,
  FullSignature,
  PubkeyBundle,
  SignatureBytes,
  SignedTransaction,
  UnsignedTransaction,
} from "@iov/bcp";

import { buildMultisignatureCondition, conditionToWeaveAddress } from "./conditions";
import { encodeMsg } from "./encodemsg";
import { encodeAmount, encodeNumericId } from "./encodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import { isMultisignatureTx, PrivkeyBundle } from "./types";
import { decodeBnsAddress } from "./util";

export function encodePubkey(pubkey: PubkeyBundle): codecImpl.crypto.IPublicKey {
  switch (pubkey.algo) {
    case Algorithm.Ed25519:
      if (pubkey.data.length !== 32) {
        throw new Error("Invalid pubkey size: must be 32 bytes");
      }
      return { ed25519: pubkey.data };
    default:
      throw new Error("unsupported algorithm: " + pubkey.algo);
  }
}

export function encodePrivkey(privkey: PrivkeyBundle): codecImpl.crypto.IPrivateKey {
  switch (privkey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: privkey.data };
    default:
      throw new Error("unsupported algorithm: " + privkey.algo);
  }
}

function encodeSignature(algo: Algorithm, bytes: SignatureBytes): codecImpl.crypto.ISignature {
  switch (algo) {
    case Algorithm.Ed25519:
      return { ed25519: bytes };
    default:
      throw new Error("unsupported algorithm: " + algo);
  }
}

export function encodeFullSignature(fullSignature: FullSignature): codecImpl.sigs.IStdSignature {
  return codecImpl.sigs.StdSignature.create({
    sequence: fullSignature.nonce,
    pubkey: encodePubkey(fullSignature.pubkey),
    signature: encodeSignature(fullSignature.pubkey.algo, fullSignature.signature),
  });
}

function encodeFeeForTx(txWithFee: UnsignedTransaction): codecImpl.cash.IFeeInfo {
  const { fee } = txWithFee;
  if (!fee?.tokens) {
    throw new Error("Cannot build fee for transaction without fee tokens");
  }

  let feePayerAddressBytes: Uint8Array;
  if (fee.payer) {
    feePayerAddressBytes = decodeBnsAddress(fee.payer).data;
  } else if (isMultisignatureTx(txWithFee)) {
    const firstContract = txWithFee.multisig.find(() => true);
    if (firstContract === undefined) throw new Error("Empty multisig arrays are currently unsupported");
    feePayerAddressBytes = conditionToWeaveAddress(buildMultisignatureCondition(firstContract));
  } else {
    throw new Error("Cannot build fee for transaction with unknown fee payer");
  }

  return {
    fees: encodeAmount(fee.tokens),
    payer: feePayerAddressBytes,
  };
}

export function encodeUnsignedTx(tx: UnsignedTransaction): codecImpl.bnsd.ITx {
  const msg = encodeMsg(tx);

  return codecImpl.bnsd.Tx.create({
    ...msg,
    fees: tx.fee ? encodeFeeForTx(tx) : null,
    multisig: isMultisignatureTx(tx) ? tx.multisig.map(encodeNumericId) : null,
  });
}

export function encodeSignedTx(tx: SignedTransaction): codecImpl.bnsd.ITx {
  const built = encodeUnsignedTx(tx.transaction);
  return { ...built, signatures: tx.signatures.map(encodeFullSignature) };
}
