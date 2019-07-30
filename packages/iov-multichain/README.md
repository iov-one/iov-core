# @iov/multichain

[![npm version](https://img.shields.io/npm/v/@iov/multichain.svg)](https://www.npmjs.com/package/@iov/multichain)

@iov/multichain exposes high-level functionality to work with multiple
blockchains. It uses the keymanagement functionality of `UserProfile`, and the
generic blockchain connection of `BlockchainConnection`, and pulls them together
into one `MultiChainSigner`, which can query state and sign transactions on
multiple blockchains. The examples below show a basic usage of
`MultiChainSigner`. You may also want to experiment with
[@iov/cli](https://github.com/iov-one/iov-core/blob/master/packages/iov-cli/README.md)
as a developer tool to familiarize yourself with this functionality.

## Full Api Docs

Full API Docs from the latest release are hosted at:
https://iov-one.github.io/iov-core-docs/

If you want to generate documentation for a development branch, please run
`yarn docs` in the current directory and go to
[docs/index.html](./docs/index.html).

## Examples

Here are some example use cases. They all build on each other and assume all
imports from above. I also use `await` syntax here, which works inside of async
functions and experimentally in the
[@iov/cli](https://github.com/iov-one/iov-core/blob/master/packages/iov-cli/README.md)
REPL. (All imports are done for you in the REPL as well, so you can skip the
import statements. They are provided for guidance when integrating into your own
codebase).

Before starting, either run from source in `../iov-cli` via
`yarn build && ./bin/iov-cli` or install from npm via
`npm install -g @iov/cli; iov-cli`. Inside the cli the remaining code should
work verbatim.

### Key Management

Create a random mnemonic:

```ts
import { Bip39, Random } from "@iov/crypto";

// 16 bytes -> 12 word phrase
const entropy16 = await Random.getBytes(16);
const mnemonic12 = Bip39.encode(entropy16).toString();
console.log(mnemonic12);

// 32 bytes -> 24 word phrase
const entropy32 = await Random.getBytes(32);
const mnemonic24 = Bip39.encode(entropy32).toString();
console.log(mnemonic24);
```

Create a new profile with two wallets:

```ts
import { Ed25519HdWallet, UserProfile } from "@iov/keycontrol";

const profile = new UserProfile();
const wallet1 = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic12));
const wallet2 = profile.addWallet(Ed25519HdWallet.fromMnemonic(mnemonic24));
```

Inspect the profile:

```ts
// look at profile (value reads current state)
console.log(profile.wallets.value);

// listen to the profile (stream of updates, good for reactive UI)
const sub = profile.wallets.updates.subscribe({
  next: wallets => console.log(wallets),
});
profile.setWalletLabel(wallet1.id, "12 words");
profile.setWalletLabel(wallet2.id, "24 words");
```

Create identies on the two wallets:

```ts
import { ChainId } from "@iov/bcp";
import { HdPaths } from "@iov/keycontrol";
import { Encoding } from "@iov/encoding";
const { fromHex, toHex } = Encoding;

const chainId = "iov-lovenet" as ChainId;
// this creates two different public key identities, generated from the
// first mnemonic using two different SLIP-0010 paths
const id1a = await profile.createIdentity(wallet1.id, chainId, HdPaths.iov(0));
const id1b = await profile.createIdentity(wallet1.id, chainId, HdPaths.iov(1));
console.log(id1a);
console.log(id1a.pubkey.algo, toHex(id1a.pubkey.data));
console.log(id1b.pubkey.algo, toHex(id1b.pubkey.data));

// this creates a different key from the second mnemonic,
// this uses the same HD path as id1a, but different seed.
const id2 = await profile.createIdentity(wallet2.id, chainId, HdPaths.iov(0));
console.log(id2.pubkey.algo, toHex(id2.pubkey.data));

// we can also add labels to the individual identies
profile.setIdentityLabel(id1a, "main account");
console.log(profile.getIdentities(wallet1.id));
```

Save and reload keyring:

```ts
const levelup = require("levelup");
// this is for local leveldb in node
const leveldown = require("leveldown");
// use this for indexdb storage in browser
// const browsedown = require('browsedown');

const db = levelup(leveldown("./my_secret_keys"));
// const db = levelup(browsedown('keystore'));

const passphrase = "is seven words enough for the checker?";
await profile.storeIn(db, passphrase);

// this throws an error:
// await UserProfile.loadFrom(db, "garbage");
const loaded = await UserProfile.loadFrom(db, passphrase);

// and we have the same data
console.log(loaded.wallets.value);
const ids = profile.getIdentities(loaded.wallets.value[0].id);
console.log(ids);
console.log(toHex(ids[0].pubkey.data));
console.log(toHex(id1a.pubkey.data));
```

### Interacting with BCP Blockchain

The main use of private keypairs is not just to generate and organize them, but
to actually sign transactions (or encrypt/decrypt messages... not there yet). To
demonstrate this part, we need a working blockchain. If you are ambitious, you
can check out [bcp-demo](https://github.com/iov-one/bcp-demo), and build the
`bov` and `tendermint` binaries, construct your genesis file and run the client
against your one-node "dev net"...

But, if you just want to see how the client works, let's run against IOV's
testnet and use the faucet to get some tokens. As of July 29, 2019, the current
testnet is located at https://rpc.lovenet.iov.one/.

To connect, you need to know the address of the rpc server (above). It is also
helpful to know the `chainId` of the chain. You can find that quite easily by
looking at the [genesis file](https://rpc.lovenet.iov.one/genesis) under
`.result.genesis.chain_id`. In our case this is `iov-lovenet`.

### Executing the commands

Discover the address for your identity. This is chain-dependent, so we need to
use the chain-dependent `TxCodec` to generate it. In our case, bnsCodec:

```ts
import { bnsCodec } from "@iov/bns";

const addr = bnsCodec.identityToAddress(id1a);
console.log(addr);
```

If you are running your own "dev-net" give that address plenty of tokens in the
genesis file, by running `bov init IOV $ADDR`.

Now, connect to the network:

```ts
import { bnsConnector, MultiChainSigner } from "@iov/multichain";

const signer = new MultiChainSigner(profile);
await signer.addChain(bnsConnector("wss://rpc.lovenet.iov.one/"));

console.log(signer.chainIds()[0]); // is this what you got yourself?
```

List the tokens on the network:

```ts
const connection = signer.connection(chainId);

const tokens = await connection.getAllTokens();
console.log(tokens);
```

Query the testnet for some existing genesis accounts:

```ts
// this is pulled from the genesis account
import { Address } from "@iov/bcp";

const bert = "tiov1u29wnfhtjn7g3de7kl9adwrmlyltn0hsjckecc" as Address;
const acct = await connection.getAccount({ address: bert });
console.log(acct);
```

If you are running the testnet faucet, just ask for some free money.

```ts
import { TokenTicker } from "@iov/bcp";
import { IovFaucet } from "@iov/faucets";

const faucet = new IovFaucet("https://bns-faucet.lovenet.iov.one/");
await faucet.credit(addr, "ALT" as TokenTicker);
```

Then query your account:

```ts
const mine = await connection.getAccount({ address: addr });
console.log(mine); // should show non-empty array for balance
console.log(mine.balance[0]);

const addr2 = bnsCodec.identityToAddress(id2);
console.log(addr2);
let yours = await connection.getAccount({ address: addr2 });
console.log(yours); // should be undefined
```

Send a transaction to second id:

```ts
import { SendTransaction, TokenTicker } from "@iov/bcp";

const sendTx: SendTransaction = {
  kind: "bcp/send",
  creator: id1a, // this account must have money
  recipient: addr2,
  memo: "My first transaction",
  amount: {
    // 10.11 ALT (9 sig figs in tx codec)
    quantity: "10110000000",
    fractionalDigits: 9,
    tokenTicker: "ALT" as TokenTicker,
  },
};

// we must have the private key for the transaction creator (id1a)
await signer.signAndPost(sendTx);

// and we have a balance on the recipient now
yours = await connection.getAccount({ address: addr2 });
console.log(yours); // should show non-empty array for balance
console.log(yours.balance[0]);
```

Now, query the transaction history:

```ts
const history = await connection.searchTx({ sentFromOrTo: addr2 });
console.log(history);
const first = history[0].transaction as SendTransaction;
console.log(first.amount);
// address of recipient
console.log(toHex(first.recipient));
// public key of sender
console.log(toHex(first.signer.data));
// address of sender
const sender = bnsCodec.identityToAddress(first);
console.log(sender);
```

## Reactive Clients

If you query, the data can get stale, and you may be tempted to start polling
the blockchain. Don't! Instead we offer event streams for anyone wishing to
generate a reactive application. You can simply log these values, or feed them
into a reducer to capture their value.

```ts
// these are helpers for consuming streams
// lastValue will always store the last value,
// asArray will append to an array with list of all tx that were streamed
import { asArray, lastValue } from "@iov/stream";

const liveHeight = lastValue(
  client.watchBlockHeaders().map(header => header.height),
);
// if you wait a few seconds, you should see the block-height increase
console.log(liveHeight.value());
console.log(liveHeight.value());
console.log(liveHeight.value());

// you can also watch an account balance
const liveBalance = lastValue(client.watchAccount({ address: addr }));
console.log(liveBalance.value());

// or a list of all transactions that touch this account
const liveTx = asArray(client.liveTx({ address: addr }));
console.log(liveTx.value());
```

Now, go ahead, send some tokens to this account in another window, and read the
value of the account and tx again, watch them grow.

## License

This package is part of the IOV-Core repository, licensed under the Apache
License 2.0 (see
[NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and
[LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
