# @iov/keycontrol

[![npm version](https://img.shields.io/npm/v/@iov/keycontrol.svg)](https://www.npmjs.com/package/@iov/keycontrol)

Keycontrol manages all private keys and keeps them safe.

![KeyBase Diagram](https://raw.githubusercontent.com/iov-one/iov-core/master/docs/KeyBaseDiagram.png)

Please stick to using the
[public API](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/userprofile.html)
even if you are importing from JavaScript, where `private` is not enforced.

## Getting started

Please see the following documents for how to get started using the
`@iov/keycontrol` classes:

1. [@iov/core README](https://github.com/iov-one/iov-core/tree/master/packages/iov-core/README.md)
2. [@iov/cli README](https://github.com/iov-one/iov-core/tree/master/packages/iov-cli/README.md)

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/)

As you see above, everything goes through the
[UserProfile](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/userprofile.html),
which is the main entry point into this package.

The main wallet types you can add are

- [Ed25519Wallet](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/ed25519wallet.html),
  which stores arbitrary Ed25519 keypairs.
- [Ed25519HdWallet](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/ed25519hdwallet.html),
  which generates HD keys à la SLIP-0010 (BIP-0032), with an arbitrary path (not
  chain-dependent).
- [LedgerSimpleAddressWallet](https://iov-one.github.io/iov-core-docs/latest/iov-ledger-bns/classes/ledgersimpleaddresswallet.html)
  which allows you to connect to a Ledger device for signing BNS transaction.

## HD derivation paths

Ed25519HdWallet and Secp256k1HdWallet use SLIP-0010 HD key derivation. The class
[HdPaths](https://iov-one.github.io/iov-core-docs/latest/iov-keycontrol/classes/hdpaths.html)
can be used to generate derivation paths.

| Coin     | Derivation path for<br>account index `a = 0,1,…` | Code                     |
| -------- | ------------------------------------------------ | ------------------------ |
| IOV      | `m/44'/234'/a'`                                  | `HdPaths.iov(a)`         |
| Ethereum | `m/44'/60'/0'/0/a`                               | `HdPaths.ethereum(a)`    |
| Lisk     | `m/44'/134'/a'`                                  | `HdPaths.bip44(134, a)`  |
| RISE     | `m/44'/1120'/a'`                                 | `HdPaths.bip44(1120, a)` |
| Stellar  | `m/44'/148'/a'`                                  | `HdPaths.bip44(148, a)`  |

## License

This package is part of the IOV-Core repository, licensed under the Apache
License 2.0 (see
[NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and
[LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).
