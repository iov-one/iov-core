import {
  Algorithm,
  FullSignature,
  FungibleToken,
  PrivateKeyBundle,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
  TokenTicker,
} from "@iov/types";
import * as codec from "./codec";

export const encodeToken = (token: FungibleToken) =>
  codec.x.Coin.create({
    // use null instead of 0 to not encode zero fields
    // for compatibility with golang encoder
    whole: token.whole || null,
    fractional: token.fractional || null,
    ticker: token.tokenTicker,
  });

export const encodeFullSig = (sig: FullSignature) =>
  codec.sigs.StdSignature.create({
    sequence: sig.nonce,
    pubKey: encodePubKey(sig.publicKey),
    signature: encodeSignature(sig.publicKey.algo, sig.signature),
  });

export const encodePubKey = (publicKey: PublicKeyBundle) => {
  switch (publicKey.algo) {
    case Algorithm.ED25519:
      return { ed25519: publicKey.data };
    default:
      throw new Error("unsupported algorithm: " + publicKey.algo);
  }
};

export const encodePrivKey = (privateKey: PrivateKeyBundle) => {
  switch (privateKey.algo) {
    case Algorithm.ED25519:
      return { ed25519: privateKey.data };
    default:
      throw new Error("unsupported algorithm: " + privateKey.algo);
  }
};

// encodeSignature needs the Algorithm to determine the type
export const encodeSignature = (algo: Algorithm, sigs: SignatureBytes) => {
  switch (algo) {
    case Algorithm.ED25519:
      return { ed25519: sigs };
    default:
      throw new Error("unsupported algorithm: " + algo);
  }
};

const decodeLong = (maybeLong: Long | number | null | undefined): number => {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
};

export const decodeToken = (token: codec.x.ICoin): FungibleToken => ({
  whole: decodeLong(token.whole),
  fractional: decodeLong(token.fractional),
  tokenTicker: (token.ticker || "") as TokenTicker,
});

export const decodePubKey = (publicKey: codec.crypto.IPublicKey): PublicKeyBundle => {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.ED25519,
      data: publicKey.ed25519 as PublicKeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
};
