# @iov/transport

[![npm version](https://img.shields.io/npm/v/@iov/transport.svg)](https://www.npmjs.com/package/@iov/transport)

@iov/transport defines a generic request-response as well as subscription-based (push) API.
It takes an abstract `Connection` that provides a `send` function and a `receive` Stream.
The intent is to reuse the higher-level logic on top of any message-based communication API.
So, we can use the same handlers over websockets, with browser extension, over messaging platform,
and optionally add a layer of end-to-end encryption seemlessly over the basic communication.

We use this API to define various "cut-points" in our API, that may wish to cross
process boundaries. eg. an untrusted dapp with the IovWriter transaction singner.
The UserProfile with an out-of-process KeyringEntry (eg. hardware with driver).
This package should capture all generic functionality used in the various packages.

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
