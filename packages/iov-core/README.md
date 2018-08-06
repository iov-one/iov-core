# IOV Core documentation

## Full Api Docs

If you run `yarn docs` in this directory, it will generate typedoc for the entire iov-core project.
Just go into `./docs/index.html` and browse through the various classes. This is intended mainly as
a reference when coding. If you use typescript, your IDE should also provide a lot of helpful type info.

These docs will be hosted in the near future.

## Examples

Here are some example use cases. They all build on each other and assume
all imports from above. I also use `await` syntax here, which will not work
in the [@iov/cli](../iov-cli/README.md) REPL, if you wish to experiment in
the REPL, please replace all `await foo(bar, ...)` with `wait(foo(bar, ...))`.
(All imports are done for you in the REPL as well, so you can skip the import
statements. They are provided for guidance when integrating into your own codebase).

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
const { fromHex, toHex } = Encoding; 

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

The main use of private keypairs is not just to generate and organize them,
but to actually sign transactions (or encrypt/decrypt messages... not there yet).
To demonstrate this part, we need a working blockchain. If you are ambitious,
you can check out [bcp-demo](https://github.com/iov-one/bcp-demo), and build
the `bov` and `tendermint` binaries, construct your genesis file and run
the client against your one-node "dev net"...

But, if you just want to see how the client works, let's run against iov's testnet
and use the faucet to get some tokens. As of August 6, 2018, the current testnet 
is located at https://bov.xerusnet.iov.one/ (we are currently roating it in 2-3
week cycles to improve the setup based on loadtests and internal feedback).

To connect, you need to know the address of the rpc server (above).
It is also helpful to know the `chainId` of the chain.
You can find that quite easily by looking
at the [genesis file](https://bov.xerusnet.iov.one/genesis) under
`.result.genesis.chain_id`. In our case this is `chain-B5XXm5`.

### Executing the commands

Discover the address for your identity. This is chain-dependent, so we need
to use the chain-dependent `TxCodec` to generate it. In our case, bnsCodec:

```ts
import { bnsCodec } from '@iov/bns';

const addr = bnsCodec.keyToAddress(id1a.pubkey);
console.log(toHex(addr));
```

If you are running your own "dev-net" give that address plenty of tokens
in the genesis file, by running `bov init IOV $ADDR`.


Now, connect to the network:

```ts
import { bnsConnector, IovWriter, withConnectors } from '@iov/core';

const testnet = await bnsConnector('https://bov.xerusnet.iov.one');
const chains = await withConnectors(testnet); // you can pass in any number of networks here
const writer = new IovWriter(profile, chains);

const chainId = writer.chainIds()[0];
console.log(chainId); // is this what you got yourself?
```

List the tickers on the network:

```ts
const tickers = await reader.getAllTickers();
console.log(tickers.data);
```

Query the testnet for some existing genesis accounts:

```ts
const reader = writer.reader(chainId);

// this is pulled from the genesis account
import { Address } from "@iov/bcp-types"
const bert = fromHex("e28ae9a6eb94fc88b73eb7cbd6b87bf93eb9bef0") as Address;
const faucet = await reader.getAccount({ address: bert });
console.log(faucet);
console.log(faucet.data[0])

// you can also query by registered name
const byName = await reader.getAccount({ name: "bert" });
console.log(byName.data[0])
```

If you are running the testnet faucet, just ask for some free money:

```shell
curl --header "Content-Type: application/json" --request POST \
  --data '{"address": "7377fef334376215c87576b527042a3adc02c277"}' \
  https://faucet.xerusnet.iov.one/faucet
```
(TODO: add ts helper method to do this)
(TODO: faucet seems broken right now....)

Then query your account:

```ts
const mine = await reader.getAccount({ address: addr });
console.log(mine); // should show non-empty array for data
console.log(mine.data[0]);

const addr2 = bnsCodec.keyToAddress(id2.pubkey);
console.log(toHex(addr2));
let yours = await reader.getAccount({ address: addr2 });
console.log(yours); // should show empty array for data
```

Send a transaction to second id:

```ts
const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: chainId,
  signer: id1a.pubkey,  // this account must have money
  recipient: addr2,
  memo: "My first transaction",
  amount: { // 10.11 IOV (9 sig figs)
    whole: 10,
    fractional: 11000000,
    tokenTicker: "IOV" as TokenTicker,
  },
};

// the signer has a 0 nonce
console.log(await writer.getNonce(chainId, addr))

// we must have the private key for the signer (id1a)
// second argument (0) is the keyring entry where the private key can be found
await writer.signAndCommit(sendTx, 0);

// note that the nonce of the signer is incremented
console.log(await writer.getNonce(chainId, addr))

// and we have a balance on the recipient now
yours = await reader.getAccount({ address: addr2 });
console.log(yours); // should show non-empty array for data
console.log(yours.data[0]); // should show non-empty array for data
```

Now, query the transaction history:

```ts
const history = await reader.searchTx({ tags: [bnsFromOrToTag(addr2)] }));
console.log(history);
const first = history[0].transaction as SendTx;
console.log(first.amount);
// address of recipient
console.log(toHex(first.recipient));
// public key of sender
console.log(toHex(first.signer.data));
// address of sender
const sender = bnsCodec.keyToAddress(first.signer);
console.log(toHex(sender));
```