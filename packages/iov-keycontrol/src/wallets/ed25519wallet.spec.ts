import { Algorithm, ChainId, PrehashType, PubkeyBytes, SignableBytes } from "@iov/bcp";
import { Ed25519Keypair, Sha256, Sha512 } from "@iov/crypto";
import { fromHex, toHex } from "@iov/encoding";

import { WalletSerializationString } from "../wallet";
import { Ed25519Wallet } from "./ed25519wallet";

describe("Ed25519Wallet", () => {
  const defaultChain = "chain123" as ChainId;
  const defaultKeypair = new Ed25519Keypair(
    fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
    fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
  );

  it("can be constructed", () => {
    const wallet = new Ed25519Wallet();
    expect(wallet).toBeTruthy();
  });

  it("is empty after construction", () => {
    const wallet = new Ed25519Wallet();
    expect(wallet.label.value).toBeUndefined();
    expect(wallet.getIdentities().length).toEqual(0);
  });

  it("can have a label", () => {
    const wallet = new Ed25519Wallet();
    expect(wallet.label.value).toBeUndefined();

    wallet.setLabel("foo");
    expect(wallet.label.value).toEqual("foo");

    wallet.setLabel(undefined);
    expect(wallet.label.value).toBeUndefined();
  });

  describe("previewIdentity", () => {
    it("works", async () => {
      const wallet = new Ed25519Wallet();
      const newIdentity = await wallet.previewIdentity(defaultChain, defaultKeypair);
      expect(newIdentity).toEqual({
        chainId: defaultChain,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: defaultKeypair.pubkey as PubkeyBytes,
        },
      });

      // preview identity not persisted
      expect(wallet.getIdentities()).toEqual([]);
    });
  });

  it("can create an identity", async () => {
    const wallet = new Ed25519Wallet();
    const newIdentity = await wallet.createIdentity(defaultChain, defaultKeypair);
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(newIdentity.pubkey.data).toEqual(defaultKeypair.pubkey);
  });

  it("can create multiple identities", async () => {
    // keypairs from https://tools.ietf.org/html/draft-irtf-cfrg-eddsa-08#section-7.1
    const keypair1 = new Ed25519Keypair(
      fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
      fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
    );
    const keypair2 = new Ed25519Keypair(
      fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"),
      fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"),
    );
    const keypair3 = new Ed25519Keypair(
      fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"),
      fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"),
    );
    const keypair4 = new Ed25519Keypair(
      fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5"),
      fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"),
    );

    const wallet = new Ed25519Wallet();
    const newIdentity1 = await wallet.createIdentity(defaultChain, keypair1);
    const newIdentity2 = await wallet.createIdentity(defaultChain, keypair2);
    const newIdentity3 = await wallet.createIdentity(defaultChain, keypair3);
    const newIdentity4 = await wallet.createIdentity(defaultChain, keypair4);

    // all pubkeys must be different
    const pubkeySet = new Set(
      [newIdentity1, newIdentity2, newIdentity3, newIdentity4].map(i => toHex(i.pubkey.data)),
    );
    expect(pubkeySet.size).toEqual(4);

    expect(wallet.getIdentities().length).toEqual(4);

    const firstIdentity = wallet.getIdentities()[0];
    expect(newIdentity1.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity1.pubkey.data).toEqual(firstIdentity.pubkey.data);

    const lastIdentity = wallet.getIdentities()[3];
    expect(newIdentity4.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
    expect(newIdentity4.pubkey.data).toEqual(lastIdentity.pubkey.data);
  });

  it("can create different identities with the same keypair", async () => {
    const wallet = new Ed25519Wallet();
    const keypair = new Ed25519Keypair(
      fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
      fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
    );
    await wallet.createIdentity("chain1" as ChainId, keypair);
    await wallet.createIdentity("chain2" as ChainId, keypair);

    const identities = wallet.getIdentities();
    expect(identities.length).toEqual(2);
    expect(identities[0].chainId).toEqual("chain1");
    expect(identities[1].chainId).toEqual("chain2");
    expect(identities[0].pubkey).toEqual(identities[1].pubkey);
  });

  it("throws when adding the same identity twice", async () => {
    const wallet = new Ed25519Wallet();
    await wallet.createIdentity(defaultChain, defaultKeypair);

    await wallet
      .createIdentity(defaultChain, defaultKeypair)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/ID collision/i));
  });

  it("can set, change and unset an identity label", async () => {
    const wallet = new Ed25519Wallet();
    const newIdentity = await wallet.createIdentity(defaultChain, defaultKeypair);
    expect(wallet.getIdentityLabel(newIdentity)).toBeUndefined();

    wallet.setIdentityLabel(newIdentity, "foo");
    expect(wallet.getIdentityLabel(newIdentity)).toEqual("foo");

    wallet.setIdentityLabel(newIdentity, "bar");
    expect(wallet.getIdentityLabel(newIdentity)).toEqual("bar");

    wallet.setIdentityLabel(newIdentity, undefined);
    expect(wallet.getIdentityLabel(newIdentity)).toBeUndefined();
  });

  it("generates unique ids", async () => {
    const wallet = new Ed25519Wallet();
    const originalId = wallet.id;
    expect(originalId).toMatch(/^[a-zA-Z0-9]+$/);

    const id1 = await wallet.createIdentity(defaultChain, defaultKeypair);
    expect(id1).toBeTruthy();
    expect(wallet.id).toEqual(originalId); // id must not change with use

    // many more keyrings all with unique ids
    const manyIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => new Ed25519Wallet().id);
    const uniqueVals = new Set(manyIds).size;
    expect(uniqueVals).toEqual(manyIds.length);
  });

  it("can sign", async () => {
    const wallet = new Ed25519Wallet();
    const newIdentity = await wallet.createIdentity(defaultChain, defaultKeypair);

    const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const signature = await wallet.createTransactionSignature(newIdentity, tx, PrehashType.None);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);
  });

  it("can sign with different prehash types", async () => {
    const wallet = new Ed25519Wallet();
    const mainIdentity = await wallet.createIdentity(defaultChain, defaultKeypair);

    const transactionBytes = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;

    const signaturePrehashNone = await wallet.createTransactionSignature(
      mainIdentity,
      transactionBytes,
      PrehashType.None,
    );
    const signaturePrehashSha256 = await wallet.createTransactionSignature(
      mainIdentity,
      transactionBytes,
      PrehashType.Sha256,
    );
    const signaturePrehashSha512 = await wallet.createTransactionSignature(
      mainIdentity,
      transactionBytes,
      PrehashType.Sha512,
    );
    expect(signaturePrehashNone.length).toEqual(64);
    expect(signaturePrehashSha256.length).toEqual(64);
    expect(signaturePrehashSha512.length).toEqual(64);

    expect(signaturePrehashNone).not.toEqual(signaturePrehashSha256);
    expect(signaturePrehashSha256).not.toEqual(signaturePrehashSha512);
    expect(signaturePrehashSha512).not.toEqual(signaturePrehashNone);
  });

  it("produces correct data for prehash signatures", async () => {
    const wallet = new Ed25519Wallet();
    const mainIdentity = await wallet.createIdentity(defaultChain, defaultKeypair);

    const bytes = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const bytesSha256 = new Sha256(bytes).digest();
    const bytesSha512 = new Sha512(bytes).digest();

    const expectedSha256 = await wallet.createTransactionSignature(
      mainIdentity,
      bytesSha256 as SignableBytes,
      PrehashType.None,
    );
    const expectedSha512 = await wallet.createTransactionSignature(
      mainIdentity,
      bytesSha512 as SignableBytes,
      PrehashType.None,
    );

    expect(await wallet.createTransactionSignature(mainIdentity, bytes, PrehashType.Sha256)).toEqual(
      expectedSha256,
    );
    expect(await wallet.createTransactionSignature(mainIdentity, bytes, PrehashType.Sha512)).toEqual(
      expectedSha512,
    );
  });

  it("can export the secret in a printable format", async () => {
    {
      const wallet = new Ed25519Wallet();
      await wallet.createIdentity(
        defaultChain,
        Ed25519Keypair.fromLibsodiumPrivkey(
          fromHex(
            "0000000000000000aaaaaaaaaaaaaaaa1111111111111111dddddddddddddddd7777777777777777bbbbbbbbbbbbbbbb5555555555555555ffffffffffffffff",
          ),
        ),
      );
      expect(wallet.printableSecret()).toEqual(
        "0000000000000000 aaaaaaaaaaaaaaaa 1111111111111111 dddddddddddddddd 7777777777777777 bbbbbbbbbbbbbbbb 5555555555555555 ffffffffffffffff",
      );
    }
    {
      // multiple keys are sorted by hex value
      const wallet = new Ed25519Wallet();
      await wallet.createIdentity(
        defaultChain,
        Ed25519Keypair.fromLibsodiumPrivkey(
          fromHex(
            "e79d85cdde2d416d6805bcbf561b707423af94effb528472c3cda80eef4609a796d810bed70594cb593a6bab9eabe88d6c9d9e3b0955fcd33cb097a6172bac40",
          ),
        ),
      );
      await wallet.createIdentity(
        defaultChain,
        Ed25519Keypair.fromLibsodiumPrivkey(
          fromHex(
            "0000000000000000aaaaaaaaaaaaaaaa1111111111111111dddddddddddddddd7777777777777777bbbbbbbbbbbbbbbb5555555555555555ffffffffffffffff",
          ),
        ),
      );
      expect(wallet.printableSecret()).toEqual(
        "0000000000000000 aaaaaaaaaaaaaaaa 1111111111111111 dddddddddddddddd 7777777777777777 bbbbbbbbbbbbbbbb 5555555555555555 ffffffffffffffff; e79d85cdde2d416d 6805bcbf561b7074 23af94effb528472 c3cda80eef4609a7 96d810bed70594cb 593a6bab9eabe88d 6c9d9e3b0955fcd3 3cb097a6172bac40",
      );
    }
  });

  it("can serialize multiple identities", async () => {
    const keypair1 = new Ed25519Keypair(
      fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
      fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
    );
    const keypair2 = new Ed25519Keypair(
      fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"),
      fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"),
    );
    const keypair3 = new Ed25519Keypair(
      fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"),
      fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"),
    );

    const wallet = new Ed25519Wallet();
    wallet.setLabel("wallet with 3 identities");
    const identity1 = await wallet.createIdentity(defaultChain, keypair1);
    const identity2 = await wallet.createIdentity(defaultChain, keypair2);
    const identity3 = await wallet.createIdentity(defaultChain, keypair3);
    wallet.setIdentityLabel(identity1, undefined);
    wallet.setIdentityLabel(identity2, "");
    wallet.setIdentityLabel(identity3, "foo");

    const serialized = wallet.serialize();
    expect(serialized).toBeTruthy();
    expect(serialized.length).toBeGreaterThan(100);

    const decoded = JSON.parse(serialized);
    expect(decoded.label).toEqual("wallet with 3 identities");
    expect(decoded.identities).toBeTruthy();
    expect(decoded.identities.length).toEqual(3);
    expect(decoded.identities[0].localIdentity).toBeTruthy();
    expect(decoded.identities[0].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[0].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[0].localIdentity.label).toBeUndefined();
    expect(decoded.identities[0].privkey).toEqual(
      "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60",
    );
    expect(decoded.identities[1].localIdentity).toBeTruthy();
    expect(decoded.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[1].localIdentity.label).toEqual("");
    expect(decoded.identities[1].privkey).toEqual(
      "4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb",
    );
    expect(decoded.identities[2].localIdentity).toBeTruthy();
    expect(decoded.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[2].localIdentity.label).toEqual("foo");
    expect(decoded.identities[2].privkey).toEqual(
      "c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7",
    );
  });

  it("can deserialize", () => {
    {
      // empty
      const wallet = new Ed25519Wallet(
        '{ "formatVersion": 2, "id": "h4g9q37hg9q", "identities": [] }' as WalletSerializationString,
      );
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("h4g9q37hg9q");
      expect(wallet.label.value).toBeUndefined();
      expect(wallet.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = `
        {
          "formatVersion": 2,
          "id": "h4g9q37hg9q",
          "identities": [
            {
              "localIdentity": {
                "chainId": "foonet",
                "pubkey": { "algo": "ed25519", "data": "aabbccdd" },
                "label": "foo"
              },
              "privkey": "223322112233aabb"
            }
          ]
        }` as WalletSerializationString;
      const wallet = new Ed25519Wallet(serialized);
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("h4g9q37hg9q");
      expect(wallet.label.value).toBeUndefined();
      expect(wallet.getIdentities().length).toEqual(1);
      const firstIdentity = wallet.getIdentities()[0];
      expect(firstIdentity.chainId).toEqual("foonet");
      expect(firstIdentity.pubkey.algo).toEqual("ed25519");
      expect(firstIdentity.pubkey.data).toEqual(fromHex("aabbccdd"));
      expect(wallet.getIdentityLabel(firstIdentity)).toEqual("foo");
    }

    {
      // two elements
      const serialized = `
        {
          "formatVersion": 2,
          "id": "h4g9q37hg9q",
          "label": "2 keys",
          "identities": [
            {
              "localIdentity": {
                "chainId": "xnet",
                "pubkey": { "algo": "ed25519", "data": "aabbccdd" },
                "label": "foo"
              },
              "privkey": "223322112233aabb"
            },
            {
              "localIdentity": {
                "chainId": "ynet",
                "pubkey": { "algo": "ed25519", "data": "ddccbbaa" },
                "label": "bar"
              },
              "privkey": "ddddeeee"
            }
          ]
        }` as WalletSerializationString;
      const wallet = new Ed25519Wallet(serialized);
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("h4g9q37hg9q");
      expect(wallet.label.value).toEqual("2 keys");
      expect(wallet.getIdentities().length).toEqual(2);
      const firstIdentity = wallet.getIdentities()[0];
      const secondIdentity = wallet.getIdentities()[1];
      expect(firstIdentity.chainId).toEqual("xnet");
      expect(firstIdentity.pubkey.algo).toEqual("ed25519");
      expect(firstIdentity.pubkey.data).toEqual(fromHex("aabbccdd"));
      expect(wallet.getIdentityLabel(firstIdentity)).toEqual("foo");
      expect(secondIdentity.chainId).toEqual("ynet");
      expect(secondIdentity.pubkey.algo).toEqual("ed25519");
      expect(secondIdentity.pubkey.data).toEqual(fromHex("ddccbbaa"));
      expect(wallet.getIdentityLabel(secondIdentity)).toEqual("bar");
    }
  });

  it("throws for unsupported format version", () => {
    const data = '{ "formatVersion": 123, "id": "h4g9q37hg9q", "identities": [] }' as WalletSerializationString;
    expect(() => new Ed25519Wallet(data)).toThrowError(/unsupported format version/i);
  });

  it("can serialize and restore a full wallet", async () => {
    const keypair1 = new Ed25519Keypair(
      fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"),
      fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"),
    );
    const keypair2 = new Ed25519Keypair(
      fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"),
      fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"),
    );
    const keypair3 = new Ed25519Keypair(
      fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"),
      fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"),
    );

    const original = new Ed25519Wallet();
    const identity1 = await original.createIdentity(defaultChain, keypair1);
    const identity2 = await original.createIdentity(defaultChain, keypair2);
    const identity3 = await original.createIdentity(defaultChain, keypair3);
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");
    original.setLabel("clone me");

    const restored = new Ed25519Wallet(original.serialize());

    // label and id match
    expect(restored.id).toEqual(original.id);
    expect(restored.label.value).toEqual(original.label.value);

    // pubkeys and labels match
    expect(original.getIdentities()).toEqual(restored.getIdentities());

    // privkeys match
    const tx = new Uint8Array([]) as SignableBytes;
    expect(await original.createTransactionSignature(identity1, tx, PrehashType.None)).toEqual(
      await restored.createTransactionSignature(identity1, tx, PrehashType.None),
    );
    expect(await original.createTransactionSignature(identity2, tx, PrehashType.None)).toEqual(
      await restored.createTransactionSignature(identity2, tx, PrehashType.None),
    );
    expect(await original.createTransactionSignature(identity3, tx, PrehashType.None)).toEqual(
      await restored.createTransactionSignature(identity3, tx, PrehashType.None),
    );
  });

  it("can be cloned", () => {
    const original = new Ed25519Wallet();
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });
});
