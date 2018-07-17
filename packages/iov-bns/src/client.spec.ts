import { Ed25519SimpleAddressKeyringEntry, UserProfile } from "@iov/keycontrol";

describe("Integration tests with bov+tendermint", () => {
  it("Can generate an address", async () => {
    const profile = new UserProfile();
    profile.addEntry(
      Ed25519SimpleAddressKeyringEntry.fromMnemonic(
        "degree tackle suggest window test behind mesh extra cover prepare oak script",
      ),
    );
  });
});
