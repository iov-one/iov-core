import levelup from "levelup";
import MemDownConstructor, { MemDown } from "memdown";
import { ReadonlyDate } from "readonly-date";

import { Keyring } from "./keyring";
import { UserProfile } from "./userprofile";

describe("UserProfile", () => {
  it("can be constructed", () => {
    const keyringSerializetion = new Keyring().serialize();
    const createdAt = new ReadonlyDate(ReadonlyDate.now());
    const profile = new UserProfile(createdAt, keyringSerializetion);
    expect(profile).toBeTruthy();
  });

  it("can be stored", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      const createdAt = new ReadonlyDate("1985-04-12T23:20:50.521Z");
      const keyring = new Keyring().serialize();
      const profile = new UserProfile(createdAt, keyring);

      await profile.storeIn(storage);

      {
        const db = levelup(storage);
        expect(await db.get("created_at", { asBuffer: false })).toEqual("1985-04-12T23:20:50.521Z");
        expect(await db.get("keyring", { asBuffer: false })).toEqual('{"entries":[]}');
        await db.close();
      }

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("flushed store when storing", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      {
        const db = levelup(storage);
        await db.put("foo", "bar");
        await db.close();
      }

      const profile = new UserProfile(new ReadonlyDate(ReadonlyDate.now()), new Keyring().serialize());
      await profile.storeIn(storage);

      {
        const db = levelup(storage);
        await db
          .get("foo")
          .then(() => {
            fail("get 'foo' promise must not reslve");
          })
          .catch(error => {
            expect(error.notFound).toBeTruthy();
          });
        await db.close();
      }

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be loaded from storage", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();

      {
        const db = levelup(storage);
        await db.put("created_at", "1985-04-12T23:20:50.521Z");
        await db.put("keyring", '{"entries":[]}');
        await db.close();
      }

      const profile = await UserProfile.loadFrom(storage);
      expect(profile.createdAt).toEqual(new ReadonlyDate("1985-04-12T23:20:50.521Z"));

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
