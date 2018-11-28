# @iov/ethereum

[![npm version](https://img.shields.io/npm/v/@iov/ethereum.svg)](https://www.npmjs.com/package/@iov/ethereum)

## Getting started

The primary way to use @iov/ethereum is together with @iov/core. Alternatively,
you can use @iov/ethereum to create offline transactions which can be posted manually.

All examples are made for use in @iov/cli and you may need to include some
missing symbols if used in a different environment.

### Using with @iov/core

You can use @iov/ethereum as an extension of @iov/core to interact with the
Ethereum blockchain as follows.

### Local test

To run Ethereum tests locally, you need to install ganache and start with the following settings:
- RPC Server: `http://127.0.0.1:8545`
- Network ID: `5777`
- Mnemonic: `oxygen fall sure lava energy veteran enroll frown question detail include maximum`

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
