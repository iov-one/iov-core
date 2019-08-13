# @iov/rise

[![npm version](https://img.shields.io/npm/v/@iov/rise.svg)](https://www.npmjs.com/package/@iov/rise)

## Getting started

The primary way to use @iov/rise is together with @iov/multichain. Alternatively,
you can use @iov/rise to create offline transactions which can be posted manually.

All examples are made for use in @iov/cli and you may need to include some
missing symbols if used in a different environment.

### Using with @iov/multichain

You can use @iov/rise as an extension of @iov/multichain to interact with the
RISE blockchain as follows.

```ts
import { Ed25519Wallet } from "@iov/keycontrol";
import { passphraseToKeypair, riseCodec, createRiseConnector } from "@iov/rise";

const wallet = new Ed25519Wallet();
const mainIdentity = await wallet.createIdentity(
  await passphraseToKeypair("squeeze frog deposit chase sudden clutch fortune spring tone have snow column"),
);

const profile = new UserProfile();
profile.addWallet(wallet);

const signer = new MultiChainSigner(profile);
await signer.addChain(createRiseConnector("https://twallet.rise.vision"));
const chainId = signer.chainIds()[0];
const connection = signer.connection(chainId);

const mainAddress = signer.identityToAddress(mainIdentity);
console.log("Sender address: " + mainAddress);
console.log((await connection.getAccount({ address: mainAddress })).data[0].balance);

const recipientAddress = "4278021116091793760R" as Address;

const sendTx: SendTransaction = {
  kind: "bcp/send",
  creator: mainIdentity,
  recipient: recipientAddress,
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "RISE" as TokenTicker,
  },
};

console.log("Sending transaction into the network blockchain …");
const response = await signer.signAndPost(sendTx);
console.log(
  `Wait a few seconds and visit https://texplorer.rise.vision/tx/${Encoding.fromAscii(response.data.txid)}`,
);
```

### The manual way

This is how you use `riseCodec` to generate send transactions
for RISE manually, i.e. without the help of @iov/multichain.

```ts
import { Ed25519Wallet } from "@iov/keycontrol";
import { passphraseToKeypair, generateNonce, riseCodec } from "@iov/rise";

const riseTestnet = "rise-296dc9a4d1" as ChainId;

const wallet = new Ed25519Wallet();
const mainIdentity = await wallet.createIdentity(
  await passphraseToKeypair("squeeze frog deposit chase sudden clutch fortune spring tone have snow column"),
);
const mainAddress = riseCodec.identityToAddress(mainIdentity);

const recipientAddress = "10145108642177909005R" as Address;

const sendTx: SendTransaction = {
  kind: "bcp/send",
  creator: mainIdentity,
  recipient: recipientAddress,
  amount: {
    whole: 1,
    fractional: 44550000,
    tokenTicker: "RISE" as TokenTicker,
  },
};

const nonce = generateNonce();
const signingJob = riseCodec.bytesToSign(sendTx, nonce);
const signature = await wallet.createTransactionSignature(
  mainIdentity,
  signingJob.bytes,
  signingJob.prehashType,
  riseTestnet,
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

// Signed transacion you can publish via
// curl -X PUT -H "Content-type: application/json" -d '{"transaction": INSERT_HERE}' https://twallet.rise.vision/api/transactions
const bytesToPost = Encoding.fromUtf8(riseCodec.bytesToPost(signedTransaction));
console.log(bytesToPost);
```

## RISE HD wallets

RISE codec and Ed25519HdWallet combined allow you to create a pure
software implementation of the the RISE wallet on Ledger or Trezor.

### Address discovery

The following code snipped shows how to implement address discovery.

```ts
import { Slip10RawIndex } from "@iov/crypto";
import { riseCodec, RiseConnection } from "@iov/rise";

const riseTestnet = "rise-296dc9a4d1" as ChainId;

async function deriveAddress(wallet, a): Promise<Address> {
  // 44'/1120'/a'
  // (see https://github.com/trezor/trezor-core/tree/master/docs/coins for account based derivation
  // paths and https://github.com/satoshilabs/slips/blob/master/slip-0044.md for RISE coin type)
  const path = [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(1120), Slip10RawIndex.hardened(a)];
  const identity = await wallet.createIdentity(path);
  return riseCodec.identityToAddress(identity);
}

async function getBalance(searchAddress: Address): Promise<any> {
  const connection = new RiseConnection("https://twallet.rise.vision/", riseTestnet);
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
  const balanceString = balance ? `${balance.whole + balance.fractional / 100000000} RISE` : "unknown";
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
