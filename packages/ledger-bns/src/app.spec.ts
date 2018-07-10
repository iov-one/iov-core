import Long from "long";

import { Codec } from "@iov/bns-codec";
import { Ed25519, Encoding, Sha512 } from "@iov/crypto";
import { Algorithm, ChainId, Nonce, PublicKeyBundle, PublicKeyBytes, RecipientId, SendTx, TokenTicker, TransactionKind } from "@iov/types";

import { appVersion, getPublicKey, getPublicKeyWithPath, signTransaction, signTransactionWithPath } from "./app";
import { pendingWithoutInteractiveLedger, pendingWithoutLedger, skipInteractiveTests, skipTests } from "./common.spec";
import { connectToFirstLedger } from "./exchange";

describe("Query ledger app", () => {
  // tslint:disable-next-line:no-let
  let transport: Transport | undefined;

  beforeAll(() => {
    if (!skipTests()) {
      transport = connectToFirstLedger();
    }
  });

  it("get proper version", done => {
    pendingWithoutLedger();

    appVersion(transport)
      .catch(err => fail(err))
      .then(num => expect(num).toEqual(0x0100))
      .then(done);
  });

  it("can read the public key", done => {
    pendingWithoutLedger();

    const checkKey = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toEqual(32);
    };
    checkKey()
      .catch(err => fail(err))
      .then(done);
  });

  it("can get multiple public keys by path", done => {
    pendingWithoutLedger();

    const checkKey = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toEqual(32);

      const pubkey0 = await getPublicKeyWithPath(transport, 0);
      expect(pubkey0).toBeTruthy();
      expect(pubkey0.length).toEqual(32);
      expect(pubkey0).toEqual(pubkey);

      const pubkey1 = await getPublicKeyWithPath(transport, 267);
      expect(pubkey1).toBeTruthy();
      expect(pubkey1.length).toEqual(32);
      expect(pubkey1).not.toEqual(pubkey0);
    };
    checkKey()
      .catch(err => fail(err))
      .then(done);
  });
});

describe("Sign with ledger app", () => {
  // tslint:disable-next-line:no-let
  let transport: Transport | undefined;

  beforeAll(() => {
    if (!skipInteractiveTests()) {
      transport = connectToFirstLedger();
    }
  });

  it("can properly sign valid message", done => {
    pendingWithoutInteractiveLedger();

    // this is pre-generated signbytes
    const message = Encoding.fromHex("00cafe0008746573742d31323300000000000000110a440a1403694b56200b605a3a726304b6dfaa6e916458ee12146bc29ffe4fc6a4b2395c3f47b5ca9dfa377295f91a0808fa011a03455448220c54657374207061796d656e74");
    const messageHash = new Sha512(message).digest();

    const validateSig = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey.length).toEqual(32);
      const signature = await signTransaction(transport, message);
      expect(signature.length).toEqual(64);
      const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
      expect(ok).toEqual(true);
    };

    validateSig()
      .catch(err => fail(err))
      .then(done);
  });

  // Note: verify that this display expected info (1234.789 LGR and
  // 0123... recipient) when verifying signature
  it("is compatible with our codecs", done => {
    pendingWithoutInteractiveLedger();

    const validateSig = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey.length).toEqual(32);

      const sender: PublicKeyBundle = {
        algo: Algorithm.ED25519,
        data: pubkey as PublicKeyBytes,
      };

      const tx: SendTx = {
        kind: TransactionKind.SEND,
        chainId: "test-bns-ledger" as ChainId,
        recipient: Encoding.fromHex("0123456789012345678901234567890123456789") as RecipientId,
        amount: {
          // 1234.789 LGR
          whole: 1234,
          fractional: 789000000,
          tokenTicker: "LGR" as TokenTicker,
        },
        signer: sender,
        memo: "Hi Mom!",
      };
      const nonce = Long.fromNumber(123) as Nonce;
      const message = Codec.bytesToSign(tx, nonce);
      const messageHash = new Sha512(message).digest();

      const signature = await signTransaction(transport, message);
      expect(signature.length).toEqual(64);
      const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
      expect(ok).toEqual(true);
    };

    validateSig()
      .catch(err => fail(err))
      .then(done);
  });

  // this is as above, but verifying a different path also works
  it("can sign with multiple paths", done => {
    pendingWithoutInteractiveLedger();
    const path = 0x787;

    const validateSig = async () => {
      const pubkey = await getPublicKeyWithPath(transport, path);
      expect(pubkey.length).toEqual(32);

      const sender: PublicKeyBundle = {
        algo: Algorithm.ED25519,
        data: pubkey as PublicKeyBytes,
      };

      const tx: SendTx = {
        kind: TransactionKind.SEND,
        chainId: "test-ledger-paths" as ChainId,
        recipient: Encoding.fromHex("1234ABCD0000AA0000FFFF0000AA00001234ABCD") as RecipientId,
        amount: {
          // 77.01001 PATH
          whole: 77,
          fractional: 10010000,
          tokenTicker: "PATH" as TokenTicker,
        },
        signer: sender,
      };
      const nonce = Long.fromNumber(5) as Nonce;
      const message = Codec.bytesToSign(tx, nonce);
      const messageHash = new Sha512(message).digest();

      const signature = await signTransactionWithPath(transport, message, path);
      expect(signature.length).toEqual(64);
      const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
      expect(ok).toEqual(true);
    };

    validateSig()
      .catch(err => fail(err))
      .then(done);
  });
});
