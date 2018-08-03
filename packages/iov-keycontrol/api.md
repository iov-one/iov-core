# IOV Keycontrol

Keycontrol manages all private keys and keeps them safe.

TODO: Isbella, add your diagram of Keyring and Entries and such...

Simplest usage:

```
const profile = new UserProfile();
const twelveWords = "degree tackle suggest window test behind mesh extra cover prepare oak script";
profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(twelveWords));

// the "0" in the next two lines refers to the keyring entry.
// we only added one, but you could add multiple with different mneumonics,
// or one as ledger, secp256k1, etc....
const identity = await profile.createIdentity(0);
profile.getIdentities(0);
```

## Internal API

As you see above, everything goes through the [UserProfile](./classes/userprofile.html),
which is the main entry point into this project. The main entries you can add is
[Ed25519SimpleAddress](./classes/ed25519simpleaddresskeyringentry.html), 
which generates HD keys ala slip0010 (bip44), with a fixed path (not chain-dependent).
You can also use the `LedgerKeyringEntry` from `iov-ledger-bns`. 
