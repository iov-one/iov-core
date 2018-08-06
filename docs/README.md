# IOV Core Overview

Below is a general image of interactivity between components of the BCP/Iov-Core system proposed by IOV.

![IOV Core Overview](./iov-core-overview.png)

This document deals specifically with the IOV Core components. However, in the interest of explaining the diagram completely, there are some non IOV Core components described.

# IOV Core Components

The above diagram provides the connectivity flow which a IOV Core based application will follow to enable users to access the system. There are two main avenues for accessing blockchains that are connected via the BCP. These include:

- core-reader: Queries BCP proxies for data for informational purposes
- core-writer: Queries BCP Proxies or the BNS for data that must be verified before being used for write activity

The various feature set of BCP (`BCP-Minimal`, `BCP-Basic`, ...) are covered in more detail in the 
[BCP Specification](https://github.com/iov-one/bcp-spec/blob/master/library/web4/rpc/README.md#bcp-basic)

## core-reader

The `core-reader` library provides the entire feature set of `BCP-Minimal` and support for `BCP-Basic` as well. `BCP-Minimal`, as evidenced in the diagram, provides the ability to query the proxy for nonce and balance. This does not include the write specific functionality of `sendTx` or `checkTx`, as those operations can only occur in a trusted environment offered by the `keybase`.

`BCP-Basic` offers extended support for the full feature set of the BCP. This includes querying for:

- `Transaction History`
- `Atomic Swaps/Escrow Transactions`
- `Non Fungible Token States`

This suite of features indicates total compatibility with the BCP specification and its core features.

The basic feature set can be extended by both the `BCP-Proxy` and `core-reader` and is aptly named `BCP-Plus`. This means it includes all of the features of `BCP-Basic` and any new feature that are native to an implementation. This could include new endpoints, or extended functionality to existing endpoints. `BCP-Plus` serves as a blanket definition for any enhanced functionality that is not native to the core `BCP` specification.

## core-writer

In order to ensure users are not being fooled by the web application layer, `core-writer` is given the ability to query a subset of the `BCP` specification. This subset is named `BCP-Minimal`, as it includes the very base set of features needed to safely perform write operations against a blockchain system. This feature set enables the `keybase` to discover the proper `nonce` for a wallet address, and current balance. Additionally, this mechanism is how transactions are sent and subsequently verified by the `keybase`.

`core-writer` also includes the ability to query the `BNS` directly, as these operations explicitly require verifiable proofs to ensure users are not lied to. The `BNS` feature set includes the `BCP-Minimal` feature set, and the ability to query registered `names` and `blockchain definitions`. Both of these queries include the proofs needed to make operations safe.

## Web Apps

The web app is a general concept in the system, this can be a web page, an electron app or some other application with the ability to implement both `core-reader` and communicate with the `keybase` application. It will use `core-reader` to perform queries against a proxy system and provide state to users. It will communicate with the `keybase` to perform blockchain specific write operations.

#### Query

Web apps will query through `core-reader` and provide information back to the application.

#### Sign/Verify

Web apps will pass all signing and verification requests to the `keybase`, which will either perform a specific set of queries to create transactions, or verify transactions against an existing blockchain.

## BCP-Proxy

The `BCP-Proxy` serves an abstraction layer that is independent of `IOV Core`. It offers the ability to subscribe to an account state on for a given blockchain. At a minimum, for a blockchain to be supported, it needs to have a proxy node that supports the `BCP-Minimal` feature set.

## Blockchain

The blockchain is a generic concept, it lives behind the proxy and provides its data either through subscriptions from the proxy, or through polling from the proxy when requested.

## Blockchain - BNS

The BNS is a first class citizen in the ecosystem of `IOV Core`. It provides the critical functions of locating supported blockchains, and registered name <> accounts. This functionality is critical for `IOV Core` operations and must have the highest level of trust. This means that `core-writer` must be able to query it directly to ensure there is no falsification of the data itself, or the proofs provided with the data.


# Roadmap

The [roadmap](ROADMAP.md) covers the route needed to achieve the vision of the above system.
