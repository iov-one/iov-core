import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Nonce,
  PublicIdentity,
  PublicKeyBytes,
  SignatureBytes,
  TokenTicker,
} from "@iov/bcp-types";
import { Ed25519, Ed25519Keypair, Sha512 } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

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
import {
  AddAddressToUsernameTx,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
} from "./types";
import { appendSignBytes } from "./util";

import {
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  sig,
  signBytes,
  signedTxBin,
  signedTxJson,
} from "./testdata.spec";

const { fromHex, toAscii, toUtf8 } = Encoding;

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

  describe("encodeAmount", () => {
    it("can encode amount 3.123456789 ASH", () => {
      const amount: Amount = {
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 3,
        fractional: 123456789,
        ticker: "ASH",
      });
    });

    it("can encode amount 0.000000001 ASH", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: null,
        fractional: 1,
        ticker: "ASH",
      });
    });

    it("can encode max amount 999999999999999.999999999 ASH", () => {
      // https://github.com/iov-one/weave/blob/v0.9.3/x/codec.proto#L15
      const amount: Amount = {
        quantity: "999999999999999999999999",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 10 ** 15 - 1,
        fractional: 10 ** 9 - 1,
        ticker: "ASH",
      });
    });

    it("throws for encoding fractional digits other than 9", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 6,
        tokenTicker: "SMASH" as TokenTicker,
      };
      expect(() => encodeAmount(amount)).toThrowError(/fractional digits must be 9 but was 6/i);
    });

    it("is compatible to test data", () => {
      const encoded = encodeAmount(coinJson);
      const encodedBinary = Uint8Array.from(codecImpl.x.Coin.encode(encoded).finish());
      expect(encodedBinary).toEqual(coinBin);
    });
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
    const defaultCreator: PublicIdentity = {
      chainId: "registry-chain" as ChainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("00112233445566778899aa") as PublicKeyBytes,
      },
    };

    it("works for AddAddressToUsernameTx", () => {
      const addAddress: AddAddressToUsernameTx = {
        kind: "bns/add_address_to_username",
        creator: defaultCreator,
        username: "alice",
        payload: {
          chainId: "other-land" as ChainId,
          address: "865765858O" as Address,
        },
      };
      const msg = buildMsg(addAddress).addUsernameAddressNftMsg!;
      expect(msg.usernameId).toEqual(toUtf8("alice"));
      expect(msg.blockchainId).toEqual(toUtf8("other-land"));
      expect(msg.address).toEqual("865765858O");
    });

    it("works for RegisterBlockchainTx", () => {
      const registerBlockchain: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
        creator: defaultCreator,
        chain: {
          chainId: "wonderland" as ChainId,
          production: false,
          enabled: true,
          name: "Wonderland",
          networkId: "7rg047g4h",
          mainTickerId: "WONDER" as TokenTicker,
        },
        codecName: "rules_of_wonderland",
        codecConfig: `{ rules: ["make peace not war"] }`,
      };
      const msg = buildMsg(registerBlockchain).issueBlockchainNftMsg!;
      expect(msg.id).toEqual(toAscii("wonderland"));
      expect(msg.details!.chain!.chainId).toEqual("wonderland");
      expect(msg.details!.chain!.production).toEqual(false);
      expect(msg.details!.chain!.enabled).toEqual(true);
      expect(msg.details!.chain!.name).toEqual("Wonderland");
      expect(msg.details!.chain!.networkId).toEqual("7rg047g4h");
      expect(msg.details!.chain!.mainTickerId).toEqual(toUtf8("WONDER"));
      expect(msg.details!.iov!.codec).toEqual("rules_of_wonderland");
      expect(msg.details!.iov!.codecConfig).toEqual(`{ rules: ["make peace not war"] }`);
    });

    it("works for RegisterUsernameTx", () => {
      const registerUsername: RegisterUsernameTx = {
        kind: "bns/register_username",
        creator: defaultCreator,
        username: "alice",
        addresses: [
          {
            chainId: "chain1" as ChainId,
            address: "367X" as Address,
          },
          {
            chainId: "chain3" as ChainId,
            address: "0xddffeeffddaa44" as Address,
          },
          {
            chainId: "chain2" as ChainId,
            address: "0x00aabbddccffee" as Address,
          },
        ],
      };
      const msg = buildMsg(registerUsername);
      expect(msg.issueUsernameNftMsg).toBeDefined();
      expect(msg.issueUsernameNftMsg!.id).toEqual(toAscii("alice"));
      expect(msg.issueUsernameNftMsg!.details).toBeDefined();
      expect(msg.issueUsernameNftMsg!.details!.addresses).toBeDefined();
      expect(msg.issueUsernameNftMsg!.details!.addresses!.length).toEqual(3);
      expect(msg.issueUsernameNftMsg!.details!.addresses![0].blockchainId).toEqual(toAscii("chain1"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![0].address).toEqual("367X");
      expect(msg.issueUsernameNftMsg!.details!.addresses![1].blockchainId).toEqual(toAscii("chain3"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![1].address).toEqual("0xddffeeffddaa44");
      expect(msg.issueUsernameNftMsg!.details!.addresses![2].blockchainId).toEqual(toAscii("chain2"));
      expect(msg.issueUsernameNftMsg!.details!.addresses![2].address).toEqual("0x00aabbddccffee");
    });

    it("works for RemoveAddressFromUsernameTx", () => {
      const removeAddress: RemoveAddressFromUsernameTx = {
        kind: "bns/remove_address_from_username",
        creator: defaultCreator,
        username: "alice",
        payload: {
          chainId: "other-land" as ChainId,
          address: "865765858O" as Address,
        },
      };
      const msg = buildMsg(removeAddress).removeUsernameAddressMsg!;
      expect(msg.usernameId).toEqual(toUtf8("alice"));
      expect(msg.blockchainId).toEqual(toUtf8("other-land"));
      expect(msg.address).toEqual("865765858O");
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
    const toSign = appendSignBytes(encoded, sendTxJson.creator.chainId, sig.nonce);
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
