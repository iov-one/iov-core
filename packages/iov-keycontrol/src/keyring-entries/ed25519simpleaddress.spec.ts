import { Encoding } from "@iov/encoding";

import { KeyringEntrySerializationString } from "../keyring";
import { Ed25519SimpleAddressKeyringEntry } from "./ed25519simpleaddress";

describe("Ed25519SimpleAddressKeyringEntry", () => {
  const emptyEntry = `
    {
      "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
      "curve": "ed25519 seed",
      "identities": []
    }
    ` as KeyringEntrySerializationString;

  it("returns the concrete type when creating from entropy", () => {
    const entry = Ed25519SimpleAddressKeyringEntry.fromEntropy(Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(entry).toEqual(jasmine.any(Ed25519SimpleAddressKeyringEntry));
    expect(entry.implementationId).toEqual("ed25519-simpleaddress");
  });

  it("returns the concrete type when creating from mnemonic", () => {
    const entry = Ed25519SimpleAddressKeyringEntry.fromMnemonic("execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(entry).toEqual(jasmine.any(Ed25519SimpleAddressKeyringEntry));
    expect(entry.implementationId).toEqual("ed25519-simpleaddress");
  });

  it("creates correct paths", async () => {
    // https://github.com/iov-one/iov-core/blob/392234e/docs/KeyBase.md#simple-addresses
    const entry = new Ed25519SimpleAddressKeyringEntry(emptyEntry);
    await entry.createIdentity(0);
    await entry.createIdentity(1);
    await entry.createIdentity(2);

    const decodedJson = JSON.parse(entry.serialize());
    expect(decodedJson.identities[0].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 0]);
    expect(decodedJson.identities[1].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 1]);
    expect(decodedJson.identities[2].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 2]);
  });

  it("can be cloned", () => {
    const original = Ed25519SimpleAddressKeyringEntry.fromEntropy(Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
    expect(clone.implementationId).toEqual("ed25519-simpleaddress");
  });
});
