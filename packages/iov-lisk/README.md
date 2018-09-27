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
import { liskCodec, liskConnector, LiskKeyringEntry } from "@iov/lisk";

const entry = new LiskKeyringEntry();
const mainIdentity = await entry.createIdentity("oxygen fall sure lava energy veteran enroll frown question detail include maximum");

const profile = new UserProfile();
profile.addEntry(entry);

const writer = new IovWriter(profile);
await writer.addChain(liskConnector("https://testnet.lisk.io"));
const chainId = writer.chainIds()[0];
const reader = writer.reader(chainId);

const mainAddress = writer.keyToAddress(chainId, mainIdentity.pubkey);
console.log((await reader.getAccount({ address: mainAddress })).data[0].balance);

const recipientAddress = Encoding.toAscii("6076671634347365051L") as Address;

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
await writer.signAndCommit(sendTx, 0);
console.log((await reader.getAccount({ address: recipientAddress })).data[0].balance);
```

### The manual way

This is how you use `liskCodec` and `LiskKeyringEntry` to generate send transactions
for Lisk manually, i.e. without the help of @iov/core.

```ts
import { liskCodec, LiskKeyringEntry } from "@iov/lisk";

const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;

const entry = new LiskKeyringEntry();
const mainIdentity = await entry.createIdentity("oxygen fall sure lava energy veteran enroll frown question detail include maximum");

const recipientAddress = Encoding.toAscii("6076671634347365051L") as Address;

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

// Encode creation timestamp into nonce
const nonce = Long.fromNumber(Math.floor(Date.now() / 1000)) as Nonce;
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

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
