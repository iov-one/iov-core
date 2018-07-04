import { KeyringEntrySerializationString } from "../keyring";
import { Ed25519HdKeyringEntrySerialization } from "./ed25519hd";
import { Ed25519SimpleAddressKeyringEntry } from "./ed25519simpleaddress";

describe("Ed25519SimpleAddressKeyringEntry", () => {
  const emptyEntry = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [] }' as KeyringEntrySerializationString;

  it("creates correct paths", done => {
    // https://github.com/iov-one/web4/blob/392234e/docs/KeyBase.md#simple-addresses
    (async () => {
      const entry = new Ed25519SimpleAddressKeyringEntry(emptyEntry);
      await entry.createIdentity();
      await entry.createIdentity();
      await entry.createIdentity();

      const decodedJson: Ed25519HdKeyringEntrySerialization = JSON.parse(entry.serialize());
      expect(decodedJson.identities[0].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 0]);
      expect(decodedJson.identities[1].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 1]);
      expect(decodedJson.identities[2].privkeyPath).toEqual([0x80000000 + 4804438, 0x80000000 + 2]);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
