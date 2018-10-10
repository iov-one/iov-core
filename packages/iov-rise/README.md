# @iov/rise

[![npm version](https://img.shields.io/npm/v/@iov/rise.svg)](https://www.npmjs.com/package/@iov/rise)

## Getting started

The primary way to use @iov/rise is together with @iov/core. Alternatively,
you can use @iov/rise to create offline transactions which can be posted manually.

All examples are made for use in @iov/cli and you may need to include some
missing symbols if used in a different environment.

### Using with @iov/core

You can use @iov/rise as an extension of @iov/core to interact with the
RISE blockchain as follows.

```ts
import { Ed25519KeyringEntry } from "@iov/core";
import { passphraseToKeypair, riseCodec, riseConnector } from "@iov/rise";

const entry = new Ed25519KeyringEntry();
const mainIdentity = await entry.createIdentity(await passphraseToKeypair("squeeze frog deposit chase sudden clutch fortune spring tone have snow column"));

const profile = new UserProfile();
profile.addEntry(entry);

const writer = new IovWriter(profile);
await writer.addChain(riseConnector("https://twallet.rise.vision"));
const chainId = writer.chainIds()[0];
const reader = writer.reader(chainId);

const mainAddress = writer.keyToAddress(chainId, mainIdentity.pubkey);
console.log("Sender address: " + mainAddress);
console.log((await reader.getAccount({ address: mainAddress })).data[0].balance);

const recipientAddress = "10145108642177909005R" as Address;

const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: chainId,
  signer: mainIdentity.pubkey,
  recipient: recipientAddress,
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "RISE" as TokenTicker,
  }
};

console.log("Writing to blockchain. This may take a while …");
await writer.signAndCommit(sendTx, 0);
console.log((await reader.getAccount({ address: recipientAddress })).data[0].balance);
```

### The manual way

This is how you use `riseCodec` to generate send transactions
for RISE manually, i.e. without the help of @iov/core.

```ts
import { Ed25519KeyringEntry } from "@iov/core";
import { passphraseToKeypair, generateNonce, riseCodec } from "@iov/rise";

const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;

const entry = new Ed25519KeyringEntry();
const mainIdentity = await entry.createIdentity(await passphraseToKeypair("squeeze frog deposit chase sudden clutch fortune spring tone have snow column"));
const mainAddress = riseCodec.keyToAddress(mainIdentity.pubkey);

const recipientAddress = "10145108642177909005R" as Address;

const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: riseTestnet,
  signer: mainIdentity.pubkey,
  recipient: recipientAddress,
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "RISE" as TokenTicker,
  }
};

const nonce = generateNonce();
const signingJob = riseCodec.bytesToSign(sendTx, nonce);
const signature = await entry.createTransactionSignature(mainIdentity, signingJob.bytes, signingJob.prehashType, riseTestnet);

const signedTransaction = {
  transaction: sendTx,
  primarySignature: {
    nonce: nonce,
    publicKey: mainIdentity.pubkey,
    signature: signature,
  },
  otherSignatures: [],
};

// Signed transacion you can PUT to
// https://twallet.rise.io/api/transactions
const bytesToPost = Encoding.fromUtf8(riseCodec.bytesToPost(signedTransaction));
console.log(bytesToPost);
```

## RISE HD wallets

RISE codec and Ed25519HdWallet combined allow you to create a pure
software implementation of the the RISE wallet on Ledger or Trezor.

### Address discovery

The following code snipped shows how to implement address discovery.

```ts
import { Ed25519HdWallet } from "@iov/core";
import { Slip10RawIndex } from "@iov/crypto";
import { riseCodec, RISEConnection } from "@iov/rise";

const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;

async function deriveAddress(wallet, a): Promise<Address> {
  // 44'/1120'/a'
  // (see https://github.com/trezor/trezor-core/tree/master/docs/coins for account based derivation
  // paths and https://github.com/satoshilabs/slips/blob/master/slip-0044.md for RISE coin type)
  const path = [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(1120), Slip10RawIndex.hardened(a)]
  const pubkey = (await wallet.createIdentity(path)).pubkey;
  return riseCodec.keyToAddress(pubkey);
}

async function getBalance(searchAddress: Address): Promise<any> {
  const connection = new RISEConnection("https://testnet.rise.io/", riseTestnet);
  const response = await connection.getAccount({ address: searchAddress });
  return response.data.length > 0 ? response.data[0].balance[0] : undefined;
}

const wallet = Ed25519HdWallet.fromMnemonic("tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral");

// from https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
const gapLimit = 20;

let currentGapSize = 0;
for (let a = 0; currentGapSize < gapLimit; a++) {
  const address = await deriveAddress(wallet, a);
  const balance = await getBalance(address);
  const balanceString = balance ? `${balance.whole + balance.fractional/100000000} RISE` : "unknown";
  console.log(`${a}: ${Encoding.fromAscii(address)} (${balanceString})`);

  if (balance) {
    currentGapSize = 0;
  } else {
    currentGapSize++;
  }
}
console.log(`Stopping discovery after ${currentGapSize} unused addresses in a row.`);
```

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
