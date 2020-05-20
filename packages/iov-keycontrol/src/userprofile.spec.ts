import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PostableBytes,
  PrehashType,
  PubkeyBytes,
  SendTransaction,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  SigningJob,
  TokenTicker,
  TransactionId,
  TxCodec,
} from "@iov/bcp";
import { Ed25519, Slip10RawIndex } from "@iov/crypto";
import { fromHex } from "@iov/encoding";
import levelup from "levelup";
import MemDownConstructor from "memdown";
import { ReadonlyDate } from "readonly-date";

import { HdPaths } from "./hdpaths";
import { Keyring } from "./keyring";
import userprofileData from "./testdata/userprofile.json";
import { UnexpectedFormatVersionError, UserProfile, UserProfileEncryptionKey } from "./userprofile";
import { WalletId } from "./wallet";
import { Ed25519HdWallet, Ed25519Wallet, Secp256k1HdWallet } from "./wallets";

/**
 * A possibly incomplete equality checker that tests as well as possible if two profiles contain
 * the same information. Equality on UserProfile is not well defined, so use with caution.
 */
function expectUserProfilesToEqual(lhs: UserProfile, rhs: UserProfile): void {
  // meta
  expect(lhs.createdAt).toEqual(rhs.createdAt);

  // wallets
  expect(lhs.wallets.value).toEqual(rhs.wallets.value);
  for (const { id } of rhs.wallets.value) {
    expect(lhs.printableSecret(id)).toEqual(rhs.printableSecret(id));
  }

  // identities
  expect(lhs.getAllIdentities()).toEqual(rhs.getAllIdentities());
  for (const identity of lhs.getAllIdentities()) {
    expect(lhs.getIdentityLabel(identity)).toEqual(rhs.getIdentityLabel(identity));
  }
}

