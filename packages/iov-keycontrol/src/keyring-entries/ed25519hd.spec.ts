import { Encoding } from "@iov/crypto";
import { Algorithm } from "@iov/types";

import { KeyDataString } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";

describe("Ed25519HdKeyringEntry", () => {
  it("can be deserialized", () => {
    const entry = new Ed25519HdKeyringEntry(`{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive" }` as KeyDataString);
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
  });

  it("can be created from entropy", () => {
    const entry = Ed25519HdKeyringEntry.fromEntropy(Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
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

  it("can set, change and unset an identity nickname", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(`{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive" }` as KeyDataString);
      const newIdentity = await entry.createIdentity();
      expect(entry.getIdentities()[0].nickname).toBeUndefined();

      entry.setIdentityNickname(newIdentity, "foo");
      expect(entry.getIdentities()[0].nickname).toEqual("foo");

      entry.setIdentityNickname(newIdentity, "bar");
      expect(entry.getIdentities()[0].nickname).toEqual("bar");

      entry.setIdentityNickname(newIdentity, undefined);
      expect(entry.getIdentities()[0].nickname).toBeUndefined();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
