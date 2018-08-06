# IOV Keycontrol

Keycontrol manages all private keys and keeps them safe.

![KeyBase Diagram](../../../docs/KeyBaseDiagram.svg)

Simplest usage:

```
const profile = new UserProfile();

// use 32 bytes if you want more security, 24 word phrase
const seed = await Random.getBytes(16);
const mnemonic = Bip39.encode(seed).asString();
console.log(mnemonic);
profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mneumonic));

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
