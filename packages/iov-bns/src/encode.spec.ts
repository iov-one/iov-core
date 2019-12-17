import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Nonce,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  TokenTicker,
} from "@iov/bcp";
import { Ed25519, Ed25519Keypair, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { buildMultisignatureCondition, conditionToWeaveAddress } from "./conditions";
import { encodeFullSignature, encodePrivkey, encodePubkey, encodeSignedTx, encodeUnsignedTx } from "./encode";
import * as codecImpl from "./generated/codecimpl";
import {
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  sendTxSignBytes,
  signedTxBin,
  signedTxJson,
  signedTxSig,
} from "./testdata.spec";
import { MultisignatureTx } from "./types";
import { appendSignBytes } from "./util";

const { fromHex } = Encoding;

describe("encode", () => {
  describe("encodePubkey", () => {
    it("can encode a pubkey", () => {
      const pubkey = encodePubkey(pubJson);
      const encoded = codecImpl.crypto.PublicKey.encode(pubkey).finish();
      // force result into Uint8Array for tests so it passes
      // if buffer of correct type as well
      expect(Uint8Array.from(encoded)).toEqual(pubBin);
    });

    it("throws for invalid size", () => {
      const pubkey = { algo: Algorithm.Ed25519, data: fromHex("ab") as PubkeyBytes };
      expect(() => encodePubkey(pubkey)).toThrowError(/invalid pubkey size/i);
    });
  });

  describe("encodePrivkey", () => {
    it("can encode a privkey", () => {
      const privkey = encodePrivkey(privJson);
      const encoded = codecImpl.crypto.PrivateKey.encode(privkey).finish();
      expect(Uint8Array.from(encoded)).toEqual(privBin);
    });
  });

  it("encodes full signature", () => {
    const fullSignature: FullSignature = {
      nonce: 123 as Nonce,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("00aa1122bbddffeeddcc00aa1122bbddffeeddcc00aa1122bbddffeeddcc00aa") as PubkeyBytes,
      },
      signature: fromHex("aabbcc22334455") as SignatureBytes,
    };
    const encoded = encodeFullSignature(fullSignature);
    expect(encoded.sequence).toEqual(123);
    expect(encoded.pubkey!.ed25519!).toEqual(
      fromHex("00aa1122bbddffeeddcc00aa1122bbddffeeddcc00aa1122bbddffeeddcc00aa"),
    );
    expect(encoded.signature!.ed25519).toEqual(fromHex("aabbcc22334455"));
  });

  describe("encodeUnsignedTx", () => {
    const defaultChainId = "some-chain" as ChainId;
    const defaultSender = "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address;
    const defaultRecipient = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;

    const defaultAmount: Amount = {
      quantity: "1000000001",
      fractionalDigits: 9,
      tokenTicker: "CASH" as TokenTicker,
    };

    it("is compatible to testdata", () => {
      const tx = encodeUnsignedTx(sendTxJson);
      const encoded = Uint8Array.from(codecImpl.bnsd.Tx.encode(tx).finish());
      expect(encoded).toEqual(sendTxBin);
    });

    it("matches sign bytes of testdata", async () => {
      const keypair = Ed25519Keypair.fromLibsodiumPrivkey(privJson.data);
      const pubKey = pubJson.data;

      const tx = encodeUnsignedTx(sendTxJson);
      const encoded = codecImpl.bnsd.Tx.encode(tx).finish();
      const toSign = appendSignBytes(encoded, sendTxJson.chainId, signedTxSig.nonce);
      // testvector output already has the sha-512 digest applied
      const prehash = new Sha512(toSign).digest();
      expect(prehash).toEqual(sendTxSignBytes);

      // make sure we can validate this signature (our signBytes are correct)
      const signature = signedTxSig.signature;
      const valid = await Ed25519.verifySignature(signature, prehash, pubKey);
      expect(valid).toEqual(true);

      // make sure we can generate a compatible signature
      const mySig = await Ed25519.createSignature(prehash, keypair);
      expect(mySig).toEqual(signature);
    });

    it("can encode transaction without fees", () => {
      const transaction: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "free transaction",
      };

      const encoded = encodeUnsignedTx(transaction);
      expect(encoded.fees).toBeFalsy();

      expect(encoded.cashSendMsg).toBeDefined();
      expect(encoded.cashSendMsg!.memo).toEqual("free transaction");
    });

    it("can encode transaction with fees", () => {
      const transaction: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "paid transaction",
        fee: {
          tokens: defaultAmount,
          payer: defaultSender,
        },
      };

      const encoded = encodeUnsignedTx(transaction);
      expect(encoded.fees).toBeDefined();
      expect(encoded.fees!.fees!.whole).toEqual(1);
      expect(encoded.fees!.fees!.fractional).toEqual(1);
      expect(encoded.fees!.fees!.ticker).toEqual("CASH");
      expect(encoded.fees!.payer!).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));

      expect(encoded.cashSendMsg).toBeDefined();
      expect(encoded.cashSendMsg!.memo).toEqual("paid transaction");
    });

    it("can encode transaction with fees when fee payer is not the main signer", () => {
      const defaultRecipientWeaveAddress = fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282");
      const transaction: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "paid transaction",
        fee: {
          tokens: defaultAmount,
          payer: defaultRecipient,
        },
      };

      const encoded = encodeUnsignedTx(transaction);
      expect(encoded.fees).toBeDefined();
      expect(encoded.fees!.fees!.whole).toEqual(1);
      expect(encoded.fees!.fees!.fractional).toEqual(1);
      expect(encoded.fees!.fees!.ticker).toEqual("CASH");
      expect(encoded.fees!.payer!).toEqual(defaultRecipientWeaveAddress);

      expect(encoded.cashSendMsg).toBeDefined();
      expect(encoded.cashSendMsg!.memo).toEqual("paid transaction");
    });

    it("can encode transaction with multisig", () => {
      const transaction: SendTransaction & MultisignatureTx = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        fee: { tokens: defaultAmount },
        multisig: [42, 1, Number.MAX_SAFE_INTEGER, 7],
      };

      const encoded = encodeUnsignedTx(transaction);
      expect(encoded.multisig).toEqual([
        fromHex("000000000000002a"),
        fromHex("0000000000000001"),
        fromHex("001fffffffffffff"),
        fromHex("0000000000000007"),
      ]);
      const firstContract = conditionToWeaveAddress(buildMultisignatureCondition(42));
      expect(encoded.fees!.payer).toEqual(firstContract);
    });

    it("throws for multisig transaction with zero entries", () => {
      const transaction: SendTransaction & MultisignatureTx = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        fee: { tokens: defaultAmount },
        multisig: [],
      };
      expect(() => encodeUnsignedTx(transaction)).toThrowError(
        /empty multisig arrays are currently unsupported/i,
      );
    });
  });

  describe("encodeSignedTx", () => {
    it("is compatible to testdata", () => {
      const tx = encodeSignedTx(signedTxJson);
      const encoded = Uint8Array.from(codecImpl.bnsd.Tx.encode(tx).finish());
      expect(encoded).toEqual(signedTxBin);
    });
  });
});
