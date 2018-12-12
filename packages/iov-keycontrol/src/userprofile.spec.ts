import levelup from "levelup";
import MemDownConstructor from "memdown";
import { ReadonlyDate } from "readonly-date";

import { Algorithm, ChainId, PostableBytes, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import {
  Address,
  Nonce,
  PrehashType,
  SendTransaction,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TokenTicker,
  TransactionId,
  TxCodec,
} from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { HdPaths } from "./hdpaths";
import { Keyring } from "./keyring";
import { UserProfile } from "./userprofile";
import { WalletId } from "./wallet";
import { Ed25519HdWallet, Secp256k1HdWallet } from "./wallets";

const { fromHex } = Encoding;

describe("UserProfile", () => {
  const defaultEncryptionPassword = "my super str0ng and super long password";

  it("can be constructed without arguments", () => {
    const profile = new UserProfile();
    expect(profile).toBeTruthy();
  });

  it("is safe against keyring manipulation", () => {
    const keyring = new Keyring();
    keyring.add(
      Ed25519HdWallet.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"),
    );
    const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
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
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.wallets.value.length).toEqual(0);
    }

    {
      const keyring = new Keyring();
      keyring.add(
        Ed25519HdWallet.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"),
      );
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.wallets.value.length).toEqual(1);
    }

    {
      const keyring = new Keyring();
      keyring.add(
        Ed25519HdWallet.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"),
      );
      keyring.add(
        Ed25519HdWallet.fromMnemonic(
          "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
        ),
      );
      keyring.add(
        Ed25519HdWallet.fromMnemonic(
          "degree tackle suggest window test behind mesh extra cover prepare oak script",
        ),
      );
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.wallets.value.length).toEqual(3);
    }
  });

  it("initial wallet labels work", () => {
    {
      const profile = new UserProfile();
      expect(profile.wallets.value.map(i => i.label)).toEqual([]);
    }

    {
      const wallet = Ed25519HdWallet.fromMnemonic(
        "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
      );
      wallet.setLabel("label 1");

      const keyring = new Keyring();
      keyring.add(wallet);
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.wallets.value.map(i => i.label)).toEqual(["label 1"]);
    }

    {
      const wallet1 = Ed25519HdWallet.fromMnemonic(
        "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
      );
      wallet1.setLabel("label 1");
      const wallet2 = Ed25519HdWallet.fromMnemonic(
        "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
      );
      wallet2.setLabel("");
      const wallet3 = Ed25519HdWallet.fromMnemonic(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      );
      wallet3.setLabel(undefined);

      const keyring = new Keyring();
      keyring.add(wallet1);
      keyring.add(wallet2);
      keyring.add(wallet3);
      const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
      expect(profile.wallets.value.map(i => i.label)).toEqual(["label 1", "", undefined]);
    }
  });

  it("can add wallets", () => {
    const profile = new UserProfile();
    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    const wallet2 = Ed25519HdWallet.fromMnemonic(
      "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
    );
    const wallet3 = Ed25519HdWallet.fromMnemonic(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
    );
    expect(profile.wallets.value.length).toEqual(0);
    expect(profile.wallets.value.map(i => i.label)).toEqual([]);
    profile.addWallet(wallet1);
    expect(profile.wallets.value.length).toEqual(1);
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined]);
    expect(profile.getIdentities(wallet1.id)).toBeTruthy();
    profile.addWallet(wallet2);
    profile.addWallet(wallet3);
    expect(profile.wallets.value.length).toEqual(3);
    expect(profile.wallets.value.map(i => i.label)).toEqual([undefined, undefined, undefined]);
    expect(profile.getIdentities(wallet1.id)).toBeTruthy();
    expect(profile.getIdentities(wallet2.id)).toBeTruthy();
    expect(profile.getIdentities(wallet3.id)).toBeTruthy();
  });

  it("returns wallet info when adding wallet", () => {
    const profile = new UserProfile();
    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    const wallet2 = Ed25519HdWallet.fromMnemonic(
      "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
    );
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
    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    const wallet2 = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    keyring.add(wallet1);
    keyring.add(wallet2);
    const profile = new UserProfile({ createdAt: new ReadonlyDate(ReadonlyDate.now()), keyring });
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

    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
    );
    profile.addWallet(wallet1);
    const id1 = wallet1.id;

    // make sure we can query the ids if we didn't save them from creation
    expect(profile.wallets.value.map(i => i.id)).toEqual([id1]);

    const wallet2 = Ed25519HdWallet.fromMnemonic(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
    );
    profile.addWallet(wallet2);
    const id2 = wallet2.id;

    // make sure we can query the ids if we didn't save them from creation
    expect(profile.wallets.value.map(i => i.id)).toEqual([id1, id2]);

    // set the labels
    profile.setWalletLabel(id1, "first");
    profile.setWalletLabel(id2, "second");
    expect(profile.wallets.value.map(i => i.label)).toEqual(["first", "second"]);

    // make some new ids
    await profile.createIdentity(id1, HdPaths.simpleAddress(0));
    const key = await profile.createIdentity(id2, HdPaths.simpleAddress(0));
    await profile.createIdentity(id2, HdPaths.simpleAddress(1));
    expect(profile.getIdentities(id1).length).toEqual(1);
    expect(profile.getIdentities(id2).length).toEqual(2);

    // set an identity label
    profile.setIdentityLabel(id2, key, "foobar");
    const labels = profile.getIdentities(id2).map(x => x.label);
    expect(labels).toEqual(["foobar", undefined]);
  });

  it("throws for non-existent id", () => {
    const profile = new UserProfile();

    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "perfect clump orphan margin memory amazing morning use snap skate erosion civil",
    );
    profile.addWallet(wallet1);

    const wallet2 = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );

    expect(() => profile.getIdentities(wallet2.id)).toThrowError(
      `Wallet of id '${wallet2.id}' does not exist in keyring`,
    );
    expect(() => profile.getIdentities("balloon" as WalletId)).toThrowError(
      /Wallet of id 'balloon' does not exist in keyring/,
    );
  });

  it("added wallet can not be manipulated from outside", async () => {
    const profile = new UserProfile();
    const newWallet = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    profile.addWallet(newWallet);
    expect(profile.getIdentities(newWallet.id).length).toEqual(0);

    // manipulate wallet reference that has been added before
    await newWallet.createIdentity(HdPaths.simpleAddress(0));
    expect(newWallet.getIdentities().length).toEqual(1);

    // nothing hapenned to the profile
    expect(profile.getIdentities(newWallet.id).length).toEqual(0);
  });

  it("can create identities with options", async () => {
    const profile = new UserProfile();
    const wallet = profile.addWallet(
      Secp256k1HdWallet.fromMnemonic(
        "special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling",
      ),
    );

    const path = [Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0)];
    const identityFromPath = await profile.createIdentity(wallet.id, path);

    expect(identityFromPath.pubkey.data).toEqual(
      fromHex(
        "04a7a8d79df7857bf25a3a389b0ecea83c5272181d2c062346b1c64e258589fce0f48fe3900d52ef9a034a35e671329bb65441d8e010484d3e4817578550448e99",
      ),
    );
  });

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

  it("can be stored", async () => {
    const db = levelup(MemDownConstructor<string, string>());

    const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
    const keyring = new Keyring();
    const profile = new UserProfile({ createdAt, keyring });

    await profile.storeIn(db, defaultEncryptionPassword);
    expect(await db.get("format_version", { asBuffer: false })).toEqual("1");
    expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
    expect(await db.get("keyring", { asBuffer: false })).toMatch(/^[-_/=a-zA-Z0-9+]+$/);

    await db.close();
  });

  it("clears database when storing", async () => {
    const db = levelup(MemDownConstructor<string, string>());

    await db.put("foo", "bar");

    const profile = new UserProfile();
    await profile.storeIn(db, defaultEncryptionPassword);

    await db
      .get("foo")
      .then(() => fail("get 'foo' promise must not reslve"))
      .catch(error => {
        expect(error.notFound).toBeTruthy();
      });

    await db.close();
  });

  it("stored in and loaded from storage", async () => {
    const db = levelup(MemDownConstructor<string, string>());

    const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
    const keyring = new Keyring();
    const original = new UserProfile({ createdAt, keyring });

    await original.storeIn(db, defaultEncryptionPassword);

    const restored = await UserProfile.loadFrom(db, defaultEncryptionPassword);

    expect(restored.createdAt).toEqual(original.createdAt);

    await db.close();
  });

  it("stored in and loaded from storage when containing special chars", async () => {
    const db = levelup(MemDownConstructor<string, string>());
    const wallet1 = Ed25519HdWallet.fromMnemonic(
      "degree tackle suggest window test behind mesh extra cover prepare oak script",
    );

    const original = new UserProfile();
    original.addWallet(wallet1);
    original.setWalletLabel(wallet1.id, "My secret 😛");

    await original.storeIn(db, defaultEncryptionPassword);
    const restored = await UserProfile.loadFrom(db, defaultEncryptionPassword);

    expect(restored.wallets.value).toEqual(original.wallets.value);

    await db.close();
  });

  it("fails when loading with wrong key", async () => {
    const db = levelup(MemDownConstructor<string, string>());

    const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
    const keyring = new Keyring();
    const original = new UserProfile({ createdAt, keyring });

    await original.storeIn(db, defaultEncryptionPassword);

    const otherEncryptionPassword = "something wrong";
    await UserProfile.loadFrom(db, otherEncryptionPassword)
      .then(() => fail("loading must not succeed"))
      .catch(error => expect(error).toMatch(/invalid usage/));

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
    db.put("format_version", "123");

    await UserProfile.loadFrom(db, defaultEncryptionPassword)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/unsupported format version/i));
  });

  it("throws for non-existing wallet id", async () => {
    const profile = new UserProfile();

    const fakeIdentity = {
      pubkey: { algo: Algorithm.Ed25519, data: new Uint8Array([0xaa]) as PublicKeyBytes },
    };
    const fakeTransaction: SendTransaction = {
      domain: "bcp",
      kind: "send",
      chainId: "ethereum" as ChainId,
      signer: fakeIdentity.pubkey,
      amount: {
        quantity: "1000000000000000012",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      recipient: "AABBCC" as Address,
    };
    const fakeSignedTransaction: SignedTransaction = {
      transaction: fakeTransaction,
      primarySignature: {
        nonce: new Int53(11) as Nonce,
        pubkey: fakeIdentity.pubkey,
        signature: new Uint8Array([]) as SignatureBytes,
      },
      otherSignatures: [],
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
      keyToAddress: (): Address => {
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
    expect(() => profile.setIdentityLabel(walletId, fakeIdentity, "foo")).toThrowError(
      /wallet of id 'bar' does not exist in keyring/i,
    );
    await profile
      .createIdentity(walletId, HdPaths.simpleAddress(0))
      .then(() => fail("Promise must not resolve"))
      .catch(error => expect(error).toMatch(/wallet of id 'bar' does not exist in keyring/i));
    await profile
      .signTransaction(walletId, fakeIdentity, fakeTransaction, fakeCodec, new Int53(12) as Nonce)
      .then(() => fail("Promise must not resolve"))
      .catch(error => expect(error).toMatch(/wallet of id 'bar' does not exist in keyring/i));
    await profile
      .appendSignature(walletId, fakeIdentity, fakeSignedTransaction, fakeCodec, new Int53(12) as Nonce)
      .then(() => fail("Promise must not resolve"))
      .catch(error => expect(error).toMatch(/wallet of id 'bar' does not exist in keyring/i));
  });

  it("can sign and append signature", async () => {
    const createdAt = new ReadonlyDate(ReadonlyDate.now());
    const keyring = new Keyring();
    const wallet = Ed25519HdWallet.fromMnemonic(
      "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash",
    );
    keyring.add(wallet);
    const mainIdentity = await keyring.getWallets()[0].createIdentity(HdPaths.simpleAddress(0));
    const profile = new UserProfile({ createdAt, keyring });

    const fakeTransaction: SendTransaction = {
      domain: "bcp",
      kind: "send",
      chainId: "ethereum" as ChainId,
      signer: mainIdentity.pubkey,
      amount: {
        quantity: "1000000000000000012",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
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
      keyToAddress: (): Address => {
        throw new Error("not implemented");
      },
      isValidAddress: (): boolean => {
        throw new Error("not implemented");
      },
    };
    const nonce = new Int53(0x112233445566) as Nonce;

    const signedTransaction = await profile.signTransaction(
      wallet.id,
      mainIdentity,
      fakeTransaction,
      fakeCodec,
      nonce,
    );
    expect(signedTransaction.transaction).toEqual(fakeTransaction);
    expect(signedTransaction.primarySignature).toBeTruthy();
    expect(signedTransaction.primarySignature.nonce).toEqual(nonce);
    expect(signedTransaction.primarySignature.pubkey).toEqual(mainIdentity.pubkey);
    expect(signedTransaction.primarySignature.signature.length).toBeGreaterThan(0);
    expect(signedTransaction.otherSignatures).toEqual([]);

    const doubleSignedTransaction = await profile.appendSignature(
      wallet.id,
      mainIdentity,
      signedTransaction,
      fakeCodec,
      nonce,
    );
    expect(doubleSignedTransaction.transaction).toEqual(fakeTransaction);
    expect(doubleSignedTransaction.primarySignature).toBeTruthy();
    expect(doubleSignedTransaction.primarySignature.nonce).toEqual(nonce);
    expect(doubleSignedTransaction.primarySignature.pubkey).toEqual(mainIdentity.pubkey);
    expect(doubleSignedTransaction.primarySignature.signature.length).toBeGreaterThan(0);
    expect(doubleSignedTransaction.otherSignatures.length).toEqual(1);
    expect(doubleSignedTransaction.otherSignatures[0].nonce).toEqual(nonce);
    expect(doubleSignedTransaction.otherSignatures[0].pubkey).toEqual(mainIdentity.pubkey);
    expect(doubleSignedTransaction.otherSignatures[0].signature.length).toBeGreaterThan(0);
  });
});
