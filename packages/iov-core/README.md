# IOV Core documentation

## Full Api Docs

If you run `yarn docs` in this directory, it will generate typedoc for the entire iov-core project.
Just go into `./docs/index.html` and browse through the various classes. This is intended mainly as
a reference when coding. If you use typescript, your IDE should also provide a lot of helpful type info.

These docs will be hosted in the near future.

## Examples

Here are some example use cases. They all build on each other and assume
all imports from above. I also use `await` syntax here, which will not work
in the [@iov/core](../iov-cli/README.md) REPL, if you wish to experiment in
the REPL, please replace all `await foo(bar, ...)` with `wait(foo(bar, ...))`.
(Most/all imports are done for you in the REPL as well).

### Key Management

Create a random mnemonic:

```ts
import { Bip39, Random } from '@iov/crypto';

// 16 bytes -> 12 word phrase
const seed = await Random.getBytes(16);
const mnemonic = Bip39.encode(seed).asString();
console.log(mnemonic);

// 32 bytes -> 24 word phrase
const seed24 = await Random.getBytes(32);
const mnemonic24 = Bip39.encode(seed24).asString();
console.log(mnemonic24);
```

Create a new profile with two entries:

```ts
import { Ed25519SimpleAddressKeyringEntry, UserProfile} from '@iov/keycontrol';

const profile = new UserProfile();
profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mnemonic));
profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mnemonic24));
```

Inspect the profile:

```ts
// look at profile (value reads current state)
console.log(profile.entriesCount.value);
console.log(profile.entryLabels.value);

// listen to the profile (stream of updates, good for reactive UI)
const sub = profile.entryLabels.updates.subscribe({ next: x => console.log(x) });
profile.setEntryLabel(0, "12 words");
profile.setEntryLabel(1, "24 words");
```

Create identies on the two keyring entries (argument is index of the entry):

```ts
import { Encoding } from '@iov/encoding';
const { toHex } = Encoding; 

// this creates two different public key identities, generated from the
// first mnemonic using two different Slip0010 paths
const id1a = await profile.createIdentity(0);
const id1b = await profile.createIdentity(0);
console.log(id1a);
console.log(id1a.pubkey.algo, toHex(id1a.pubkey.data))
console.log(id1b.pubkey.algo, toHex(id1b.pubkey.data))

// this creates a different key from the second mnemonic,
// this uses the same HD path as id1a, but different seed.
const id2 = await profile.createIdentity(1);
console.log(id2.pubkey.algo, toHex(id2.pubkey.data));

// we can also add labels to the individual identies
profile.setIdentityLabel(0, id1a, 'main account');
console.log(profile.getIdentities(0));
```

Save and reload keyring:

```ts
const levelup = require('levelup');
// this is for local leveldb in node
const leveldown = require('leveldown');
// use this for indexdb storage in browser
// const browsedown = require('browsedown');

const db = levelup(leveldown('./my_secret_keys'));
// const db = levelup(browsedown('keystore'));


const passphrase = "is seven words enough for the checker?"
await profile.storeIn(db, passphrase);

// this throws an error:
// await UserProfile.loadFrom(db, "garbage");
const loaded = await UserProfile.loadFrom(db, passphrase);

// and we have the same data
console.log(loaded.entryLabels.value);
const ids = profile.getIdentities(0);
console.log(ids);
console.log(toHex(ids[0].pubkey.data));
console.log(toHex(id1a.pubkey.data));
```

### Interacting with BCP Blockchain

TODO