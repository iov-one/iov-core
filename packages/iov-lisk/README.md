# @iov/lisk

[![npm version](https://img.shields.io/npm/v/@iov/lisk.svg)](https://www.npmjs.com/package/@iov/lisk)

## Getting started

The primary way to use @iov/lisk is together with @iov/multichain. Alternatively,
you can use @iov/lisk to create offline transactions which can be posted manually.

All examples are made for use in @iov/cli and you may need to include some
missing symbols if used in a different environment.

### Using with @iov/multichain

You can use @iov/lisk as an extension of @iov/multichain to interact with the
Lisk blockchain as follows.

```ts
import { Ed25519Wallet } from "@iov/keycontrol";
import { passphraseToKeypair, liskCodec, createLiskConnector } from "@iov/lisk";

const wallet = new Ed25519Wallet();
const mainIdentity = await wallet.createIdentity(
  await passphraseToKeypair(
    "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
  ),
);

const profile = new UserProfile();
profile.addWallet(wallet);

const signer = new MultiChainSigner(profile);
await signer.addChain(createLiskConnector("https://testnet.lisk.io"));
const chainId = signer.chainIds()[0];
const connection = signer.connection(chainId);

const mainAddress = signer.identityToAddress(mainIdentity);
console.log((await connection.getAccount({ address: mainAddress })).data[0].balance);

const recipientAddress = "6076671634347365051L" as Address;

const sendTx: SendTransaction = {
  kind: "bcp/send",
  creator: mainIdentity,
  recipient: recipientAddress,
  memo: "We ❤️ developers – iov.one",
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "LSK" as TokenTicker,
  },
};

console.log("Writing to blockchain. This may take a while …");
await signer.signAndPost(mainIdentity, sendTx);
console.log((await connection.getAccount({ address: recipientAddress })).data[0].balance);
```

### The manual way

This is how you use `liskCodec` to generate send transactions
for Lisk manually, i.e. without the help of @iov/multichain.

```ts
import { Ed25519Wallet } from "@iov/keycontrol";
import { passphraseToKeypair, generateNonce, liskCodec } from "@iov/lisk";

const liskTestnet = "lisk-da3ed6a454" as ChainId;

const wallet = new Ed25519Wallet();
const mainIdentity = await wallet.createIdentity(
  await passphraseToKeypair(
    "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
  ),
);

const recipientAddress = "6076671634347365051L" as Address;

const sendTx: SendTransaction = {
  kind: "bcp/send",
  creator: mainIdentity,
  recipient: recipientAddress,
  memo: "We ❤️ developers – iov.one",
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "LSK" as TokenTicker,
  },
};

const nonce = generateNonce();
const signingJob = liskCodec.bytesToSign(sendTx, nonce);
const signature = await wallet.createTransactionSignature(
  mainIdentity,
  signingJob.bytes,
  signingJob.prehashType,
  liskTestnet,
);

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

The following code snippet shows how to implement address discovery.

```ts
import { Ed25519HdWallet } from "@iov/multichain";
import { Slip10RawIndex } from "@iov/crypto";
import { liskCodec, LiskConnection } from "@iov/lisk";

const liskTestnet = "lisk-da3ed6a454" as ChainId;

async function deriveAddress(wallet, a): Promise<Address> {
  // 44'/134'/a' (see https://github.com/trezor/trezor-core/tree/master/docs/coins)
  const path = [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(134), Slip10RawIndex.hardened(a)];
  const pubkey = (await wallet.createIdentity(path)).pubkey;
  return liskCodec.keyToAddress(pubkey);
}

async function getBalance(searchAddress: Address): Promise<any> {
  const connection = new LiskConnection("https://testnet.lisk.io/", liskTestnet);
  const response = await connection.getAccount({ address: searchAddress });
  return response.data.length > 0 ? response.data[0].balance[0] : undefined;
}

const wallet = Ed25519HdWallet.fromMnemonic(
  "tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral",
);

// from https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
const gapLimit = 20;

let currentGapSize = 0;
for (let a = 0; currentGapSize < gapLimit; a++) {
  const address = await deriveAddress(wallet, a);
  const balance = await getBalance(address);
  const balanceString = balance ? `${balance.whole + balance.fractional / 100000000} LSK` : "unknown";
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
