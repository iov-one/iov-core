How to use the web4 cli
=======================

## Example usage

1. Build all dependencies: `cd web4 && yarn install && yarn build`
2. Go to `packages/iov-cli`, run `yarn web4` and follow on-screen instructions
3. Play around like in the following example code:

```
> const profile = new UserProfile();
> profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"))

> profile.getIdentities(0)
[]

> const mainIdentity = wait(profile.createIdentity(0))

> mainIdentity.pubkey
{ algo: 'ed25519',
  data:
   Uint8Array [
     224,
     42, ...

> profile.setIdentityLabel(0, mainIdentity, "the first one")

> profile.getIdentities(0)
[ { pubkey: { algo: 'ed25519', data: [Object] },
    label: 'the first one' } ]

> .editor
const sendTx: SendTx = {
  kind: TransactionKind.SEND,
  chainId: "aabb" as ChainId,
  signer: mainIdentity.pubkey,
  recipient: new Uint8Array([0x11]) as AddressBytes,
  memo: "Web4 write style",
  amount: {
    whole: 11000,
    fractional: 777,
    tokenTicker: "CASH" as TokenTicker,
  },
};
^D
> const nonce = new Long(0x11223344, 0x55667788) as Nonce;
> profile.signTransaction(0, mainIdentity, sendTx, bnsCodec, nonce).then(signed => console.log(signed))
```

4. Congratulations, you created the first signed transaction!
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
