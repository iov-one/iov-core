# @iov/bns

[![npm version](https://img.shields.io/npm/v/@iov/bns.svg)](https://www.npmjs.com/package/@iov/bns)

This package is an implementation of the BlockchainConnection interface for the
BNS blockchain (currently just as
[bcp-demo](https://github.com/iov-one/bcp-demo) prototype). It should be able to
adapt this code fairly easily to support any other
[weave](https://github.com/iov-one/weave) based blockchain as well.

This provides a reference implementation of the full feature set of
`BlockchainConnection`, so it is also a good read when starting support of
another blockchain.

Simplest usage, to use auto-detecting tendermint client and standard bns
transaction parser:

```ts
const connection = await BnsConnection.establish("wss://rpc.lovenet.iov.one");
```

## Supported weave (bnsd) versions

| IOV-Core version | Supported weave versions |
| ---------------- | ------------------------ |
| 0.17             | 0.21.x                   |
| 0.16             | 0.19.x - 0.20.x          |
| 0.15             | 0.16.x                   |
| 0.14             | 0.14.x                   |
| 0.12 – 0.13      | 0.10.x - 0.11.x          |
| 0.9 – 0.11       | 0.4.x - 0.9.x            |
| 0.1 – 0.8        | 0.4.x - 0.8.x            |

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-bns/](https://iov-one.github.io/iov-core-docs/latest/iov-bns/)

The main entry point is the
[BnsConnection](https://iov-one.github.io/iov-core-docs/latest/iov-bns/classes/bnsconnection.html),
which creates a Tendermint client (from `iov-tendermint-rpc`) and a codec to
parse transactions. The BNS codec for reading and writing transactions (also
useful for MultiChainSigner) is exported as top-level
[bnsCodec](https://iov-one.github.io/iov-core-docs/latest/iov-bns/globals.html#bnscodec).

## License

This package is part of the IOV-Core repository, licensed under the Apache
License 2.0 (see
[NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and
[LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
