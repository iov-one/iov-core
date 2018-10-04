import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Ed25519, Slip10RawIndex } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ChainId } from "@iov/tendermint-types";

import { Ed25519HdWallet } from "./ed25519hdwallet";

const { fromHex, toAscii } = Encoding;

describe("Ed25519HdWallet", () => {
  it("returns the concrete type when creating from entropy", () => {
    const wallet = Ed25519HdWallet.fromEntropy(fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(wallet).toEqual(jasmine.any(Ed25519HdWallet));
    expect(wallet.implementationId).toEqual("ed25519-hd");
  });

  it("returns the concrete type when creating from mnemonic", () => {
    const wallet = Ed25519HdWallet.fromMnemonic("execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(wallet).toEqual(jasmine.any(Ed25519HdWallet));
    expect(wallet.implementationId).toEqual("ed25519-hd");
  });

  it("creates correct identities from paths", async () => {
    // Test 1 from https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md#test-cases
    //
    // Stellar public keys can be converted to raw ed25519 pubkeys as follows
    // $ yarn add stellar-sdk
    // $ node
    // > Keypair.fromPublicKey("GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6").rawPublicKey().toString("hex")
    const wallet = Ed25519HdWallet.fromMnemonic("illness spike retreat truth genius clock brain pass fit cave bargain toe");

    // m/44'/148'/0'
    const identity0 = await wallet.createIdentity([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(0)]);
    expect(identity0.pubkey.data).toEqual(fromHex("e3726830a0b60cb5f52c844cffcd4eed65eba5c155e89b26411562724e71e544"));

    // m/44'/148'/1'
    const identity1 = await wallet.createIdentity([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(1)]);
    expect(identity1.pubkey.data).toEqual(fromHex("416edcd6746d5293579a7039ac67bcf1a8698efecf81183bbb0ac877da86ada3"));

    // m/44'/148'/2'
    const identity2 = await wallet.createIdentity([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(2)]);
    expect(identity2.pubkey.data).toEqual(fromHex("31d7c4074e8e8c07025e6f33a07e93ea45b9d83e96179f6b1f23465e96d8dd89"));
  });

  it("creates correct signatures", async () => {
    const wallet = Ed25519HdWallet.fromMnemonic("illness spike retreat truth genius clock brain pass fit cave bargain toe");
    // m/44'/148'/0'
    // pubkey: e3726830a0b60cb5f52c844cffcd4eed65eba5c155e89b26411562724e71e544
    const mainIdentity = await wallet.createIdentity([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(0)]);

    const data = toAscii("foo bar") as SignableBytes;
    const signature = await wallet.createTransactionSignature(mainIdentity, data, PrehashType.None, "" as ChainId);

    const valid = await Ed25519.verifySignature(signature, data, fromHex("e3726830a0b60cb5f52c844cffcd4eed65eba5c155e89b26411562724e71e544"));
    expect(valid).toEqual(true);
  });

  it("can be cloned", () => {
    const original = Ed25519HdWallet.fromEntropy(fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
    expect(clone).toEqual(jasmine.any(Ed25519HdWallet));
    expect(clone.implementationId).toEqual("ed25519-hd");
  });
});
