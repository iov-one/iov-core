import { fromHex, toUtf8 } from "@iov/encoding";

import { Keyring } from "./keyring";
import { EncryptedKeyring, KeyringEncryptor } from "./keyringencryptor";

describe("KeyringEncryptor", () => {
  it("can encrypt", async () => {
    const keyringSerialization = new Keyring().serialize();
    const serializationLength = toUtf8(keyringSerialization).length;
    const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");
    const encrypted = await KeyringEncryptor.encrypt(keyringSerialization, key);

    expect(encrypted.length).toEqual(
      4 /* version */ + 24 /* nonce */ + serializationLength + 16 /* authentication tag */,
    );
  });

  it("can decrypt encrypted data", async () => {
    const originalSerialization = new Keyring().serialize();
    const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");

    const encrypted = await KeyringEncryptor.encrypt(originalSerialization, key);
    const decrypted = await KeyringEncryptor.decrypt(encrypted, key);

    expect(decrypted).toEqual(originalSerialization);
  });

  it("throws when decrypting unsupported format version", async () => {
    const originalSerialization = new Keyring().serialize();
    const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");

    const encrypted = await KeyringEncryptor.encrypt(originalSerialization, key);
    const manipulatedVersion = new Uint8Array([0, 0, 0, 123, ...encrypted.slice(4)]) as EncryptedKeyring;

    await KeyringEncryptor.decrypt(manipulatedVersion, key)
      .then(() => fail("must not resolve"))
      .catch((error) => expect(error).toMatch(/unsupported format version/i));
  });
});
