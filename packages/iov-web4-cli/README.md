How to use the web4 cli
=======================

## Example usage

1. Build all dependencies: `cd web4 && yarn install && yarn build`
2. Go to `packages/iov-web4-cli`, run `yarn web4` and follow on-screen instructions
3. Play around like in the following example code:

```
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"))

> profile.getIdentities(0)
[]

> const faucet = wait(profile.createIdentity(0))

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

> const knownChains = wait(withConnectors(wait(bnsConnector("http://localhost:22345"))));
> const writer = new Web4Write(profile, knownChains);
> const chainId = writer.chainIds()[0];
> const reader = writer.reader(chainId);

> const faucetAddress = writer.keyToAddress(chainId, faucet.pubkey);
> wait(reader.getAccount({ address: faucetAddress })).data[0].balance

> const recipient = wait(profile.createIdentity(0));
> const recipientAddress = writer.keyToAddress(chainId, recipient.pubkey);

> .editor
const sendTx: SendTx = {
  kind: TransactionKind.SEND,
  chainId: chainId,
  signer: faucet.pubkey,
  recipient: recipientAddress,
  memo: "Web4 write style",
  amount: {
    whole: 11000,
    fractional: 777,
    tokenTicker: "CASH" as TokenTicker,
  },
};
^D
> wait(writer.signAndCommit(sendTx, 0));
> wait(reader.getAccount({ address: recipientAddress })).data[0].balance;

> wait(reader.searchTx({ tags: [bnsFromOrToTag(faucetAddress)] }));
> wait(reader.searchTx({ tags: [bnsFromOrToTag(recipientAddress)] }));
```

4. Congratulations, you sent your first money!
5. Add an additional entry

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

6. Now store to disk

```
> const db = levelup(leveldown('./my_userprofile_db'))
> profile.storeIn(db, "secret passwd")
```

7. and restore

```
> const profileFromDb = wait(UserProfile.loadFrom(db, "secret passwd"));
> profileFromDb
UserProfile {
  createdAt: 2018-07-04T16:07:14.583Z,
  keyring: Keyring { entries: [ [Object] ] } }
```

## Ledger usage

Do 1. and 2. like above

```
> import { LedgerSimpleAddressKeyringEntry } from "@iov/ledger-bns";
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral"))
> profile.addEntry(new LedgerSimpleAddressKeyringEntry())

> profile.getIdentities(0)
[]

> profile.getIdentities(1)
[]

> const softwareIdentity = wait(profile.createIdentity(0))
> const hardwareIdentity = wait(profile.createIdentity(1))

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

> Keyring.registerEntryType(LedgerSimpleAddressKeyringEntry.implementationId, (data: KeyringEntrySerializationString) => new LedgerSimpleAddressKeyringEntry(data));
> const db = levelup(leveldown('./my_userprofile_db'))
> profile.storeIn(db, "secret passwd")
> const profileFromDb = wait(UserProfile.loadFrom(db, "secret passwd"));
> profileFromDb
UserProfile {
  createdAt: 2018-08-02T16:25:38.274Z,
  keyring: Keyring { entries: [ [Object], [Object] ] }, ...
```
