import { Encoding } from "@iov/encoding";

import { Keyring } from "./keyring";
import { KeyringEncryptor } from "./keyringencryptor";

describe("KeyringEncryptor", () => {
  it("can encrypt", async () => {
    const keyringSerialization = new Keyring().serialize();
    const serializationLength = Encoding.toUtf8(keyringSerialization).length;
    const key = Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000");
    const encrypted = await KeyringEncryptor.encrypt(keyringSerialization, key);

    expect(encrypted.length).toEqual(24 /* nonce */ + serializationLength + 16 /* authentication tag */);
  });
});
