import levelup from "levelup";
import Long from "long";
import MemDownConstructor, { MemDown } from "memdown";
import { ReadonlyDate } from "readonly-date";

import { AddressBytes, Algorithm, ChainId, Nonce, PostableBytes, PublicKeyBytes, SendTx, SignableBytes, SignatureBytes, SignedTransaction, TokenTicker, TransactionIDBytes, TransactionKind, TxCodec } from "@iov/types";

import { Keyring } from "./keyring";
import { UserProfile } from "./userprofile";
import { MemoryStreamUtils } from "./utils";

describe("UserProfile", () => {
  it("can be constructed", () => {
    const keyringSerializetion = new Keyring().serialize();
    const createdAt = new ReadonlyDate(ReadonlyDate.now());
    const profile = new UserProfile(createdAt, keyringSerializetion);
    expect(profile).toBeTruthy();
  });

  it("can be locked", done => {
    (async () => {
      const keyringSerializetion = new Keyring().serialize();
      const createdAt = new ReadonlyDate(ReadonlyDate.now());
      const profile = new UserProfile(createdAt, keyringSerializetion);
      expect(await MemoryStreamUtils.value(profile.locked)).toEqual(false);
      profile.lock();
      expect(await MemoryStreamUtils.value(profile.locked)).toEqual(true);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be stored", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring().serialize();
      const profile = new UserProfile(createdAt, keyring);

      await profile.storeIn(storage);

      {
        const db = levelup(storage);
        expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
        expect(await db.get("keyring", { asBuffer: false })).toEqual('{"entries":[]}');
        await db.close();
      }

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("flushed store when storing", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      {
        const db = levelup(storage);
        await db.put("foo", "bar");
        await db.close();
      }

      const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), new Keyring().serialize());
      await profile.storeIn(storage);

      {
        const db = levelup(storage);
        await db
          .get("foo")
          .then(() => {
            fail("get 'foo' promise must not reslve");
          })
          .catch(error => {
            expect(error.notFound).toBeTruthy();
          });
        await db.close();
      }

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be loaded from storage", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      {
        const db = levelup(storage);
        await db.put("created_at", "1985-04-12T23:20:50.521Z");
        await db.put("keyring", '{"entries":[]}');
        await db.close();
      }

      const profile = await UserProfile.loadFrom(storage);
      expect(profile.createdAt).toEqual(new ReadonlyDate("1985-04-12T23:20:50.521Z"));

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("throws for non-existing entry index", done => {
    (async () => {
      const keyringSerializetion = new Keyring().serialize();
      const createdAt = new ReadonlyDate(ReadonlyDate.now());
      const profile = new UserProfile(createdAt, keyringSerializetion);

      const fakeIdentity = { pubkey: { algo: Algorithm.ED25519, data: new Uint8Array([0xaa]) as PublicKeyBytes } };
      const fakeTransaction: SendTx = {
        chainId: "ethereum" as ChainId,
        signer: fakeIdentity.pubkey,
        kind: TransactionKind.SEND,
        amount: {
          whole: 1,
          fractional: 12,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: new Uint8Array([0x00, 0x11, 0x22]) as AddressBytes,
      };
      const fakeSignedTransaction: SignedTransaction = {
        transaction: fakeTransaction,
        primarySignature: {
          nonce: new Long(0, 11) as Nonce,
          publicKey: fakeIdentity.pubkey,
          signature: new Uint8Array([]) as SignatureBytes,
        },
        otherSignatures: [],
      };

      const fakeCodec: TxCodec = {
        bytesToSign: (): SignableBytes => {
          throw new Error("not implemented");
        },
        bytesToPost: (): PostableBytes => {
          throw new Error("not implemented");
        },
        identifier: (): TransactionIDBytes => {
          throw new Error("not implemented");
        },
        parseBytes: (): SignedTransaction => {
          throw new Error("not implemented");
        },
      };

      // keyring entry of index 0 does not exist

      expect(() => profile.getIdentities(0)).toThrowError(/Entry of index 0 does not exist in keyring/);
      expect(() => profile.setIdentityLabel(0, fakeIdentity, "foo")).toThrowError(/Entry of index 0 does not exist in keyring/);
      await profile
        .createIdentity(0)
        .then(() => fail("Promise must not resolve"))
        .catch(error => expect(error).toMatch(/Entry of index 0 does not exist in keyring/));
      await profile
        .signTransaction(0, fakeIdentity, fakeTransaction, fakeCodec, new Long(1, 2) as Nonce)
        .then(() => fail("Promise must not resolve"))
        .catch(error => expect(error).toMatch(/Entry of index 0 does not exist in keyring/));
      await profile
        .appendSignature(0, fakeIdentity, fakeSignedTransaction, fakeCodec, new Long(1, 2) as Nonce)
        .then(() => fail("Promise must not resolve"))
        .catch(error => expect(error).toMatch(/Entry of index 0 does not exist in keyring/));

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