describe("UserProfile", () => {
  const defaultChain = "chain123" as ChainId;
  const defaultMnemonic1 = "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash";
  const defaultMnemonic2 = "perfect clump orphan margin memory amazing morning use snap skate erosion civil";
  const defaultMnemonic3 = "judge edge effort prepare caught lawn mask yellow butter phone dragon more";
  const defaultEncryptionPassword = "my super str0ng and super long password";

  describe("deriveEncryptionKey", () => {
    it("works", async () => {
      const key = await UserProfile.deriveEncryptionKey("foobar");
      expect(key.formatVersion).toEqual(2);
      expect(key.data.length).toEqual(32);
    });

    it("can use a different supported version explicitly", async () => {
      const key = await UserProfile.deriveEncryptionKey("foobar", 1);
      expect(key.formatVersion).toEqual(1);
      expect(key.data.length).toEqual(32);
    });

    it("throws when trying to call with unsupported version", async () => {
      await UserProfile.deriveEncryptionKey("foobar", 42).then(
        () => fail("must not resolve"),
        error => expect(error).toMatch(/unsupported format version/i),
      );
    });
  });

  describe("loadFrom", () => {
    it("stored in and loaded from storage", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const original = new UserProfile({ createdAt: createdAt, keyring: keyring });

      await original.storeIn(db, defaultEncryptionPassword);

      const restored = await UserProfile.loadFrom(db, defaultEncryptionPassword);

      expectUserProfilesToEqual(restored, original);

      await db.close();
    });

    it("stored in and loaded from storage when containing special chars", async () => {
      const db = levelup(MemDownConstructor<string, string>());
      const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic3);

      const original = new UserProfile();
      original.addWallet(wallet1);
      original.setWalletLabel(wallet1.id, "My secret 😛");

      await original.storeIn(db, defaultEncryptionPassword);
      const restored = await UserProfile.loadFrom(db, defaultEncryptionPassword);

      expectUserProfilesToEqual(restored, original);

      await db.close();
    });

    it("fails when loading with wrong key", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const original = new UserProfile({ createdAt: createdAt, keyring: keyring });

      await original.storeIn(db, defaultEncryptionPassword);

      const otherEncryptionPassword = "something wrong";
      await UserProfile.loadFrom(db, otherEncryptionPassword).then(
        () => fail("loading must not succeed"),
        error => expect(error).toMatch(/ciphertext cannot be decrypted using that key/i),
      );

      await db.close();
    });

    it("throws when loading a profile with no format version", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      await UserProfile.loadFrom(db, defaultEncryptionPassword)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/key not found in database/i));
    });

    it("throws when loading a profile with unsupported format version", async () => {
      const db = levelup(MemDownConstructor<string, string>());
      await db.put("format_version", "123");

      await UserProfile.loadFrom(db, defaultEncryptionPassword)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/unsupported format version/i));
    });

    it("works for password and encryption key", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const original = new UserProfile({ createdAt: createdAt, keyring: keyring });
      original.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));

      await original.storeIn(db, defaultEncryptionPassword);

      const encryptionKey = await UserProfile.deriveEncryptionKey(defaultEncryptionPassword);
      const fromEncryptionKey = await UserProfile.loadFrom(db, encryptionKey);
      const fromPassword = await UserProfile.loadFrom(db, defaultEncryptionPassword);

      expectUserProfilesToEqual(fromEncryptionKey, fromPassword);

      await db.close();
    });

    it("can load format version 1 profile with password", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      // Storage data created with IOV-Core 0.14 cli
      await db.put("format_version", userprofileData.serializations.version1.db.format_version);
      await db.put("created_at", userprofileData.serializations.version1.db.created_at);
      await db.put("keyring", userprofileData.serializations.version1.db.keyring);

      const loaded = await UserProfile.loadFrom(db, userprofileData.serializations.version1.password);

      expect(loaded.createdAt).toEqual(new ReadonlyDate("2019-05-27T16:40:44.522Z"));
      expect(loaded.wallets.value.length).toEqual(2);
      expect(loaded.wallets.value[0].label).toEqual("ed");
      expect(loaded.wallets.value[1].label).toEqual("secp");
      expect(loaded.printableSecret(loaded.wallets.value[0].id)).toEqual(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      );
      expect(loaded.printableSecret(loaded.wallets.value[1].id)).toEqual(
        "organ wheat manage mirror wish truly tool trumpet since equip flight bracket",
      );
      expect(loaded.getAllIdentities().length).toEqual(2);
      expect(loaded.getAllIdentities().map(identity => identity.chainId)).toEqual([
        "test-chain-GGzjc2" as ChainId,
        "test-chain-GGzjc2" as ChainId,
      ]);

      await db.close();
    });

    it("can load format version 1 profile with key", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      // Storage data created with IOV-Core 0.14 cli
      await db.put("format_version", userprofileData.serializations.version1.db.format_version);
      await db.put("created_at", userprofileData.serializations.version1.db.created_at);
      await db.put("keyring", userprofileData.serializations.version1.db.keyring);

      let loaded: UserProfile;
      const key = await UserProfile.deriveEncryptionKey(userprofileData.serializations.version1.password);
      try {
        loaded = await UserProfile.loadFrom(db, key);
      } catch (error) {
        if (error instanceof UnexpectedFormatVersionError) {
          const key2 = await UserProfile.deriveEncryptionKey(
            userprofileData.serializations.version1.password,
            error.expectedFormatVersion,
          );
          loaded = await UserProfile.loadFrom(db, key2);
        } else {
          throw error;
        }
      }

      expect(loaded.createdAt).toEqual(new ReadonlyDate("2019-05-27T16:40:44.522Z"));
      expect(loaded.wallets.value.length).toEqual(2);
      expect(loaded.wallets.value[0].label).toEqual("ed");
      expect(loaded.wallets.value[1].label).toEqual("secp");
      expect(loaded.printableSecret(loaded.wallets.value[0].id)).toEqual(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      );
      expect(loaded.printableSecret(loaded.wallets.value[1].id)).toEqual(
        "organ wheat manage mirror wish truly tool trumpet since equip flight bracket",
      );
      expect(loaded.getAllIdentities().length).toEqual(2);
      expect(loaded.getAllIdentities().map(identity => identity.chainId)).toEqual([
        "test-chain-GGzjc2" as ChainId,
        "test-chain-GGzjc2" as ChainId,
      ]);

      await db.close();
    });

    it("can load format version 2 profile with password", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      // Storage data created with locally modified version of IOV-Core 0.14 cli
      await db.put("format_version", userprofileData.serializations.version2.db.format_version);
      await db.put("created_at", userprofileData.serializations.version2.db.created_at);
      await db.put("keyring", userprofileData.serializations.version2.db.keyring);

      const loaded = await UserProfile.loadFrom(db, userprofileData.serializations.version2.password);

      expect(loaded.createdAt).toEqual(new ReadonlyDate("2019-05-27T17:00:08.193Z"));
      expect(loaded.wallets.value.length).toEqual(2);
      expect(loaded.wallets.value[0].label).toEqual("ed");
      expect(loaded.wallets.value[1].label).toEqual("secp");
      expect(loaded.printableSecret(loaded.wallets.value[0].id)).toEqual(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      );
      expect(loaded.printableSecret(loaded.wallets.value[1].id)).toEqual(
        "organ wheat manage mirror wish truly tool trumpet since equip flight bracket",
      );
      expect(loaded.getAllIdentities().length).toEqual(2);
      expect(loaded.getAllIdentities().map(identity => identity.chainId)).toEqual([
        "test-chain-GGzjc2" as ChainId,
        "test-chain-GGzjc2" as ChainId,
      ]);

      await db.close();
    });

    it("can load format version 2 profile with key", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      // Storage data created with locally modified version of IOV-Core 0.14 cli
      await db.put("format_version", userprofileData.serializations.version2.db.format_version);
      await db.put("created_at", userprofileData.serializations.version2.db.created_at);
      await db.put("keyring", userprofileData.serializations.version2.db.keyring);

      let loaded: UserProfile;
      const key = await UserProfile.deriveEncryptionKey(userprofileData.serializations.version2.password);
      try {
        loaded = await UserProfile.loadFrom(db, key);
      } catch (error) {
        if (error instanceof UnexpectedFormatVersionError) {
          const key2 = await UserProfile.deriveEncryptionKey(
            userprofileData.serializations.version2.password,
            error.expectedFormatVersion,
          );
          loaded = await UserProfile.loadFrom(db, key2);
        } else {
          throw error;
        }
      }

      expect(loaded.createdAt).toEqual(new ReadonlyDate("2019-05-27T17:00:08.193Z"));
      expect(loaded.wallets.value.length).toEqual(2);
      expect(loaded.wallets.value[0].label).toEqual("ed");
      expect(loaded.wallets.value[1].label).toEqual("secp");
      expect(loaded.printableSecret(loaded.wallets.value[0].id)).toEqual(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      );
      expect(loaded.printableSecret(loaded.wallets.value[1].id)).toEqual(
        "organ wheat manage mirror wish truly tool trumpet since equip flight bracket",
      );
      expect(loaded.getAllIdentities().length).toEqual(2);
      expect(loaded.getAllIdentities().map(identity => identity.chainId)).toEqual([
        "test-chain-GGzjc2" as ChainId,
        "test-chain-GGzjc2" as ChainId,
      ]);

      await db.close();
    });

    it("throws when given an encryption key in the wrong format version", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const original = new UserProfile({ createdAt: createdAt, keyring: keyring });

      await original.storeIn(db, defaultEncryptionPassword);

      const encryptionKey: UserProfileEncryptionKey = {
        formatVersion: 42,
        data: fromHex("0000000000000000000000000000000000000000000000000000000000000000"),
      };
      await UserProfile.loadFrom(db, encryptionKey)
        .then(() => fail("must not resolve"))
        .catch(error => {
          if (!(error instanceof UnexpectedFormatVersionError)) {
            throw new Error("Expected an UnexpectedFormatVersionError");
          }
          expect(error.expectedFormatVersion).toEqual(2);
          expect(error.actualFormatVersion).toEqual(42);
          expect(error.message).toMatch(/got encryption key of unexpected format/i);
        });

      await db.close();
    });
  });

  it("can be constructed without arguments", () => {
    const profile = new UserProfile();
    expect(profile).toBeTruthy();
  });

  it("is safe against keyring manipulation", () => {
    const keyring = new Keyring();
    keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
    const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
    expect(profile.wallets.value.length).toEqual(1);

    // manipulate external keyring
    keyring.add(
      Ed25519HdWallet.fromMnemonic(
        "seed brass ranch destroy peasant upper steak toy hood cliff cabin kingdom",
      ),
    );

    // profile remains unchanged
    expect(profile.wallets.value.length).toEqual(1);
  });

  it("can be locked", () => {
    const profile = new UserProfile();
    expect(profile.locked.value).toEqual(false);
    profile.lock();
    expect(profile.locked.value).toEqual(true);
  });

  it("initial wallet count works", () => {
    {
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
      expect(profile.wallets.value.length).toEqual(0);
    }

    {
      const keyring = new Keyring();
      keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
      expect(profile.wallets.value.length).toEqual(1);
    }

    {
      const keyring = new Keyring();
      keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
      keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic2));
      keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic3));
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
      expect(profile.wallets.value.length).toEqual(3);
    }
  });

  it("initial wallet labels work", () => {
    {
      const profile = new UserProfile();
      expect(profile.wallets.value.map(i => i.label)).toEqual([]);
    }

    {
      const wallet = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
      wallet.setLabel("label 1");

      const keyring = new Keyring();
      keyring.add(wallet);
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
      expect(profile.wallets.value.map(i => i.label)).toEqual(["label 1"]);
    }

    {
      const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
      wallet1.setLabel("label 1");
      const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic2);
      wallet2.setLabel("");
      const wallet3 = Ed25519HdWallet.fromMnemonic(defaultMnemonic3);
      wallet3.setLabel(undefined);

      const keyring = new Keyring();
      keyring.add(wallet1);
      keyring.add(wallet2);
      keyring.add(wallet3);
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
      expect(profile.wallets.value.map(i => i.label)).toEqual(["label 1", "", undefined]);
    }
  });

  it("can add different kinds of wallets", () => {
    const profile = new UserProfile();
    const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
    const wallet2 = Secp256k1HdWallet.fromMnemonic(defaultMnemonic2);
    const wallet3 = new Ed25519Wallet();
    expect(profile.wallets.value.length).toEqual(0);
    expect(profile.wallets.value.map(i => i.label)).toEqual([]);
    profile.addWallet(wallet1);
    expect(profile.wallets.value.length).toEqual(1);
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined]);
    expect(profile.getIdentities(wallet1.id)).toEqual([]);
    profile.addWallet(wallet2);
    profile.addWallet(wallet3);
    expect(profile.wallets.value.length).toEqual(3);
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined, undefined, undefined]);
    expect(profile.getIdentities(wallet1.id)).toEqual([]);
    expect(profile.getIdentities(wallet2.id)).toEqual([]);
    expect(profile.getIdentities(wallet3.id)).toEqual([]);
  });

  it("returns wallet info when adding wallet", () => {
    const profile = new UserProfile();
    const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
    const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic2);
    wallet2.setLabel("my-label");

    const walletInfo1 = profile.addWallet(wallet1);
    expect(walletInfo1.id).toEqual(wallet1.id);
    expect(walletInfo1.label).toEqual(undefined);

    const walletInfo2 = profile.addWallet(wallet2);
    expect(walletInfo2.id).toEqual(wallet2.id);
    expect(walletInfo2.label).toEqual("my-label");
  });

  it("can update wallet labels", () => {
    const keyring = new Keyring();
    const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
    const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
    keyring.add(wallet1);
    keyring.add(wallet2);
    const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring: keyring });
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined, undefined]);

    profile.setWalletLabel(wallet1.id, "foo1");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["foo1", undefined]);

    profile.setWalletLabel(wallet2.id, "foo2");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["foo1", "foo2"]);

    profile.setWalletLabel(wallet1.id, "bar1");
    profile.setWalletLabel(wallet2.id, "bar2");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["bar1", "bar2"]);

    profile.setWalletLabel(wallet2.id, "");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["bar1", ""]);

    profile.setWalletLabel(wallet1.id, "");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["", ""]);

    profile.setWalletLabel(wallet1.id, undefined);
    profile.setWalletLabel(wallet2.id, undefined);
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined, undefined]);
  });

  it("accessors also work with id instead of number", async () => {
    const profile = new UserProfile();

    const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic2);
    profile.addWallet(wallet1);

    // make sure we can query the ids if we didn't save them from creation
    expect(profile.wallets.value.map(i => i.id)).toEqual([wallet1.id]);

    const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic3);
    profile.addWallet(wallet2);

    // make sure we can query the ids if we didn't save them from creation
    expect(profile.wallets.value.map(i => i.id)).toEqual([wallet1.id, wallet2.id]);

    // set the labels
    profile.setWalletLabel(wallet1.id, "first");
    profile.setWalletLabel(wallet2.id, "second");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["first", "second"]);

    // make some new ids
    await profile.createIdentity(wallet1.id, defaultChain, HdPaths.iov(0));
    const key = await profile.createIdentity(wallet2.id, defaultChain, HdPaths.iov(0));
    await profile.createIdentity(wallet2.id, defaultChain, HdPaths.iov(1));
    expect(profile.getIdentities(wallet1.id).length).toEqual(1);
    expect(profile.getIdentities(wallet2.id).length).toEqual(2);

    // set an identity label
    profile.setIdentityLabel(key, "foobar");
    const labels = profile.getIdentities(wallet2.id).map(identity => {
      return profile.getIdentityLabel(identity);
    });
    expect(labels).toEqual(["foobar", undefined]);
  });

  it("throws for non-existent id", () => {
    const profile = new UserProfile();

    const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic2);
    profile.addWallet(wallet1);

    const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);

    expect(() => profile.getIdentities(wallet2.id)).toThrowError(
      `Wallet of id '${wallet2.id}' does not exist in keyring`,
    );
    expect(() => profile.getIdentities("balloon" as WalletId)).toThrowError(
      /Wallet of id 'balloon' does not exist in keyring/,
    );
  });

  it("added wallet can not be manipulated from outside", async () => {
    const profile = new UserProfile();
    const newWallet = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
    profile.addWallet(newWallet);
    expect(profile.getIdentities(newWallet.id).length).toEqual(0);

    // manipulate wallet reference that has been added before
    await newWallet.createIdentity(defaultChain, HdPaths.iov(0));
    expect(newWallet.getIdentities().length).toEqual(1);

    // nothing hapenned to the profile
    expect(profile.getIdentities(newWallet.id).length).toEqual(0);
  });

  describe("createIdentity", () => {
    it("can create Ed25519HdWallet identities with options", async () => {
      // Test 1 from https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md#test-cases
      //
      // Stellar public keys can be converted to raw ed25519 pubkeys as follows
      // $ yarn add stellar-sdk
      // $ node
      // > const { Keypair } = require("stellar-sdk")
      // > Keypair.fromPublicKey("GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6").rawPublicKey().toString("hex")

      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "illness spike retreat truth genius clock brain pass fit cave bargain toe",
        ),
      );

      // m/44'/148'/0'
      const identity = await profile.createIdentity(wallet.id, defaultChain, [
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(148),
        Slip10RawIndex.hardened(0),
      ]);

      expect(identity.pubkey.data).toEqual(
        fromHex("e3726830a0b60cb5f52c844cffcd4eed65eba5c155e89b26411562724e71e544"),
      );
    });

    it("can create Secp256k1HdWallet identities with options", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Secp256k1HdWallet.fromMnemonic(
          "special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling",
        ),
      );

      const identity = await profile.createIdentity(wallet.id, defaultChain, [
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
      ]);

      expect(identity.pubkey.data).toEqual(
        fromHex(
          "04a7a8d79df7857bf25a3a389b0ecea83c5272181d2c062346b1c64e258589fce0f48fe3900d52ef9a034a35e671329bb65441d8e010484d3e4817578550448e99",
        ),
      );
    });

    it("can create Ed25519Wallet identities with options", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(new Ed25519Wallet());

      // TEST 1 from https://tools.ietf.org/html/rfc8032#section-7.1)
      const keypair = await Ed25519.makeKeypair(
        fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
      );
      const identity = await profile.createIdentity(wallet.id, defaultChain, keypair);

      expect(identity.pubkey.data).toEqual(
        fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
      );
    });
  });

  describe("identityExists", () => {
    const somePath = [Slip10RawIndex.hardened(2), Slip10RawIndex.hardened(3), Slip10RawIndex.hardened(4)];

    it("returns false for non-existing identity", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
      expect(await profile.identityExists(wallet.id, defaultChain, somePath)).toEqual(false);
    });

    it("returns true for existing identity", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
      await profile.createIdentity(wallet.id, defaultChain, somePath);
      expect(await profile.identityExists(wallet.id, defaultChain, somePath)).toEqual(true);
    });

    it("throws for non-existing wallets", async () => {
      const wallet = Ed25519HdWallet.fromMnemonic(defaultMnemonic1);
      const profile = new UserProfile();

      await profile.identityExists(wallet.id, defaultChain, somePath).then(
        () => fail("must not resolve"),
        error => expect(error).toMatch(/wallet of id '.+' does not exist in keyring/i),
      );
    });
  });

  describe("getAllIdentities", () => {
    it("works for no wallet", async () => {
      const profile = new UserProfile();
      expect(profile.getAllIdentities()).toEqual([]);
    });

    it("works for one wallet", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));

      const identity1 = await profile.createIdentity(wallet.id, defaultChain, HdPaths.iov(0));
      const identity2 = await profile.createIdentity(wallet.id, defaultChain, HdPaths.iov(1));

      expect(profile.getAllIdentities()).toEqual([identity1, identity2]);
    });

    it("works for two wallets", async () => {
      const profile = new UserProfile();
      const walletA = profile.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
      const walletB = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic1));

      const identityA1 = await profile.createIdentity(walletA.id, defaultChain, HdPaths.iov(0));
      const identityA2 = await profile.createIdentity(walletA.id, defaultChain, HdPaths.iov(1));
      const identityB1 = await profile.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(0));
      const identityB2 = await profile.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(1));
      const identityB3 = await profile.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(2));

      expect(profile.getAllIdentities()).toEqual([
        identityA1,
        identityA2,
        identityB1,
        identityB2,
        identityB3,
      ]);
    });
  });

  describe("printableSecret", () => {
    it("can export a printable secret for a wallet", () => {
      const profile = new UserProfile();
      const walletInfo = profile.addWallet(
        Secp256k1HdWallet.fromMnemonic(
          "insect spirit promote illness clean damp dash divorce emerge elbow kangaroo enroll",
        ),
      );
      expect(profile.printableSecret(walletInfo.id)).toEqual(
        "insect spirit promote illness clean damp dash divorce emerge elbow kangaroo enroll",
      );
    });
  });

  describe("storeIn", () => {
    it("can be stored with password", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt: createdAt, keyring: keyring });

      await profile.storeIn(db, defaultEncryptionPassword);
      expect(await db.get("format_version", { asBuffer: false })).toEqual("2");
      expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
      expect(await db.get("keyring", { asBuffer: false })).toMatch(/^[-_/=a-zA-Z0-9+]+$/);

      await db.close();
    });

    it("can be stored with encryption key", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt: createdAt, keyring: keyring });

      const encryptionKey = await UserProfile.deriveEncryptionKey(defaultEncryptionPassword);
      await profile.storeIn(db, encryptionKey);
      expect(await db.get("format_version", { asBuffer: false })).toEqual("2");
      expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
      expect(await db.get("keyring", { asBuffer: false })).toMatch(/^[-_/=a-zA-Z0-9+]+$/);

      await db.close();
    });

    it("throws when storing with format version other than latest", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring();
      const profile = new UserProfile({ createdAt: createdAt, keyring: keyring });

      const encryptionKey: UserProfileEncryptionKey = {
        formatVersion: 42,
        data: fromHex("0000000000000000000000000000000000000000000000000000000000000000"),
      };
      await profile
        .storeIn(db, encryptionKey)
        .then(() => fail("must not resolve"))
        .catch(error => {
          if (!(error instanceof UnexpectedFormatVersionError)) {
            throw new Error("Expected an UnexpectedFormatVersionError");
          }
          expect(error.expectedFormatVersion).toEqual(2);
          expect(error.actualFormatVersion).toEqual(42);
          expect(error.message).toMatch(/got encryption key of unexpected format/i);
        });

      await db.close();
    });

    it("clears database when storing", async () => {
      const db = levelup(MemDownConstructor<string, string>());

      await db.put("foo", "bar");

      const profile = new UserProfile();
      await profile.storeIn(db, defaultEncryptionPassword);

      await db
        .get("foo")
        .then(() => fail("get 'foo' promise must not resolve"))
        .catch(error => expect(error.notFound).toBeTruthy());

      await db.close();
    });
  });

  it("throws for non-existing wallet id", async () => {
    const profile = new UserProfile();
    const chainId = "ethereum" as ChainId;
    const fakeIdentity = {
      chainId: chainId,
      pubkey: { algo: Algorithm.Ed25519, data: new Uint8Array([0xaa]) as PubkeyBytes },
    };
    const fakeTransaction: SendTransaction = {
      kind: "bcp/send",
      chainId: chainId,
      amount: {
        quantity: "1000000000000000012",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      sender: "DDEEFF" as Address,
      recipient: "AABBCC" as Address,
    };
    const fakeSignedTransaction: SignedTransaction = {
      transaction: fakeTransaction,
      signatures: [
        {
          nonce: 11 as Nonce,
          pubkey: fakeIdentity.pubkey,
          signature: new Uint8Array([]) as SignatureBytes,
        },
      ],
    };

    const fakeCodec: TxCodec = {
      bytesToSign: (): SigningJob => {
        throw new Error("not implemented");
      },
      bytesToPost: (): PostableBytes => {
        throw new Error("not implemented");
      },
      identifier: (): TransactionId => {
        throw new Error("not implemented");
      },
      parseBytes: (): SignedTransaction => {
        throw new Error("not implemented");
      },
      identityToAddress: (): Address => {
        throw new Error("not implemented");
      },
      isValidAddress: (): boolean => {
        throw new Error("not implemented");
      },
    };

    // wallet of id 'bar' does not exist
    const walletId = "bar" as WalletId;

    expect(() => profile.setWalletLabel(walletId, "foo")).toThrowError(
      /wallet of id 'bar' does not exist in keyring/i,
    );
    expect(() => profile.getIdentities(walletId)).toThrowError(
      /wallet of id 'bar' does not exist in keyring/i,
    );
    expect(() => profile.setIdentityLabel(fakeIdentity, "foo")).toThrowError(
      /No wallet for identity '{"chainId":"ethereum","pubkey":{"algo":"ed25519","data":{"0":170}}}' found in keyring/,
    );
    await profile
      .createIdentity(walletId, defaultChain, HdPaths.iov(0))
      .then(() => fail("Promise must not resolve"))
      .catch(error => expect(error).toMatch(/wallet of id 'bar' does not exist in keyring/i));
    await profile
      .signTransaction(fakeIdentity, fakeTransaction, fakeCodec, 12 as Nonce)
      .then(() => fail("Promise must not resolve"))
      .catch(error =>
        expect(error).toMatch(
          /No wallet for identity '{"chainId":"ethereum","pubkey":{"algo":"ed25519","data":{"0":170}}}' found in keyring/,
        ),
      );
    await profile
      .appendSignature(fakeIdentity, fakeSignedTransaction, fakeCodec, 12 as Nonce)
      .then(() => fail("Promise must not resolve"))
      .catch(error =>
        expect(error).toMatch(
          /No wallet for identity '{"chainId":"ethereum","pubkey":{"algo":"ed25519","data":{"0":170}}}' found in keyring/,
        ),
      );
  });

  it("can sign and append signature", async () => {
    const createdAt = new ReadonlyDate(ReadonlyDate.now());
    const keyring = new Keyring();
    const wallet = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic1));
    const mainIdentity = await keyring.createIdentity(wallet.id, defaultChain, HdPaths.iov(0));
    const profile = new UserProfile({ createdAt: createdAt, keyring: keyring });

    const fakeTransaction: SendTransaction = {
      kind: "bcp/send",
      chainId: "ethereum" as ChainId,
      amount: {
        quantity: "1000000000000000012",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      sender: "DDEEFF" as Address,
      recipient: "AABBCC" as Address,
    };

    const fakeCodec: TxCodec = {
      bytesToSign: (): SigningJob => {
        return {
          bytes: new Uint8Array([0xaa, 0xbb, 0xcc]) as SignableBytes,
          prehashType: PrehashType.Sha512,
        };
      },
      bytesToPost: (): PostableBytes => {
        throw new Error("not implemented");
      },
      identifier: (): TransactionId => {
        throw new Error("not implemented");
      },
      parseBytes: (): SignedTransaction => {
        throw new Error("not implemented");
      },
      identityToAddress: (): Address => {
        throw new Error("not implemented");
      },
      isValidAddress: (): boolean => {
        throw new Error("not implemented");
      },
    };
    const nonce = 0x112233445566 as Nonce;

    const signedTransaction = await profile.signTransaction(mainIdentity, fakeTransaction, fakeCodec, nonce);
    expect(signedTransaction.transaction).toEqual(fakeTransaction);
    expect(signedTransaction.signatures.length).toEqual(1);
    expect(signedTransaction.signatures[0]).toBeTruthy();
    expect(signedTransaction.signatures[0].nonce).toEqual(nonce);
    expect(signedTransaction.signatures[0].pubkey).toEqual(mainIdentity.pubkey);
    expect(signedTransaction.signatures[0].signature.length).toBeGreaterThan(0);

    const doubleSignedTransaction = await profile.appendSignature(
      mainIdentity,
      signedTransaction,
      fakeCodec,
      nonce,
    );
    expect(doubleSignedTransaction.transaction).toEqual(fakeTransaction);
    expect(doubleSignedTransaction.signatures.length).toEqual(2);
    expect(doubleSignedTransaction.signatures[0]).toBeTruthy();
    expect(doubleSignedTransaction.signatures[0].nonce).toEqual(nonce);
    expect(doubleSignedTransaction.signatures[0].pubkey).toEqual(mainIdentity.pubkey);
    expect(doubleSignedTransaction.signatures[0].signature.length).toBeGreaterThan(0);
    expect(doubleSignedTransaction.signatures[1].nonce).toEqual(nonce);
    expect(doubleSignedTransaction.signatures[1].pubkey).toEqual(mainIdentity.pubkey);
    expect(doubleSignedTransaction.signatures[1].signature.length).toBeGreaterThan(0);
  });
});
