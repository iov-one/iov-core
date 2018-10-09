import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Long from "long";

import { Nonce, PrehashType, RecipientId, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { appVersion, getPublicKey, getPublicKeyWithIndex, signTransaction, signTransactionWithIndex } from "./app";
import { pendingWithoutInteractiveLedger, pendingWithoutLedger, skipInteractiveTests, skipTests } from "./common.spec";
import { connectToFirstLedger } from "./exchange";

describe("Query ledger app", () => {
  let transport: TransportNodeHid | undefined;

  beforeAll(async () => {
    if (!skipTests()) {
      transport = await connectToFirstLedger();
    }
  });

  it("get proper version", done => {
    pendingWithoutLedger();

    appVersion(transport!)
      .catch(err => fail(err))
      .then(num => expect(num).toEqual(0x0100))
      .then(done);
  });

  it("can read the public key", done => {
    pendingWithoutLedger();

    const checkKey = async () => {
      const pubkey = await getPublicKey(transport!);
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
      const pubkey = await getPublicKey(transport!);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toEqual(32);

      const pubkey0 = await getPublicKeyWithIndex(transport!, 0);
      expect(pubkey0).toBeTruthy();
      expect(pubkey0.length).toEqual(32);
      expect(pubkey0).toEqual(pubkey);

      const pubkey1 = await getPublicKeyWithIndex(transport!, 267);
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
  let transport: TransportNodeHid | undefined;

  beforeAll(async () => {
    if (!skipInteractiveTests()) {
      transport = await connectToFirstLedger();
    }
  });

  it("can properly sign valid message", async () => {
    pendingWithoutInteractiveLedger();

    // this is pre-generated signbytes
    const message = Encoding.fromHex("00cafe0008746573742d31323300000000000000110a440a1403694b56200b605a3a726304b6dfaa6e916458ee12146bc29ffe4fc6a4b2395c3f47b5ca9dfa377295f91a0808fa011a03455448220c54657374207061796d656e74");

    const pubkey = await getPublicKey(transport!);
    expect(pubkey.length).toEqual(32);

    const signature = await signTransaction(transport!, message);
    expect(signature.length).toEqual(64);

    const prehash = new Sha512(message).digest();
    const ok = await Ed25519.verifySignature(signature, prehash, pubkey);
    expect(ok).toEqual(true);
  });

  // Note: verify that this display expected info (1234.789 LGR and
  // 0123... recipient) when verifying signature
  it("is compatible with our codecs", async () => {
    pendingWithoutInteractiveLedger();

    const pubkey = await getPublicKey(transport!);
    expect(pubkey.length).toEqual(32);

    const sender: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: pubkey as PublicKeyBytes,
    };

    const tx: SendTx = {
      kind: TransactionKind.Send,
      chainId: "test-bns-ledger" as ChainId,
      recipient: "0123456789012345678901234567890123456789" as RecipientId,
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
    const { bytes, prehashType } = bnsCodec.bytesToSign(tx, nonce);

    const signature = await signTransaction(transport!, bytes);
    expect(signature.length).toEqual(64);

    // verify signature from Ledger
    switch (prehashType) {
      case PrehashType.Sha512:
        const prehash = new Sha512(bytes).digest();
        const valid = await Ed25519.verifySignature(signature, prehash, pubkey);
        expect(valid).toEqual(true);
        break;
      default:
        fail("Unexpected prehash type");
    }
  });

  // this is as above, but verifying a different path also works
  it("can sign with index", async () => {
    pendingWithoutInteractiveLedger();

    const simpleAddressIndex = 0x787;

    const pubkey = await getPublicKeyWithIndex(transport!, simpleAddressIndex);
    expect(pubkey.length).toEqual(32);

    const sender: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: pubkey as PublicKeyBytes,
    };

    const tx: SendTx = {
      kind: TransactionKind.Send,
      chainId: "test-ledger-paths" as ChainId,
      recipient: "1234ABCD0000AA0000FFFF0000AA00001234ABCD" as RecipientId,
      amount: {
        // 77.01001 PATH
        whole: 77,
        fractional: 10010000,
        tokenTicker: "PATH" as TokenTicker,
      },
      signer: sender,
    };
    const nonce = Long.fromNumber(5) as Nonce;
    const { bytes, prehashType } = bnsCodec.bytesToSign(tx, nonce);

    const signature = await signTransactionWithIndex(transport!, bytes, simpleAddressIndex);
    expect(signature.length).toEqual(64);

    // verify signature from Ledger
    switch (prehashType) {
      case PrehashType.Sha512:
        const prehash = new Sha512(bytes).digest();
        const valid = await Ed25519.verifySignature(signature, prehash, pubkey);
        expect(valid).toEqual(true);
        break;
      default:
        fail("Unexpected prehash type");
    }
  });
});
