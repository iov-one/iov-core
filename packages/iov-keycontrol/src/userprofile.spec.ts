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

  it("can be created from empty store", done => {
    (async () => {
      const storage: MemDown<string, string> = MemDownConstructor<string, string>();
      await UserProfile.createIn(storage);
      const profile = await UserProfile.openFrom(storage);
      expect(profile).toBeTruthy();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
