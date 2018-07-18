import { bnsCodec } from "@iov/bns";
import { Ed25519, Random, Sha512 } from "@iov/crypto";
// import { Encoding } from "@iov/encoding";
import { Ed25519SimpleAddressKeyringEntry, UserProfile } from "@iov/keycontrol";
import { connectToFirstLedger, getFirstLedgerNanoS } from "@iov/ledger-bns";
import { ChainId, PostableBytes } from "@iov/types";

describe("Make sure we can build all other packages", () => {
  it("Can import codec", () => {
    const foo = new Uint8Array([1, 2, 3, 4]) as PostableBytes;
    const chainId = "test-chain" as ChainId;
    expect(() => bnsCodec.parseBytes(foo, chainId)).toThrowError();
  });

  it("Can import crypto", async () => {
    const foo = new Uint8Array([1, 2, 3, 4]);
    const hash = new Sha512(foo).digest();
    expect(hash.length).toEqual(64);

    const seed = await Random.getBytes(32);
    expect(seed.length).toEqual(32);
    const keypair = await Ed25519.makeKeypair(seed);
    expect(keypair.privkey.length).toEqual(32);
  });

  it("Can build ledger connector", () => {
    expect(getFirstLedgerNanoS()).toBeUndefined();
    expect(connectToFirstLedger).toThrowError();
  });

  it("Can create user profile", () => {
    const profile = new UserProfile();
    profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));
    expect(profile.entriesCount.value).toEqual(1);
    expect(profile.getIdentities(0)).toBeTruthy();
  });
});
