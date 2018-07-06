import levelup from "levelup";
import Long from "long";
import MemDownConstructor from "memdown";
import { ReadonlyDate } from "readonly-date";

import { AddressBytes, Algorithm, ChainId, Nonce, PostableBytes, PublicKeyBytes, SendTx, SignableBytes, SignatureBytes, SignedTransaction, TokenTicker, TransactionIDBytes, TransactionKind, TxCodec } from "@iov/types";

import { Keyring } from "./keyring";
import { Ed25519SimpleAddressKeyringEntry } from "./keyring-entries";
import { UserProfile } from "./userprofile";

describe("UserProfile", () => {
  it("can be constructed without arguments", () => {
    const profile = new UserProfile();
    expect(profile).toBeTruthy();
  });

  it("is safe against keyring manipulation", () => {
    const keyring = new Keyring();
    keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
    const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
    expect(profile.entriesCount.value).toEqual(1);

    // manipulate external keyring
    keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("seed brass ranch destroy peasant upper steak toy hood cliff cabin kingdom"));

    // profile remains unchanged
    expect(profile.entriesCount.value).toEqual(1);
  });

  it("can be locked", () => {
    const profile = new UserProfile();
    expect(profile.locked.value).toEqual(false);
    profile.lock();
    expect(profile.locked.value).toEqual(true);
  });

  it("initial entries count works", () => {
    {
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.entriesCount.value).toEqual(0);
    }

    {
      const keyring = new Keyring();
      keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.entriesCount.value).toEqual(1);
    }

    {
      const keyring = new Keyring();
      keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
      keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("perfect clump orphan margin memory amazing morning use snap skate erosion civil"));
      keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.entriesCount.value).toEqual(3);
    }
  });

  it("initial entry labels work", () => {
    {
      const keyring = new Keyring();
      const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), keyring);
      expect(profile.entryLabels.value).toEqual([]);
    }

    {
      const entry = Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash");
      entry.setLabel("label 1");

      const keyring = new Keyring();
      keyring.add(entry);
      const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), keyring);
      expect(profile.entryLabels.value).toEqual(["label 1"]);
    }

    {
      const entry1 = Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash");
      entry1.setLabel("label 1");
      const entry2 = Ed25519SimpleAddressKeyringEntry.fromMnemonic("perfect clump orphan margin memory amazing morning use snap skate erosion civil");
      entry2.setLabel("");
      const entry3 = Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script");
      entry3.setLabel(undefined);

      const keyring = new Keyring();
      keyring.add(entry1);
      keyring.add(entry2);
      keyring.add(entry3);
      const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), keyring);
      expect(profile.entryLabels.value).toEqual(["label 1", "", undefined]);
    }
  });

  it("can add entries", () => {
    const profile = new UserProfile();
    expect(profile.entriesCount.value).toEqual(0);
    profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
    expect(profile.entriesCount.value).toEqual(1);
    expect(profile.getIdentities(0)).toBeTruthy();
    profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("perfect clump orphan margin memory amazing morning use snap skate erosion civil"));
    profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));
    expect(profile.entriesCount.value).toEqual(3);
    expect(profile.getIdentities(0)).toBeTruthy();
    expect(profile.getIdentities(1)).toBeTruthy();
    expect(profile.getIdentities(2)).toBeTruthy();
  });

  it("can update entry labels", () => {
    const keyring = new Keyring();
    keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
    keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
    const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), keyring);
    expect(profile.entryLabels.value).toEqual([undefined, undefined]);

    profile.setEntryLabel(0, "foo1");
    expect(profile.entryLabels.value).toEqual(["foo1", undefined]);

    profile.setEntryLabel(1, "foo2");
    expect(profile.entryLabels.value).toEqual(["foo1", "foo2"]);

    profile.setEntryLabel(0, "bar1");
    profile.setEntryLabel(1, "bar2");
    expect(profile.entryLabels.value).toEqual(["bar1", "bar2"]);

    profile.setEntryLabel(1, "");
    expect(profile.entryLabels.value).toEqual(["bar1", ""]);

    profile.setEntryLabel(0, "");
    expect(profile.entryLabels.value).toEqual(["", ""]);

    profile.setEntryLabel(0, undefined);
    profile.setEntryLabel(1, undefined);
    expect(profile.entryLabels.value).toEqual([undefined, undefined]);
  });

  it("added entry can not be manipulated from outside", done => {
    (async () => {
      const profile = new UserProfile();
      const newEntry = Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash");
      profile.addEntry(newEntry);
      expect(profile.getIdentities(0).length).toEqual(0);

      // manipulate entry reference that has been added before
      await newEntry.createIdentity();
      expect(newEntry.getIdentities().length).toEqual(1);

      // nothing hapenned to the profile
      expect(profile.getIdentities(0).length).toEqual(0);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be stored", done => {
    (async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt, keyring });

      await profile.storeIn(db);
      expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
      expect(await db.get("keyring", { asBuffer: false })).toEqual('{"entries":[]}');

      await db.close();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("clears database when storing", done => {
    (async () => {
      const db = levelup(MemDownConstructor<string, string>());

      await db.put("foo", "bar");

      const profile = new UserProfile();
      await profile.storeIn(db);

      await db
        .get("foo")
        .then(() => fail("get 'foo' promise must not reslve"))
        .catch(error => {
          expect(error.notFound).toBeTruthy();
        });

      await db.close();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be loaded from storage", done => {
    (async () => {
      const db = levelup(MemDownConstructor<string, string>());
      await db.put("created_at", "1985-04-12T23:20:50.521Z");
      await db.put("keyring", '{"entries":[]}');

      const profile = await UserProfile.loadFrom(db);
      expect(profile.createdAt).toEqual(new ReadonlyDate("1985-04-12T23:20:50.521Z"));

      await db.close();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("throws for non-existing entry index", done => {
    (async () => {
      const profile = new UserProfile();

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

      expect(() => profile.setEntryLabel(0, "foo")).toThrowError(/Entry of index 0 does not exist in keyring/);
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

  it("can sign and append signature", done => {
    (async () => {
      const createdAt = new ReadonlyDate(ReadonlyDate.now());
      const keyring = new Keyring();
      keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"));
      const mainIdentity = await keyring.getEntries()[0].createIdentity();
      const profile = new UserProfile({ createdAt, keyring });

      const fakeTransaction: SendTx = {
        chainId: "ethereum" as ChainId,
        signer: mainIdentity.pubkey,
        kind: TransactionKind.SEND,
        amount: {
          whole: 1,
          fractional: 12,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: new Uint8Array([0x00, 0x11, 0x22]) as AddressBytes,
      };

      const fakeCodec: TxCodec = {
        bytesToSign: (): SignableBytes => new Uint8Array([0xaa, 0xbb, 0xcc]) as SignableBytes,
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
      const nonce = new Long(0x11223344, 0x55667788) as Nonce;

      const signedTransaction = await profile.signTransaction(0, mainIdentity, fakeTransaction, fakeCodec, nonce);
      expect(signedTransaction.transaction).toEqual(fakeTransaction);
      expect(signedTransaction.primarySignature).toBeTruthy();
      expect(signedTransaction.primarySignature.nonce).toEqual(nonce);
      expect(signedTransaction.primarySignature.publicKey).toEqual(mainIdentity.pubkey);
      expect(signedTransaction.primarySignature.signature.length).toBeGreaterThan(0);
      expect(signedTransaction.otherSignatures).toEqual([]);

      const doubleSignedTransaction = await profile.appendSignature(0, mainIdentity, signedTransaction, fakeCodec, nonce);
      expect(doubleSignedTransaction.transaction).toEqual(fakeTransaction);
      expect(doubleSignedTransaction.primarySignature).toBeTruthy();
      expect(doubleSignedTransaction.primarySignature.nonce).toEqual(nonce);
      expect(doubleSignedTransaction.primarySignature.publicKey).toEqual(mainIdentity.pubkey);
      expect(doubleSignedTransaction.primarySignature.signature.length).toBeGreaterThan(0);
      expect(doubleSignedTransaction.otherSignatures.length).toEqual(1);
      expect(doubleSignedTransaction.otherSignatures[0].nonce).toEqual(nonce);
      expect(doubleSignedTransaction.otherSignatures[0].publicKey).toEqual(mainIdentity.pubkey);
      expect(doubleSignedTransaction.otherSignatures[0].signature.length).toBeGreaterThan(0);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
