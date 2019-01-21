import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PrehashType,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { appVersion, getPublicKeyWithIndex, signTransactionWithIndex } from "./app";
import {
  pendingWithoutInteractiveLedger,
  pendingWithoutLedger,
  skipInteractiveTests,
  skipTests,
} from "./common.spec";
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

  it("can read the public key by path", done => {
    pendingWithoutLedger();

    const checkKey = async () => {
      const pubkey = await getPublicKeyWithIndex(transport!, 0);
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
      const pubkey0 = await getPublicKeyWithIndex(transport!, 0);
      expect(pubkey0).toBeTruthy();
      expect(pubkey0.length).toEqual(32);

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
    const message = Encoding.fromHex(
      "00cafe0008746573742d31323300000000000000110a440a1403694b56200b605a3a726304b6dfaa6e916458ee12146bc29ffe4fc6a4b2395c3f47b5ca9dfa377295f91a0808fa011a03455448220c54657374207061796d656e74",
    );

    const pubkey = await getPublicKeyWithIndex(transport!, 0);
    expect(pubkey.length).toEqual(32);

    const signature = await signTransactionWithIndex(transport!, message, 0);
    expect(signature.length).toEqual(64);

    const prehash = new Sha512(message).digest();
    const ok = await Ed25519.verifySignature(signature, prehash, pubkey);
    expect(ok).toEqual(true);
  });

  // Note: verify that this display expected info (1234.789 LGR and
  // 0123... recipient) when verifying signature
  it("is compatible with our codecs", async () => {
    pendingWithoutInteractiveLedger();

    const pubkey = await getPublicKeyWithIndex(transport!, 0);
    expect(pubkey.length).toEqual(32);

    const sender: PublicIdentity = {
      chainId: "test-bns-ledger" as ChainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
    };

    const tx: SendTransaction = {
      kind: "bcp/send",
      creator: sender,
      recipient: "tiov1qy352eufqy352eufqy352eufqy352eufpralqn" as Address,
      amount: {
        // 1234.789 LGR
        quantity: "1234789000000",
        fractionalDigits: 9,
        tokenTicker: "LGR" as TokenTicker,
      },
      memo: "Hi Mom!",
    };
    const nonce = new Int53(123) as Nonce;
    const { bytes, prehashType } = bnsCodec.bytesToSign(tx, nonce);

    const signature = await signTransactionWithIndex(transport!, bytes, 0);
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

    const sender: PublicIdentity = {
      chainId: "test-ledger-paths" as ChainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
    };

    const tx: SendTransaction = {
      kind: "bcp/send",
      creator: sender,
      recipient: "tiov1zg62hngqqz4qqq8lluqqp2sqqqfrf27dzrrmea" as Address,
      amount: {
        // 77.01001 PATH
        quantity: "77010010000",
        fractionalDigits: 9,
        tokenTicker: "PATH" as TokenTicker,
      },
    };
    const nonce = new Int53(5) as Nonce;
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
