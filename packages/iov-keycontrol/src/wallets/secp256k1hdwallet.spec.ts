import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Secp256k1, Slip10RawIndex } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ChainId } from "@iov/tendermint-types";

import { Secp256k1HdWallet } from "./secp256k1hdwallet";

const { fromHex, toAscii } = Encoding;

describe("Secp256k1HdWallet", () => {
  it("returns the concrete type when creating from entropy", () => {
    const wallet = Secp256k1HdWallet.fromEntropy(fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(wallet).toEqual(jasmine.any(Secp256k1HdWallet));
    expect(wallet.implementationId).toEqual("secp256k1-hd");
  });

  it("returns the concrete type when creating from mnemonic", () => {
    const wallet = Secp256k1HdWallet.fromMnemonic("execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(wallet).toEqual(jasmine.any(Secp256k1HdWallet));
    expect(wallet.implementationId).toEqual("secp256k1-hd");
  });

  it("creates correct identities from paths", async () => {
    const wallet = Secp256k1HdWallet.fromMnemonic("special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling");
    {
      // m/0'/0
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0)]);
      expect(identity.pubkey.data).toEqual(fromHex("03a7a8d79df7857bf25a3a389b0ecea83c5272181d2c062346b1c64e258589fce0"));
    }
    {
      // m/0'/1
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(1)]);
      expect(identity.pubkey.data).toEqual(fromHex("02ec5fd84554de89c53fcd0670f534930c6ec0cbe761d43a98f6557422e16d2561"));
    }
    {
      // m/0'/1/0
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(1), Slip10RawIndex.normal(0)]);
      expect(identity.pubkey.data).toEqual(fromHex("02d26ce62f44e11c38a79cf7d7530ddd20572f8e7d14c38b0da38eee8aacde9bbc"));
    }
    {
      // m/0'/1/1
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(1), Slip10RawIndex.normal(1)]);
      expect(identity.pubkey.data).toEqual(fromHex("03c3ff7a943318deacb0c426ac9b03bb69358d1c304eb13e1a2c2a458a46541a54"));
    }
    {
      // m/0'/1/1/0'
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(1), Slip10RawIndex.normal(1), Slip10RawIndex.hardened(0)]);
      expect(identity.pubkey.data).toEqual(fromHex("03f6cbcea9d6a3ebd400b9a134e58f405cc19aff092d344755837099f3ea9258b4"));
    }
    {
      // m/0'/1/1/1'
      const identity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(1), Slip10RawIndex.normal(1), Slip10RawIndex.hardened(1)]);
      expect(identity.pubkey.data).toEqual(fromHex("021bcecc3222b74948984b9b3a676814dcd8d7d6d5530caa7d7a3280bf034ba62c"));
    }
  });

  it("creates correct signatures", async () => {
    const wallet = Secp256k1HdWallet.fromMnemonic("special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling");
    // m/0'/0
    // pubkey: 03a7a8d79df7857bf25a3a389b0ecea83c5272181d2c062346b1c64e258589fce0
    const mainIdentity = await wallet.createIdentity([Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0)]);

    const data = toAscii("foo bar") as SignableBytes;
    const signature = await wallet.createTransactionSignature(mainIdentity, data, PrehashType.None, "" as ChainId);

    const valid = await Secp256k1.verifySignature(signature, data, fromHex("03a7a8d79df7857bf25a3a389b0ecea83c5272181d2c062346b1c64e258589fce0"));
    expect(valid).toEqual(true);
  });

  it("can be cloned", () => {
    const original = Secp256k1HdWallet.fromEntropy(fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
    expect(clone).toEqual(jasmine.any(Secp256k1HdWallet));
    expect(clone.implementationId).toEqual("secp256k1-hd");
  });
});
