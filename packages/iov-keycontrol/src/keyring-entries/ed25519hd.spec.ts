import { Algorithm } from "@iov/types";

import { KeyDataString } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";

describe("Ed25519HdKeyringEntry", () => {
  it("can be deserialized", () => {
    const keyringEntry = new Ed25519HdKeyringEntry(`{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive" }` as KeyDataString);
    expect(keyringEntry).toBeTruthy();
  });

  it("can create identities", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(`{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive" }` as KeyDataString);

      const newIdentity1 = await entry.createIdentity();
      const newIdentity2 = await entry.createIdentity();
      const newIdentity3 = await entry.createIdentity();

      expect(newIdentity1.data).not.toEqual(newIdentity2.data);
      expect(newIdentity2.data).not.toEqual(newIdentity3.data);
      expect(newIdentity3.data).not.toEqual(newIdentity1.data);

      const identities = entry.getIdentities();
      expect(identities.length).toEqual(3);
      expect(identities[0].algo).toEqual(Algorithm.ED25519);
      expect(identities[0].data).toEqual(newIdentity1.data);
      expect(identities[1].algo).toEqual(Algorithm.ED25519);
      expect(identities[1].data).toEqual(newIdentity2.data);
      expect(identities[2].algo).toEqual(Algorithm.ED25519);
      expect(identities[2].data).toEqual(newIdentity3.data);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
