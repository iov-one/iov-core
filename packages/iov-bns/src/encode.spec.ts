import {
  Address,
  FullSignature,
  Nonce,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  TransactionKind,
} from "@iov/bcp-types";
import { Ed25519, Ed25519Keypair, Sha512 } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import {
  buildMsg,
  buildSignedTx,
  buildUnsignedTx,
  encodeAmount,
  encodeFullSignature,
  encodePrivkey,
  encodePubkey,
} from "./encode";
import * as codecImpl from "./generated/codecimpl";
import { appendSignBytes } from "./util";

import {
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  registerBlockchainTransaction,
  sendTxBin,
  sendTxJson,
  sig,
  signBytes,
  signedTxBin,
  signedTxJson,
} from "./testdata";

const { fromHex, toAscii } = Encoding;

describe("Encode", () => {
  it("encode pubkey", () => {
    const pubkey = encodePubkey(pubJson);
    const encoded = codecImpl.crypto.PublicKey.encode(pubkey).finish();
    // force result into Uint8Array for tests so it passes
    // if buffer of correct type as well
    expect(Uint8Array.from(encoded)).toEqual(pubBin);
  });

  it("encode private key", () => {
    const privkey = encodePrivkey(privJson);
    const encoded = codecImpl.crypto.PublicKey.encode(privkey).finish();
    expect(Uint8Array.from(encoded)).toEqual(privBin);
  });

  it("encodes amount", () => {
    const amount = encodeAmount(coinJson);
    const encoded = codecImpl.x.Coin.encode(amount).finish();
    expect(Uint8Array.from(encoded)).toEqual(coinBin);
  });

  it("encodes full signature", () => {
    const fullSignature: FullSignature = {
      nonce: new Int53(123) as Nonce,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("00aa1122bbddffeeddcc") as PublicKeyBytes,
      },
      signature: fromHex("aabbcc22334455") as SignatureBytes,
    };
    const encoded = encodeFullSignature(fullSignature);
    expect(encoded.sequence).toEqual(123);
    expect(encoded.pubkey!.ed25519!).toEqual(fromHex("00aa1122bbddffeeddcc"));
    expect(encoded.signature!.ed25519).toEqual(fromHex("aabbcc22334455"));
  });

  describe("buildMsg", () => {
    const defaultSigner: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("00112233445566778899aa") as PublicKeyBytes,
    };

    it("works for RegisterBlockchainTx", () => {
      const registerBlockchain: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: "registry-chain" as ChainId,
        signer: defaultSigner,
        blockchainId: "wonderland" as ChainId,
      };
      const msg = buildMsg(registerBlockchain);
      expect(msg.issueBlockchainNftMsg).toBeDefined();
      expect(msg.issueBlockchainNftMsg!.id).toEqual(toAscii("wonderland"));
    });

    it("matches test data for RegisterBlockchainTx", () => {
      const registerBlockchain: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: "registry-chain" as ChainId,
        signer: {
          algo: Algorithm.Ed25519,
          data: registerBlockchainTransaction.ownerEd25519Pubkey,
        },
        blockchainId: registerBlockchainTransaction.blockchainId,
      };
      const encoded = new Uint8Array(codecImpl.app.Tx.encode(buildMsg(registerBlockchain)).finish());
      expect(encoded).toEqual(registerBlockchainTransaction.expectedBinary);
    });

    it("works for RegisterUsernameTx", () => {
      const registerUsername: RegisterUsernameTx = {
        kind: TransactionKind.RegisterUsername,
        chainId: "registry-chain" as ChainId,
        signer: defaultSigner,
        username: "alice",
        addresses: new Map([
          ["chain1" as ChainId, "367X" as Address],
          ["chain3" as ChainId, "0xddffeeffddaa44" as Address],
          ["chain2" as ChainId, "0x00aabbddccffee" as Address],
        ]),
      };
      const msg = buildMsg(registerUsername);
      expect(msg.issueUsernameNftMsg).toBeDefined();
      expect(msg.issueUsernameNftMsg!.id).toEqual(toAscii("alice"));
      expect(msg.issueUsernameNftMsg!.details).toBeDefined();
      expect(msg.issueUsernameNftMsg!.details!.addresses).toBeDefined();
      expect(msg.issueUsernameNftMsg!.details!.addresses!.length).toEqual(3);
      expect(msg.issueUsernameNftMsg!.details!.addresses![0].chainID).toEqual(toAscii("chain1"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![0].address).toEqual(toAscii("367X"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![1].chainID).toEqual(toAscii("chain2"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![1].address).toEqual(toAscii("0x00aabbddccffee"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![2].chainID).toEqual(toAscii("chain3"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![2].address).toEqual(toAscii("0xddffeeffddaa44"));
    });
  });
});

describe("Encode transactions", () => {
  it("encodes unsigned message", () => {
    const tx = buildMsg(sendTxJson);
    const encoded = codecImpl.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
  });

  it("encodes unsigned transaction", () => {
    const tx = buildUnsignedTx(sendTxJson);
    const encoded = codecImpl.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
  });

  it("encodes signed transaction", () => {
    const tx = buildSignedTx(signedTxJson);
    const encoded = codecImpl.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
  });
});

describe("Ensure crypto", () => {
  it("private key and public key match", async () => {
    const keypair = Ed25519Keypair.fromLibsodiumPrivkey(privJson.data);
    const pubKey = pubJson.data;
    const msg = Uint8Array.from([12, 54, 98, 243, 11]);
    const signature = await Ed25519.createSignature(msg, keypair);
    const value = await Ed25519.verifySignature(signature, msg, pubKey);
    expect(value).toBeTruthy();
  });

  it("sign bytes match", async () => {
    const keypair = Ed25519Keypair.fromLibsodiumPrivkey(privJson.data);
    const pubKey = pubJson.data;

    const tx = buildUnsignedTx(sendTxJson);
    const encoded = codecImpl.app.Tx.encode(tx).finish();
    const toSign = appendSignBytes(encoded, sendTxJson.chainId, sig.nonce);
    expect(toSign).toEqual(signBytes);

    // make sure we can validate this signature (our signBytes are correct)
    const signature = sig.signature;
    const prehash = new Sha512(toSign).digest();
    const valid = await Ed25519.verifySignature(signature, prehash, pubKey);
    expect(valid).toEqual(true);

    // make sure we can generate a compatible signature
    const mySig = await Ed25519.createSignature(prehash, keypair);
    expect(mySig).toEqual(signature);
  });
});
