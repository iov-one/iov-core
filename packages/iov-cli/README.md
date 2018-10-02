# @iov/cli

[![npm version](https://img.shields.io/npm/v/@iov/cli.svg)](https://www.npmjs.com/package/@iov/cli)

## Installation and first run

The `iov-cli` executable is available via npm.
We recomment local installations to your demo project.
If you don't have one yet, just `mkdir iov-cli-installation && cd iov-cli-installation && yarn init -y`.

### locally with yarn

```
$ yarn add @iov/cli --dev
$ ./node_modules/.bin/iov-cli
```

### locally with npm

```
$ npm install @iov/cli --save-dev
$ ./node_modules/.bin/iov-cli
```

### globally with yarn

```
$ yarn global add @iov/cli
$ iov-cli
```

### globally with npm

```
$ npm install -g @iov/cli
$ iov-cli
```

## How to use the IOV-Core command line interface

1. Install @iov/cli and run `iov-cli` as shown above
2. Play around like in the following example code:

```
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"))

> profile.getIdentities(0)
[]

> const faucet = await profile.createIdentity(0, 0)

> faucet.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     224,
     42, ...

> profile.setIdentityLabel(0, faucet, "blockchain of value faucet")

> profile.getIdentities(0)
[ { pubkey: { algo: 'ed25519', data: [Uint8Array] },
    label: 'blockchain of value faucet' } ]

> const writer = new IovWriter(profile);
> await writer.addChain(bnsConnector("ws://localhost:22345"));
> const chainId = writer.chainIds()[0];
> const reader = writer.reader(chainId);

> const faucetAddress = writer.keyToAddress(chainId, faucet.pubkey);
> (await reader.getAccount({ address: faucetAddress })).data[0].balance

> const recipient = await profile.createIdentity(0, 1);
> const recipientAddress = writer.keyToAddress(chainId, recipient.pubkey);

> .editor
const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: chainId,
  signer: faucet.pubkey,
  recipient: recipientAddress,
  memo: "My first transaction",
  amount: {
    whole: 11000,
    fractional: 777,
    tokenTicker: "CASH" as TokenTicker,
  },
};
^D
> await writer.signAndCommit(sendTx, 0);
> (await reader.getAccount({ address: recipientAddress })).data[0].balance;

> await reader.searchTx({ tags: [bnsFromOrToTag(faucetAddress)] });
> await reader.searchTx({ tags: [bnsFromOrToTag(recipientAddress)] });
```

3. Congratulations, you sent your first money!
4. Add an additional entry

```
> profile.entriesCount.value
1

> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("organ wheat manage mirror wish truly tool trumpet since equip flight bracket"))

> profile.entriesCount.value
2

> profile.getIdentities(0)
[ { pubkey: { algo: 'ed25519', data: [Object] },
    label: undefined } ]

> profile.getIdentities(1)
[]

> profile.entryLabels.value
[ undefined, undefined ]

> profile.setEntryLabel(0, "main")
> profile.setEntryLabel(1, "second")

> profile.entryLabels.value
[ 'main', 'second' ]
```

5. Now store to disk

```
> const db = levelup(leveldown('./my_userprofile_db'))
> await profile.storeIn(db, "secret passwd")
```

6. and restore

```
> const profileFromDb = await UserProfile.loadFrom(db, "secret passwd");
> profileFromDb
UserProfile {
  createdAt: 2018-07-04T16:07:14.583Z,
  keyring: Keyring { entries: [ [Object], [Object] ] },
  ...
```

### Register a BNS name

Assuming you have a `profile`, a `writer` and a `recipient` identity with
transactions associated from above

```
> .editor
const setNameTx: SetNameTx = {
  kind: TransactionKind.SetName,
  chainId: chainId,
  signer: recipient.pubkey,
  name: "hans",
};
^D
> await writer.signAndCommit(setNameTx, 0);
> (await reader.getAccount({ name: "hans" })).data[0]
{ name: 'hans',
  address:
   Uint8Array [
     174,
     38,
     125,
     211, ...
```

### Disconnecting

When you are done using a WebSocket connection, disconnect the reader

```
> (await reader.getAccount({ address: faucetAddress })).data[0].balance
[ { whole: 123456789,
    fractional: 0,
    tokenTicker: 'CASH',
    tokenName: 'Main token of this chain',
    sigFigs: 6 } ]
> reader.disconnect()
undefined
> (await reader.getAccount({ address: faucetAddress })).data[0].balance
Error: Socket was closed, so no data can be sent anymore.
    at ...
```

## Faucet usage

When using a Testnet, you can use the BovFaucet to receive tokens:

```
> const mnemonic = Bip39.encode(await Random.getBytes(16)).asString();
> mnemonic
'helmet album grow detail apology thank wire chef fame core private cargo'
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mnemonic));
> const me = await profile.createIdentity(0, 0);

> const writer = new IovWriter(profile);
> await writer.addChain(bnsConnector("https://bov.friendnet-slow.iov.one"));
> const chainId = writer.chainIds()[0];
> const reader = writer.reader(chainId);
> const meAddress = writer.keyToAddress(chainId, me.pubkey);

> const bovFaucet = new BovFaucet("https://faucet.friendnet-slow.iov.one/faucet");

> await bovFaucet.credit(meAddress)
> (await reader.getAccount({ address: meAddress })).data[0].balance
[ { whole: 10,
    fractional: 0,
    tokenTicker: 'IOV',
    tokenName: 'Main token of this chain',
    sigFigs: 6 } ]

> await bovFaucet.credit(meAddress, "PAJA" as TokenTicker)
> (await reader.getAccount({ address: meAddress })).data[0].balance
[ { whole: 10,
    fractional: 0,
    tokenTicker: 'IOV',
    tokenName: 'Main token of this chain',
    sigFigs: 6 },
  { whole: 10,
    fractional: 0,
    tokenTicker: 'PAJA',
    tokenName: 'Mightiest token of this chain',
    sigFigs: 9 } ]
```

## Ledger usage

Do 1. and 2. like above

```
> import { LedgerSimpleAddressKeyringEntry } from "@iov/ledger-bns";
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral"))
> const ledgerEntry = new LedgerSimpleAddressKeyringEntry();
> ledgerEntry.startDeviceTracking();
> profile.addEntry(ledgerEntry);

> profile.getIdentities(0)
[]

> profile.getIdentities(1)
[]

> const softwareIdentity = await profile.createIdentity(0, 0)
> const hardwareIdentity = await profile.createIdentity(1)

> softwareIdentity.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     84,
     114, ...

> hardwareIdentity.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     84,
     114, ...

> LedgerSimpleAddressKeyringEntry.registerWithKeyring()
> const db = levelup(leveldown('./my_userprofile_db'))
> await profile.storeIn(db, "secret passwd")
> const profileFromDb = await UserProfile.loadFrom(db, "secret passwd");
> profileFromDb
UserProfile {
  createdAt: 2018-08-02T16:25:38.274Z,
  keyring: Keyring { entries: [ [Object], [Object] ] }, ...
```

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
