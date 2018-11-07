import * as Long from "long";

import { BcpCoin, FullSignature, FungibleToken, Nonce, TokenTicker } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";
import {
  Algorithm,
  PrivateKeyBundle,
  PrivateKeyBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

import * as codecImpl from "./codecimpl";
import { encodePubkey } from "./encode";
import { InitData } from "./normalize";

export interface Result {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

export interface Keyed {
  readonly _id: Uint8Array;
}

export interface Decoder<T extends {}> {
  readonly decode: (data: Uint8Array) => T;
}

export const encodeFullSig = (sig: FullSignature) =>
  codecImpl.sigs.StdSignature.create({
    sequence: sig.nonce.toNumber(),
    pubKey: encodePubkey(sig.publicKey),
    signature: encodeSignature(sig.publicKey.algo, sig.signature),
  });

// encodeSignature needs the Algorithm to determine the type
export const encodeSignature = (algo: Algorithm, sigs: SignatureBytes) => {
  switch (algo) {
    case Algorithm.Ed25519:
      return { ed25519: sigs };
    default:
      throw new Error("unsupported algorithm: " + algo);
  }
};

export const decodeToken = (token: codecImpl.x.ICoin): FungibleToken => ({
  whole: asNumber(token.whole),
  fractional: asNumber(token.fractional),
  tokenTicker: (token.ticker || "") as TokenTicker,
});

export const fungibleToBcpCoin = (initData: InitData) => (token: FungibleToken): BcpCoin => {
  const tickerInfo = initData.tickers.get(token.tokenTicker);
  return {
    ...token,
    // Better defaults?
    tokenName: tickerInfo ? tickerInfo.tokenName : "<Unknown token>",
    sigFigs: tickerInfo ? tickerInfo.sigFigs : 9,
  };
};

export function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PublicKeyBundle {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: publicKey.ed25519 as PublicKeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
}

export function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivateKeyBundle {
  if (privateKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: privateKey.ed25519 as PrivateKeyBytes,
    };
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export const decodeSignature = (signature: codecImpl.crypto.ISignature): SignatureBytes => {
  if (signature.ed25519) {
    return signature.ed25519 as SignatureBytes;
  } else {
    throw new Error("Unknown private key algorithm");
  }
};

export const decodeFullSig = (sig: codecImpl.sigs.IStdSignature): FullSignature => ({
  nonce: asInt53(sig.sequence) as Nonce,
  publicKey: decodePubkey(ensure(sig.pubKey)),
  signature: decodeSignature(ensure(sig.signature)),
});

export const asNumber = (maybeLong: Long | number | null | undefined): number => {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
};

export function asInt53(input: Long | number | null | undefined): Int53 {
  if (!input) {
    return new Int53(0);
  } else if (typeof input === "number") {
    return new Int53(input);
  } else {
    return Int53.fromString(input.toString());
  }
}

export const ensure = <T>(maybe: T | null | undefined, msg?: string): T => {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
};
