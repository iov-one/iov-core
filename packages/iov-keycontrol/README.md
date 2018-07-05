@iov/keycontrol
===============

## Example usage

1. Navigate into a directory where @iov/keycontrol is installed
   (e.g `cd web4 && yarn install && yarn build`)
2. Run `node` in interactive mode
3. Play around like in the following example code:

```
> const { Ed25519SimpleAddressKeyringEntry, Keyring, UserProfile } = require("@iov/keycontrol")
> const keyring = new Keyring()
> keyring.add(Ed25519SimpleAddressKeyringEntry.fromMnemonic("melt wisdom mesh wash item catalog talk enjoy gaze hat brush wash"))
> const profile = new UserProfile(new Date(Date.now()), keyring.serialize());

> profile.getIdentities(0)
[]

> profile.createIdentity(0)

> profile.getIdentities(0)
[ { pubkey: { algo: 'ed25519', data: [Object] },
    label: undefined } ]

> const mainIdentity = profile.getIdentities(0)[0]

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

> const Long = require("long")
> const fakeTransaction = { }
> const fakeCodec = { bytesToSign: () => { return new Uint8Array([0x00, 0x11, 0x22]); }, }
> const nonce = new Long(0x11223344, 0x55667788)
> profile.signTransaction(0, mainIdentity, fakeTransaction, fakeCodec, nonce).then(signed => console.log(signed))
```

4. Congratulations, you created the first signed transaction!
5. Now store to disk

```
> const leveldown = require('leveldown')
> const levelup = require('levelup')
> const db = levelup(leveldown('./my_userprofile_db'))
> profile.storeIn(db)
```

6. and restore

```
> var profileFromDb; UserProfile.loadFrom(db).then(p => { profileFromDb = p })
> profileFromDb
UserProfile {
  createdAt: 2018-07-04T16:07:14.583Z,
  keyring: Keyring { entries: [ [Object] ] } }
```
