import { ChainId } from "@iov/bcp";
import { Ed25519, Ed25519Keypair, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { HdPaths } from "./hdpaths";
import { Keyring, KeyringSerializationString } from "./keyring";
import { Ed25519HdWallet, Ed25519Wallet, Secp256k1HdWallet } from "./wallets";

const { fromHex } = Encoding;

async function makeRandomEd25519Keypair(): Promise<Ed25519Keypair> {
  return Ed25519.makeKeypair(Random.getBytes(32));
}

describe("Keyring", () => {
  const defaultChain = "chain123" as ChainId;
  const defaultMnemonic = "melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash";

  describe("constructor", () => {
    it("can be constructed", () => {
      const keyring = new Keyring();
      expect(keyring).toBeTruthy();
    });

    it("is empty after construction", () => {
      const keyring = new Keyring();
      expect(keyring.getWallets().length).toEqual(0);
    });

    it("can deserialize empty", () => {
      const keyring = new Keyring('{"formatVersion":1,"wallets":[]}' as KeyringSerializationString);
      expect(keyring).toBeTruthy();
      expect(keyring.getWallets().length).toEqual(0);
    });

    it("throws for unsupported format version", () => {
      const data = '{"formatVersion":123,"wallets":[]}' as KeyringSerializationString;
      expect(() => new Keyring(data)).toThrowError(/unsupported format version/i);
    });

    it("can deserialize one ed25519-hd wallet", () => {
      const keyring = new Keyring(
        `
        {
          "formatVersion": 1,
          "wallets": [
            {
              "implementationId": "ed25519-hd",
              "data": "{\\"formatVersion\\":2,\\"id\\":\\"f49h7gh34\\",\\"secret\\":\\"side ripple bachelor banner word swear buzz try situate rent desk carry scorpion uphold undo account pumpkin throw\\",\\"curve\\":\\"ed25519 seed\\",\\"identities\\":[]}"
            }
          ]
        }` as KeyringSerializationString,
      );

      expect(keyring.getWallets().length).toEqual(1);
      expect(keyring.getWallets()[0]).toEqual(jasmine.any(Ed25519HdWallet));
    });

    it("can deserialize one ed25519 wallet", () => {
      const keyring = new Keyring(
        '{"formatVersion": 1, "wallets": [{"implementationId":"ed25519", "data":"{ \\"formatVersion\\": 2, \\"id\\": \\"n3u04gh03h\\", \\"identities\\":[{\\"localIdentity\\": { \\"chainId\\": \\"barnet\\", \\"pubkey\\": { \\"algo\\": \\"ed25519\\", \\"data\\": \\"aabbccdd\\" }, \\"nickname\\": \\"foo\\" }, \\"privkey\\": \\"223322112233aabb\\"}] }"}]}' as KeyringSerializationString,
      );

      expect(keyring.getWallets().length).toEqual(1);
      expect(keyring.getWallets()[0]).toEqual(jasmine.any(Ed25519Wallet));
    });

    it("throws when deserializing a duplicate identity", () => {
      const serialization = `
        {
          "formatVersion": 1,
          "wallets": [
            {
              "implementationId":"ed25519",
              "data":"{ \\"formatVersion\\": 2, \\"id\\": \\"n3u04gh03h\\", \\"identities\\":[{\\"localIdentity\\": { \\"chainId\\": \\"barnet\\", \\"pubkey\\": { \\"algo\\": \\"ed25519\\", \\"data\\": \\"aabbccdd\\" }, \\"nickname\\": \\"foo\\" }, \\"privkey\\": \\"223322112233aabb\\"}] }"
            },
            {
              "implementationId":"ed25519",
              "data":"{ \\"formatVersion\\": 2, \\"id\\": \\"677657622\\", \\"identities\\":[{\\"localIdentity\\": { \\"chainId\\": \\"barnet\\", \\"pubkey\\": { \\"algo\\": \\"ed25519\\", \\"data\\": \\"aabbccdd\\" }, \\"nickname\\": \\"foo\\" }, \\"privkey\\": \\"223322112233aabb\\"}] }"
            }
          ]
        }` as KeyringSerializationString;

      expect(() => new Keyring(serialization)).toThrowError(/identity collision/i);
    });
  });

  describe("add", () => {
    it("can add one wallet", () => {
      const keyring = new Keyring();
      const wallet = Ed25519HdWallet.fromEntropy(
        fromHex("065a823769888cbc84e8455522f0e1a066447cb1120aa92e6ee251b74257a7bf"),
      );

      keyring.add(wallet);

      expect(keyring.getWallets().length).toEqual(1);
      // Ensure added wallet is not the same object, but a copy of it
      expect(keyring.getWallets()[0]).not.toBe(wallet);
    });

    it("can add and get multiple wallets", () => {
      const keyring = new Keyring();
      const wallet1 = Ed25519HdWallet.fromEntropy(fromHex("f7e7f1bbb327113a46fd3fa1020413de"));
      const wallet2 = Ed25519HdWallet.fromMnemonic(
        "flip hunt behind absorb blush proof hurry embody quantum start pencil rapid",
      );
      // Wallet 3 and 4 have the same seed. This is stupid but not the Keyring's problem
      // as long as no duplicate identity exists
      const otherMnemonic = "victory puppy sight pave absorb inform seat pear light enjoy begin face";
      const wallet3 = Ed25519HdWallet.fromMnemonic(otherMnemonic);
      const wallet4 = Ed25519HdWallet.fromMnemonic(otherMnemonic);

      keyring.add(wallet1);
      keyring.add(wallet2);
      keyring.add(wallet3);
      keyring.add(wallet4);

      expect(keyring.getWallets().length).toEqual(4);
      expect(keyring.getWallets()[0].id).toEqual(wallet1.id);
      expect(keyring.getWallets()[1].id).toEqual(wallet2.id);
      expect(keyring.getWallets()[2].id).toEqual(wallet3.id);
      expect(keyring.getWallets()[3].id).toEqual(wallet4.id);
    });

    it("supports all basic wallet types by default", () => {
      const keyring = new Keyring();
      keyring.add(new Ed25519Wallet());
      keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));
      keyring.add(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));

      expect(() => {
        const serialized = keyring.serialize();
        // tslint:disable-next-line:no-unused-expression
        new Keyring(serialized);
      }).not.toThrow();
    });

    it("throws when the same identity is added twice", async () => {
      const wallet1 = Ed25519HdWallet.fromMnemonic(defaultMnemonic);
      const wallet2 = Ed25519HdWallet.fromMnemonic(defaultMnemonic);
      await wallet1.createIdentity(defaultChain, HdPaths.iov(0));
      await wallet2.createIdentity(defaultChain, HdPaths.iov(0));

      const keyring = new Keyring();
      keyring.add(wallet1);
      expect(() => keyring.add(wallet2)).toThrowError(/identity collision/i);
    });
  });

  describe("createIdentity", () => {
    it("works", async () => {
      const keyring = new Keyring();
      const wallet = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));

      const newIdentity = await keyring.createIdentity(wallet.id, defaultChain, HdPaths.iov(0));

      expect(keyring.getWallets()[0].getIdentities()).toEqual([newIdentity]);
    });

    it("throws when the same identity is added twice", async () => {
      const keyring = new Keyring();
      const wallet1 = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));
      const wallet2 = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));

      await keyring.createIdentity(wallet1.id, defaultChain, HdPaths.iov(0));
      await keyring
        .createIdentity(wallet2.id, defaultChain, HdPaths.iov(0))
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/identity collision/i));
    });
  });

  describe("getAllIdentities", () => {
    it("works for no wallet", async () => {
      const keyring = new Keyring();
      expect(keyring.getAllIdentities()).toEqual([]);
    });

    it("works for one wallet", async () => {
      const keyring = new Keyring();
      const wallet = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));

      const identity1 = await keyring.createIdentity(wallet.id, defaultChain, HdPaths.iov(0));
      const identity2 = await keyring.createIdentity(wallet.id, defaultChain, HdPaths.iov(1));

      expect(keyring.getAllIdentities()).toEqual([identity1, identity2]);
    });

    it("works for two wallets", async () => {
      const keyring = new Keyring();
      const walletA = keyring.add(Ed25519HdWallet.fromMnemonic(defaultMnemonic));
      const walletB = keyring.add(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));

      const identityA1 = await keyring.createIdentity(walletA.id, defaultChain, HdPaths.iov(0));
      const identityA2 = await keyring.createIdentity(walletA.id, defaultChain, HdPaths.iov(1));
      const identityB1 = await keyring.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(0));
      const identityB2 = await keyring.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(1));
      const identityB3 = await keyring.createIdentity(walletB.id, defaultChain, HdPaths.ethereum(2));

      expect(keyring.getAllIdentities()).toEqual([
        identityA1,
        identityA2,
        identityB1,
        identityB2,
        identityB3,
      ]);
    });
  });

  describe("serialize", () => {
    it("can serialize empty", () => {
      const keyring = new Keyring();
      expect(keyring.serialize()).toEqual('{"formatVersion":1,"wallets":[]}');
    });

    it("can serialize one wallet", () => {
      const keyring = new Keyring();
      const wallet = Ed25519HdWallet.fromEntropy(fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"));
      keyring.add(wallet);

      expect(keyring.serialize()).toMatch(
        /^{"formatVersion":1,"wallets":\[{"implementationId":"ed25519-hd","data":"{.*}"}\]}$/,
      );
    });

    it("can serialize many wallets", () => {
      const keyring = new Keyring();

      for (const entropy of [
        fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"),
        fromHex("2a7e3f902279af82138f14f871badf8d92b33713eb6c7193"),
        fromHex("602c79484cf098bd4445ad45b5e6557d83ec743cebddb4cd"),
        fromHex("1124ef7ab681387eba8fdd93a0a88ec2f3326f2a6e5e967d"),
        fromHex("cd0e346ae5c714a1514562cb8ad5d4b5a2443dbbc5dd2b5b"),
        fromHex("e38dd5c066406668b51be00e8ad0276ed9dec967d95c2248"),
      ]) {
        keyring.add(Ed25519HdWallet.fromEntropy(entropy));
      }

      expect(keyring.serialize()).toMatch(
        /^{"formatVersion":1,"wallets":\[{"implementationId":"ed25519-hd","data":"{.*}"}(,{"implementationId":"ed25519-hd","data":"{.*}"}){5}\]}$/,
      );
    });

    it("can serialize and deserialize multiple wallets", async () => {
      const wallet1 = Ed25519HdWallet.fromEntropy(
        fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"),
      );
      const i1a = await wallet1.createIdentity(defaultChain, HdPaths.iov(0));
      const wallet2 = new Ed25519Wallet();
      const i2a = await wallet2.createIdentity(defaultChain, await makeRandomEd25519Keypair());
      const i2b = await wallet2.createIdentity(defaultChain, await makeRandomEd25519Keypair());
      const wallet3 = Ed25519HdWallet.fromEntropy(
        fromHex("2a7e3f902279af82138f14f871badf8d92b33713eb6c7193"),
      );
      const i3a = await wallet3.createIdentity(defaultChain, HdPaths.iov(0));
      const i3b = await wallet3.createIdentity(defaultChain, HdPaths.iov(1));
      const i3c = await wallet3.createIdentity(defaultChain, HdPaths.iov(2));
      const wallet4 = new Ed25519Wallet();
      const i4a = await wallet4.createIdentity(defaultChain, await makeRandomEd25519Keypair());
      const i4b = await wallet4.createIdentity(defaultChain, await makeRandomEd25519Keypair());
      const i4c = await wallet4.createIdentity(defaultChain, await makeRandomEd25519Keypair());
      const i4d = await wallet4.createIdentity(defaultChain, await makeRandomEd25519Keypair());

      const keyring = new Keyring();
      keyring.add(wallet1);
      keyring.add(wallet2);
      keyring.add(wallet3);
      keyring.add(wallet4);

      const serialized = keyring.serialize();

      const restored = new Keyring(serialized);
      expect(restored).toBeTruthy();

      // compare wallets

      expect(restored.getWallets().length).toEqual(4);
      expect(keyring.getWallets()[0]).toEqual(jasmine.any(Ed25519HdWallet));
      expect(keyring.getWallets()[0].getIdentities().length).toEqual(1);
      expect(keyring.getWallets()[1]).toEqual(jasmine.any(Ed25519Wallet));
      expect(keyring.getWallets()[1].getIdentities().length).toEqual(2);
      expect(keyring.getWallets()[2]).toEqual(jasmine.any(Ed25519HdWallet));
      expect(keyring.getWallets()[2].getIdentities().length).toEqual(3);
      expect(keyring.getWallets()[3]).toEqual(jasmine.any(Ed25519Wallet));
      expect(keyring.getWallets()[3].getIdentities().length).toEqual(4);

      // compare wallet content (via Identity equality)

      expect(keyring.getWallets()[0].getIdentities()[0]).toEqual(i1a);

      expect(keyring.getWallets()[1].getIdentities()[0]).toEqual(i2a);
      expect(keyring.getWallets()[1].getIdentities()[1]).toEqual(i2b);

      expect(keyring.getWallets()[2].getIdentities()[0]).toEqual(i3a);
      expect(keyring.getWallets()[2].getIdentities()[1]).toEqual(i3b);
      expect(keyring.getWallets()[2].getIdentities()[2]).toEqual(i3c);

      expect(keyring.getWallets()[3].getIdentities()[0]).toEqual(i4a);
      expect(keyring.getWallets()[3].getIdentities()[1]).toEqual(i4b);
      expect(keyring.getWallets()[3].getIdentities()[2]).toEqual(i4c);
      expect(keyring.getWallets()[3].getIdentities()[3]).toEqual(i4d);
    });
  });

  describe("clone", () => {
    it("can be cloned", () => {
      const original = new Keyring();
      const wallet = Ed25519HdWallet.fromEntropy(fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"));
      original.add(wallet);

      const clone = original.clone();
      expect(clone).not.toBe(original);
      expect(clone.serialize()).toEqual(original.serialize());
    });
  });
});
