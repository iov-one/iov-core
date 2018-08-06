# IOV BNS

This module is an implementation of the IovReader
interface for the BNS blockchain 
(currently just as [bcp-demo](https://github.com/iov-one/bcp-demo) prototype). 
It should be able to adapt this code
fairly easily to support any other [weave](https://github.com/confio/weave)
based blockchain as well.

Simplest usage, to use auto-detecting tendermint client and standard
bns transaction parser:

```
const client = await Client.connect('wss://bov.wolfnet.iov.one');
```

## Api Internal

The main entry point is the [Client](./classes/client.html), which
takes a tendermint client (from `iov-tendermint-rpc`) and a codec
to parse transactions. BnsCodec for reading and writing transactions
(also useful for IovWriter) is exported as top-level
[bnsCodec](./globals.html#bnscodec)