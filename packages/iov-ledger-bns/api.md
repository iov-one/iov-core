# BNS Ledger Controller

This provides an adapter to use the bns ledger app as a keyring entry.
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