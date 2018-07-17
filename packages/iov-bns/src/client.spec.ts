import { Encoding } from "@iov/encoding";
import { Ed25519SimpleAddressKeyringEntry, LocalIdentity, UserProfile } from "@iov/keycontrol";
import { AddressBytes } from "@iov/types";

import { Client } from "./client";
import { keyToAddress } from "./util";

const skipTests = (): boolean => !process.env.BOV_ENABLED;

const pendingWithoutBov = () => {
  if (skipTests()) {
    pending("Set BOV_ENABLED to enable bov-based tests");
  }
};

describe("Integration tests with bov+tendermint", () => {
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const address = Encoding.fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282") as AddressBytes;
  const tendermintUrl = "ws://localhost:22345";

  const userProfile = async (): Promise<UserProfile> => {
    const profile = new UserProfile();
    profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mnemonic));
    await profile.createIdentity(0);
    return profile;
  };

  const faucetId = (profile: UserProfile): LocalIdentity => {
    const ids = profile.getIdentities(0);
    expect(ids.length).toBeGreaterThanOrEqual(1);
    return ids[0];
  };

  it("Generate proper faucet address", async () => {
    const profile = await userProfile();
    const id = faucetId(profile);
    const addr = keyToAddress(id.pubkey);
    expect(addr).toEqual(address);
  });

  it("Can connect to tendermint", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

    // we should get a reasonable string here
    const chainId = await client.chainId();
    expect(chainId).toBeTruthy();
    expect(chainId.length).toBeGreaterThan(6);
    expect(chainId.length).toBeLessThan(26);

    // we expect some block to have been created
    const height = await client.height();
    expect(height).toBeGreaterThan(1);
  });
});
