# @iov/ledger-bns

[![npm version](https://img.shields.io/npm/v/@iov/ledger-bns.svg)](https://www.npmjs.com/package/@iov/ledger-bns)

This package provides an adaptor to use the bns ledger app as a keyring entry.
The app is still in dev mode and not available in the ledger store, so
this is really for cutting edge devs now.

It should also demonstrate how to implement an additional KeyringEntry outside of @iov/keycontrol
that can be dynamically loaded by any app in initialization.

## Getting started

Create a LedgerSimpleAddressKeyringEntry for signing with a Ledger. All
further functionality is provided by the `UserProfile`.

```ts
import { UserProfile } from "@iov/core";
import { LedgerSimpleAddressKeyringEntry } from "@iov/ledger-bns";

const profile = new UserProfile();
profile.addEntry(new LedgerSimpleAddressKeyringEntry());
```

The @iov/cli [provides further examples](https://github.com/iov-one/iov-core/tree/master/packages/iov-cli#ledger-usage)
of how to use this keyring entry.

### Observing Ledger state

An application may want to react to state changes of the ledger connection. There
are two interfaces to do so: `readonly canSign: ValueAndUpdates<boolean>` and `readonly deviceState: ValueAndUpdates<LedgerState>`.

`canSign` is provided for every keyring entry and works as follows:

```ts
const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

const canSign1 = ledgerEntry.canSign.value; // false

// connect Ledger and open app

const canSign2 = ledgerEntry.canSign.value; // true
```

You can subscribe for updates

```ts
const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

ledgerEntry.canSign.updates.subscribe({
  next: value => {
    console.log("canSign is now", value);
  }
});
```

or wait until a specific value is reached

```ts
const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

async function signWhenReady() {
  await ledgerEntry.canSign.waitFor(true);
  // canSign is now true. Proceed.
}
```

`deviceState` is very similar to `canSign` but Ledger specifig and a three state interface:
`LedgerState.Disconnected`, `LedgerState.Connected`, `LedgerState.IovAppOpen`.

First, make sure to `import { LedgerSimpleAddressKeyringEntry, LedgerState } from "@iov/ledger-bns";`.

Check the current state:

```ts
const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

const state1 = ledgerEntry.deviceState.value; // LedgerState.Disconnected

// connect and wait some time
const state2 = ledgerEntry.deviceState.value; // LedgerState.Connected

// open app
const state3 = ledgerEntry.deviceState.value; // LedgerState.IovAppOpen
```

Subscribe for updates:

```ts
import { LedgerSimpleAddressKeyringEntry, LedgerState } from "@iov/ledger-bns";

const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

ledgerEntry.deviceState.updates.subscribe({
  next: value => {
    switch (value) {
      case LedgerState.Disconnected:
        console.log("Ledger disconnected");
        break;
      case LedgerState.Connected:
        console.log("Ledger connected");
        break;
      case LedgerState.IovAppOpen:
        console.log("IOV app open");
        break;
    }
  }
});
```

Wait until a specific value is reached:

```ts
const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
ledgerEntry.startDeviceTracking();

async function signWhenReady() {
  await ledgerEntry.deviceState.waitFor(LedgerState.IovAppOpen);
  // signing app open
}
```

## Internal interfaces

Those interfaces are for maintainers of the package only and are not exposed
outside of @iov/ledger-bns.

If you want to call the Ledger directly, you will need to
[connectToFirstLedger](https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/globals.html#connecttofirstledger) to get a transport,
which you can [getPublicKeyWithIndex](https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/globals.html#getpublickeywithindex)
or [signTransactionWithIndex](https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/globals.html#signtransactionwithindex).

You can also try `yarn checkapp` to see events as you change apps on the Ledger,
which should detect when the proper app is opened and when you leave the app.

To run this code (or even `yarn test`), you must have the bns Ledger app
installed and open and connected to the computer running tests.
The tests will prompt you to confirm transactions as well, so when the tests
freeze, go hit those buttons on the Ledger.

## Compatibility

The code is compatible with https://github.com/iov-one/ledger-bns v0.1.0.
In particular, it works with the app installed from `mvp1/samecrypto`.
Please follow the README there and install properly before running this code.
And make sure the versions match.

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/](https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/)

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
