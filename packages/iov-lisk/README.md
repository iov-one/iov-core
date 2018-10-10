# @iov/lisk

[![npm version](https://img.shields.io/npm/v/@iov/lisk.svg)](https://www.npmjs.com/package/@iov/lisk)

## Getting started

The primary way to use @iov/lisk is together with @iov/core. Alternatively,
you can use @iov/lisk to create offline transactions which can be posted manually.

All examples are made for use in @iov/cli and you may need to include some
missing symbols if used in a different environment.

### Using with @iov/core

You can use @iov/lisk as an extension of @iov/core to interact with the
Lisk blockchain as follows.

```ts
import { Ed25519KeyringEntry } from "@iov/core";
import { passphraseToKeypair, liskCodec, liskConnector } from "@iov/lisk";

const entry = new Ed25519KeyringEntry();
const mainIdentity = await entry.createIdentity(await passphraseToKeypair("oxygen fall sure lava energy veteran enroll frown question detail include maximum"));

const profile = new UserProfile();
profile.addEntry(entry);

const signer = new MultiChainSigner(profile);
await signer.addChain(liskConnector("https://testnet.lisk.io"));
const chainId = signer.chainIds()[0];
const reader = signer.reader(chainId);

const mainAddress = signer.keyToAddress(chainId, mainIdentity.pubkey);
console.log((await reader.getAccount({ address: mainAddress })).data[0].balance);

const recipientAddress = "6076671634347365051L" as Address;

const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: chainId,
  signer: mainIdentity.pubkey,
  recipient: recipientAddress,
  memo: "We ❤️ developers – iov.one",
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "LSK" as TokenTicker,
  }
};

console.log("Writing to blockchain. This may take a while …");
await signer.signAndCommit(sendTx, 0);
console.log((await reader.getAccount({ address: recipientAddress })).data[0].balance);
```

### The manual way

This is how you use `liskCodec` to generate send transactions
for Lisk manually, i.e. without the help of @iov/core.

```ts
import { Ed25519KeyringEntry } from "@iov/core";
import { passphraseToKeypair, generateNonce, liskCodec } from "@iov/lisk";

const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;

const entry = new Ed25519KeyringEntry();
const mainIdentity = await entry.createIdentity(await passphraseToKeypair("oxygen fall sure lava energy veteran enroll frown question detail include maximum"));

const recipientAddress = "6076671634347365051L" as Address;

const sendTx: SendTx = {
  kind: TransactionKind.Send,
  chainId: liskTestnet,
  signer: mainIdentity.pubkey,
  recipient: recipientAddress,
  memo: "We ❤️ developers – iov.one",
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "LSK" as TokenTicker,
  }
};

const nonce = generateNonce();
const signingJob = liskCodec.bytesToSign(sendTx, nonce);
const signature = await entry.createTransactionSignature(mainIdentity, signingJob.bytes, signingJob.prehashType, liskTestnet);

const signedTransaction = {
  transaction: sendTx,
  primarySignature: {
    nonce: nonce,
    publicKey: mainIdentity.pubkey,
    signature: signature,
  },
  otherSignatures: [],
};

// Signed transacion you can POST to
// https://testnet.lisk.io/api/transactions
const bytesToPost = Encoding.fromUtf8(liskCodec.bytesToPost(signedTransaction));
console.log(bytesToPost);
```

## Lisk HD wallets

Lisk codec and Ed25519HdWallet combined allow you to create a pure
software implementation of the the Lisk wallet on Ledger or Trezor.

### Address discovery

The following code snipped shows how to implement address discovery.

```ts
import { Ed25519HdWallet } from "@iov/core";
import { Slip10RawIndex } from "@iov/crypto";
import { liskCodec, LiskConnection } from "@iov/lisk";

const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;

async function deriveAddress(wallet, a): Promise<Address> {
  // 44'/134'/a' (see https://github.com/trezor/trezor-core/tree/master/docs/coins)
  const path = [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(134), Slip10RawIndex.hardened(a)]
  const pubkey = (await wallet.createIdentity(path)).pubkey;
  return liskCodec.keyToAddress(pubkey);
}

async function getBalance(searchAddress: Address): Promise<any> {
  const connection = new LiskConnection("https://testnet.lisk.io/", liskTestnet);
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
  const balanceString = balance ? `${balance.whole + balance.fractional/100000000} LSK` : "unknown";
  console.log(`${a}: ${address} (${balanceString})`);

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
