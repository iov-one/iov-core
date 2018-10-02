# @iov/keycontrol

[![npm version](https://img.shields.io/npm/v/@iov/keycontrol.svg)](https://www.npmjs.com/package/@iov/keycontrol)

Keycontrol manages all private keys and keeps them safe.

![KeyBase Diagram](https://raw.githubusercontent.com/iov-one/iov-core/master/docs/KeyBaseDiagram.png)

Please stick to using the [public API](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/userprofile.html)
even if you are importing from javascript, where `private` is not enforces. There are plans to wrap
objects in closures to provide run-time protection of secrets like private keys and mneumonic seeds.

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
const identity = await profile.createIdentity(0, 0);
profile.getIdentities(0);
```

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/)

As you see above, everything goes through the [UserProfile](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/userprofile.html),
which is the main entry point into this package. The main entries you can add is
[Ed25519SimpleAddress](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/ed25519simpleaddresskeyringentry.html),
which generates HD keys ala SLIP-0010 (BIP-0032), with a fixed path (not chain-dependent).
You can also use the `LedgerSimpleAddressKeyringEntry` from `@iov/ledger-bns`.

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
