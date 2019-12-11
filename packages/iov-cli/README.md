# @iov/cli

[![npm version](https://img.shields.io/npm/v/@iov/cli.svg)](https://www.npmjs.com/package/@iov/cli)

## Installation and first run

The `iov-cli` executable is available via npm. We recommend local installations
to your demo project. If you don't have one yet, just
`mkdir iov-cli-installation && cd iov-cli-installation && yarn init -y`.

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

1. Install `@iov/cli` and run `iov-cli` as shown above
2. Start a local BNS blockchain as described in
   [scripts/bnsd/README.md](https://github.com/iov-one/iov-core/tree/master/scripts/bnsd/README.md)
3. Play around as in the following example code:

```
> const profile = new UserProfile();
> const signer = new MultiChainSigner(profile);
> const { connection } = await signer.addChain(createBnsConnector("ws://localhost:23456"));
> const chainId = connection.chainId();

> chainId
'test-chain-esuZ1V'

> const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));

> profile.getIdentities(wallet.id)
[]

> const faucet = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(0))

> faucet.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     224,
     42, ...

> profile.setIdentityLabel(faucet, "blockchain of value faucet")

> profile.getIdentities(wallet.id)
[ { chainId: 'test-chain-esuZ1V',
    pubkey: { algo: 'ed25519', data: [Uint8Array] } } ]

> const faucetAddress = signer.identityToAddress(faucet);
> faucetAddress
'tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f'
> (await connection.getAccount({ address: faucetAddress })).balance

> const recipient = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(1));
> const recipientAddress = signer.identityToAddress(recipient);

> .editor
const sendTx = await connection.withDefaultFee<SendTransaction>({
  kind: "bcp/send",
  chainId: faucet.chainId,
  sender: faucetAddress,
  recipient: recipientAddress,
  memo: "My first transaction",
  amount: {
    quantity: "33123456789",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  },
}, faucetAddress);
^D
> await signer.signAndPost(faucet, sendTx);
> (await connection.getAccount({ address: recipientAddress })).balance;

> await connection.searchTx({ sentFromOrTo: faucetAddress });
> await connection.searchTx({ sentFromOrTo: recipientAddress });
```

3. Congratulations, you sent your first money!
4. Add an additional wallet

```
> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: undefined } ]

> const wallet2 = profile.addWallet(Secp256k1HdWallet.fromMnemonic("organ wheat manage mirror wish truly tool trumpet since equip flight bracket"))

> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: undefined },
  { id: 'FtIcQqMWcRpEIruk', label: undefined } ]

> profile.getIdentities(wallet.id)
[ { chainId: 'test-chain-esuZ1V',
    pubkey: { algo: 'ed25519', data: [Uint8Array] } } ]

> profile.getIdentities(wallet2.id)
[]

> profile.setWalletLabel(wallet.id, "ed")
> profile.setWalletLabel(wallet2.id, "secp")

> profile.wallets.value
[ { id: 'ReYESw51lsOOr8_X', label: 'ed' },
  { id: 'FtIcQqMWcRpEIruk', label: 'secp' } ]
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
  keyring:
   Keyring { wallets: [ [Ed25519HdWallet], [Secp256k1HdWallet] ] },
  ...
```

### Register a username on the IOV Name Service

Assuming you have a `profile`, a `signer` and a `recipient` identity with
transactions associated from above

```
> .editor
const registrationTx = await connection.withDefaultFee<RegisterUsernameTx>({
  kind: "bns/register_username",
  chainId: recipient.chainId,
  targets: [],
  username: "hans*iov",
}, recipientAddress);
^D
> await signer.signAndPost(recipient, registrationTx);
> const bnsConnection = connection as BnsConnection;
> await bnsConnection.getUsernames({ owner: recipientAddress });
[ { username: 'hans*iov',
    owner: 'tiov14cn8m57wtrlewmlnjucctsahpnxlj92l0crkvq',
    targets: [] } ]
> await bnsConnection.getUsernames({ username: "hans*iov" });
[ { username: 'hans*iov',
    owner: 'tiov14cn8m57wtrlewmlnjucctsahpnxlj92l0crkvq',
    targets: [] } ]
```

### Disconnecting

When you are done using a WebSocket connection, disconnect the connection

```
> (await connection.getAccount({ address: faucetAddress })).balance
[ { quantity: '123456755876543211',
    fractionalDigits: 9,
    tokenTicker: 'CASH' } ]
> connection.disconnect()
undefined
> (await connection.getAccount({ address: faucetAddress })).balance
Error: Socket was closed, so no data can be sent anymore.
    at ...
```

## Faucet usage

When using a Testnet, you can use the IovFaucet to receive tokens.

In this example we connect to a public test network.

```
> const mnemonic = Bip39.encode(Random.getBytes(16)).toString();
> mnemonic
'helmet album grow detail apology thank wire chef fame core private cargo'
> const profile = new UserProfile();
> const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic));

> const signer = new MultiChainSigner(profile);
> const { connection } = await signer.addChain(createBnsConnector("https://rpc.lovenet.iov.one"));
> const chainId = connection.chainId();

> const alice = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(0));
> const aliceAddress = signer.identityToAddress(alice);

> const faucet = new IovFaucet("https://bns-faucet.lovenet.iov.one/");

> await faucet.credit(aliceAddress, "IOV" as TokenTicker)
> (await connection.getAccount({ address: aliceAddress })).balance
[ { quantity: '10000000000',
    fractionalDigits: 9,
    tokenTicker: 'IOV' } ]
```

## License

This package is part of the IOV-Core repository, licensed under the Apache
License 2.0 (see
[NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and
[LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
