# Architecture

This is an overview of how the components fit together in the web4 library.
Please look at the [high-level specification](https://github.com/iov-one/bcp-spec)
before reading this document. In particular,
[web4.md](https://github.com/iov-one/bcp-spec/blob/master/web4.md) and
[library/keys](https://github.com/iov-one/bcp-spec/tree/master/library/keys)

## High-level APIS

We provide two APIs, one of which is designed to be used in-process with a
trusted UI bundled with the library (keystore manager) that can do privileged
operations like list all keys or approve a transaction for signing.
We also provide a second "public" API to external processes that wish
to perform operations, with limited access.

Think of this as a website calling into [Metamask](https://metamask.io/) to sign a tx. That
call is on the "public" interface, whereas the "approve" button from
the UI would call into the "private" interface.

### What to expose....

 It is important to limit the scope of what websites and other software can
access within the system. The publically accessible information must pass
through a permissioning layer, which is described
[here](https://github.com/iov-one/bcp-spec/blob/master/library/keys/publicAPI.md).

The data exposed to authorized systems should be limited to wallet identifying
information, such as address and public key.

## Key Store

The private API can list all keys, lock or unlock personas
(each of which controls a distinct keychain locked with a different password),
and select which one is active. The private API must also provide
callbacks to approve signing a tx, which is trigger from elsewhere.

The public API is exposed through web4 and consists of viewing
the currently selected key, being informed when it changes,
and proposing a JSON object to be converted into as tx to sign.

## Building Tx

We register a lookup of `chain-id: string => tx: json => Tx` for every
chain that we support. This will find a proper encoding function
for the blockchain, so we can convert human-readable JSON (which we
display in the signing approval process) into a tx that knows how
to encode itself to binary, and calculate the proper bytes to sign
and signature format.

```
buildTx(data: json) => Tx

interface Tx {
    signBytes: (publicKey: Uint8Array, nonce: Uint8Array) => bytesToSign: Uint8Array
    addSignature: (publicKey: Uint8Array, nonce: Uint8Array, signature: Uint8Array) => Tx
    txBytes: () => rawBytes: Uint8Array
    txID: () => hash: Uint8Array
}
```

TODO: if we read the existing tx on the blockchain that may have come from another
client, we also need a `parseTx(rawBytes: Uint8Array) => Tx` method for each blockchain
and a `Tx.asJSON: () => json` function to display it. Hmmm... let's think about this

## Blockchain Client

The blockchain client should be able to query and subscribe to
[nonces](https://github.com/iov-one/bcp-spec/blob/master/library/proxy/Nonce.md)
and
[transactions](https://github.com/iov-one/bcp-spec/blob/master/library/proxy/Transactions.md).

```
queryNonce()
onUpdateNone(cb)

queryTx(txID)
listenTx(txID, cb) => different state: pending, unconfirmed, confirmed...
```

## Name service

Do we integrate the name service here or is this higher level?

* We will have to query the blockchain name => bootstrap nodes here.
* I guess we should also do the username lookup as well to be secure.


## How to tie it all together...

We can make a simple API with functions to get or set data, and possibly use
EventEmiter or callbacks to subscribe to events. However, we can try to do
better than that.

* Idea: Use Redux for managing state (TODO: Will explain better and link page)
* Idea: Use MobX and obeserve state changes
* Something else? RxJS??? Unification of the above?
