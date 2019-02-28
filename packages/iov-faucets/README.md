# @iov/faucets

[![npm version](https://img.shields.io/npm/v/@iov/faucets.svg)](https://www.npmjs.com/package/@iov/faucets)

Use some Testnet faucets from JavaScript.

## Getting started

The basic usage of this package is:

```ts
import { TokenTicker } from "@iov/bcp";
import { IovFaucet } from '@iov/faucets';

const faucet = new IovFaucet("https://iov-faucet.yaknet.iov.one");
await faucet.credit(address, "IOV" as TokenTicker)
```

There is a complete example in the [@iov/cli README](https://github.com/iov-one/iov-core/blob/master/packages/iov-cli/README.md#faucet-usage).

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-faucets/](https://iov-one.github.io/iov-core-docs/latest/iov-faucets/)

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
