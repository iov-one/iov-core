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
> const signer = new MultiChainSigner(profile);
> const { connection } = await signer.addChain(bnsConnector("ws://localhost:22345"));
> const chainId = connection.chainId();

> chainId
'test-chain-esuZ1V'

> const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));

> profile.getIdentities(wallet.id)
[]

> const faucet = await profile.createIdentity(wallet.id, chainId, HdPaths.simpleAddress(0))

> faucet.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     224,
     42, ...

> profile.setIdentityLabel(wallet.id, faucet, "blockchain of value faucet")

> profile.getIdentities(wallet.id)
[ { chainId: 'test-chain-esuZ1V',
    pubkey: { algo: 'ed25519', data: [Uint8Array] },
    label: 'blockchain of value faucet',
    id: 'ed25519|533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898' } ]

> const faucetAddress = signer.identityToAddress(faucet);
> faucetAddress
'tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f'
> (await connection.getAccount({ address: faucetAddress })).data[0].balance

> const recipient = await profile.createIdentity(wallet.id, chainId, HdPaths.simpleAddress(1));
> const recipientAddress = signer.identityToAddress(recipient);

> .editor
const sendTx: SendTransaction = {
  kind: "bcp/send",
  chainId: chainId,
  signer: faucet.pubkey,
  recipient: recipientAddress,
  memo: "My first transaction",
  amount: {
    quantity: "33123456789",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  },
};
^D
> await signer.signAndPost(sendTx, wallet.id);
> (await connection.getAccount({ address: recipientAddress })).data[0].balance;

> await connection.searchTx({ tags: [bnsFromOrToTag(faucetAddress)] });
> await connection.searchTx({ tags: [bnsFromOrToTag(recipientAddress)] });
```

3. Congratulations, you sent your first money!
4. Add an additional wallet

```
> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: undefined } ]

> profile.addWallet(Ed25519HdWallet.fromMnemonic("organ wheat manage mirror wish truly tool trumpet since equip flight bracket"))

> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: undefined },
  { id: 'FtIcQqMWcRpEIruk', label: undefined } ]

> profile.getIdentities("ReYESw51lsOOr8_X" as WalletId)
[ { pubkey: { algo: 'ed25519', data: [Uint8Array] },
    label: 'blockchain of value faucet',
    id: 'uul1wahs5te8fiaD' } ]

> profile.getIdentities("FtIcQqMWcRpEIruk" as WalletId)
[]

> profile.setWalletLabel("ReYESw51lsOOr8_X" as WalletId, "main")
> profile.setWalletLabel("FtIcQqMWcRpEIruk" as WalletId, "second")

> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: 'main' },
  { id: 'FtIcQqMWcRpEIruk', label: 'second' } ]
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
  keyring: Keyring { wallets: [ [Object], [Object] ] },
  ...
```

### Register a BNS name

Assuming you have a `profile`, a `signer` and a `recipient` identity with
transactions associated from above

```
> .editor
const setNameTx: SetNameTx = {
  kind: "bns/set_name",
  chainId: chainId,
  signer: recipient.pubkey,
  name: "hans",
};
^D
> await signer.signAndPost(setNameTx, wallet.id);
> (await connection.getAccount({ name: "hans" })).data[0]
{ name: 'hans',
  address:
   Uint8Array [
     174,
     38,
     125,
     211, ...
```

### Disconnecting

When you are done using a WebSocket connection, disconnect the connection

```
> (await connection.getAccount({ address: faucetAddress })).data[0].balance
[ { quantity: '123456755876543211',
    fractionalDigits: 9,
    tokenTicker: 'CASH',
    tokenName: 'Main token of this chain' } ]
> connection.disconnect()
undefined
> (await connection.getAccount({ address: faucetAddress })).data[0].balance
Error: Socket was closed, so no data can be sent anymore.
    at ...
```

## Faucet usage

When using a Testnet, you can use the IovFaucet to receive tokens:

```
> const mnemonic = Bip39.encode(await Random.getBytes(16)).asString();
> mnemonic
'helmet album grow detail apology thank wire chef fame core private cargo'
> const profile = new UserProfile();
> const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));
> const me = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));

> const signer = new MultiChainSigner(profile);
> const { connection } = await signer.addChain(bnsConnector("https://bns.yaknet.iov.one"));
> const meAddress = signer.keyToAddress(connection.chainId(), me.pubkey);

> const faucet = new IovFaucet("https://iov-faucet.yaknet.iov.one");

> await faucet.credit(meAddress, "IOV" as TokenTicker)
> (await connection.getAccount({ address: meAddress })).data[0].balance
[ { whole: 10,
    fractional: 0,
    tokenTicker: 'IOV',
    tokenName: 'Main token of this chain',
    fractionalDigits: 6 } ]

> await faucet.credit(meAddress, "PAJA" as TokenTicker)
> (await connection.getAccount({ address: meAddress })).data[0].balance
[ { whole: 10,
    fractional: 0,
    tokenTicker: 'IOV',
    tokenName: 'Main token of this chain',
    fractionalDigits: 6 },
  { whole: 10,
    fractional: 0,
    tokenTicker: 'PAJA',
    tokenName: 'Mightiest token of this chain',
    fractionalDigits: 9 } ]
```

## Ledger usage

Do 1. and 2. like above

```
> import { LedgerSimpleAddressWallet } from "@iov/ledger-bns";
> const profile = new UserProfile();
> const wallet = Ed25519HdWallet.fromMnemonic("tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral");
> profile.addWallet(wallet)
> const ledgerWallet = new LedgerSimpleAddressWallet();
> ledgerWallet.startDeviceTracking();
> profile.addWallet(ledgerWallet);

> profile.getIdentities(wallet.id)
[]

> profile.getIdentities(ledgerWallet.id)
[]

> const softwareIdentity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0))
> const hardwareIdentity = await profile.createIdentity(ledgerWallet.id, 0)

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

> LedgerSimpleAddressWallet.registerWithKeyring()
> const db = levelup(leveldown('./my_userprofile_db'))
> await profile.storeIn(db, "secret passwd")
> const profileFromDb = await UserProfile.loadFrom(db, "secret passwd");
> profileFromDb
UserProfile {
  createdAt: 2018-08-02T16:25:38.274Z,
  keyring: Keyring { wallets: [ [Object], [Object] ] }, ...
```

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
