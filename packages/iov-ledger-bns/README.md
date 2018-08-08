# @iov/ledger-bns

This package provides an adaptor to use the bns ledger app as a keyring entry.
The app is still in dev mode and not available in the ledger store, so
this is really for cutting edge devs now.

Simple usage:

```
const profile = new UserProfile();
profile.addEntry(new LedgerSimpleAddressKeyringEntry());
```

Main entry is [].

If you want to call the ledger directly, you will need to
[connectToFirstLedger](./globals.html#connecttofirstledger) to get a transport,
which you can [getPublicKeyWithIndex](./globals.html#getpublickeywithindex)
or [signTransactionWithIndex](./globals.html#signtransactionwithindex).

You can also try `yarn checkApp` to see events as you change apps on the ledger,
which should detect when the proper app is opened and when you leave the app.

To run this code (or even `yarn test`), you must have the bns ledger app
installed and open and connected to the computer running tests.
The tests will prompt you to confirm transactions as well, so when the tests
freeze, go hit those buttons on the ledger.

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
