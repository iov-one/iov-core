import { KeyDataString } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";

describe("Ed25519HdKeyringEntry", () => {
  it("can be deserialized", () => {
    const keyringEntry = new Ed25519HdKeyringEntry(`{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive" }` as KeyDataString);
    expect(keyringEntry).toBeTruthy();
  });
});
