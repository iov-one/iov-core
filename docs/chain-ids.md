# Chain IDs

| Status | Author                    | Created    | Last updated | License   |
| ------ | ------------------------- | ---------- | ------------ | --------- |
| Draft  | The document contributors | 2019-05-23 | 2019-06-05   | CC-BY-4.0 |

## Abstract

In the IOV ecosystem, many tools can be used with different blockchains.
Client-side, this is every application built on top of IOV-Core. Backend-side,
this is the Blockchain Name System (BNS), a lookup service which enables the
assignment of native blockchain addresses to human readable names.

All this tooling needs to be able to uniquely identify a blockchain, which is
what chain IDs do. The chain ID is interpreted client-side only and all client
software that wants to be compatible needs to agree on the same set of chain
IDs. The BNS just stores chain IDs without interpreting them.

## Format

A chain ID is a case-sensitive string in the format `^[a-zA-Z0-9_.-]{4,32}$`.
When choosing a new chain ID, the following guildelines should be followed:

1. Choose a chain ID that is long enough to be unique within the blockchain
   ecosystem.
2. Choose a chain ID as short as possible to avoid unnecessary data.
3. Choose a chain ID that is to some degree human readable and helps for basic
   debugging.

Some bad chain IDs are `ethereum` (violates 1.),
`da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba` (violates 2.
and 3.). Better alternatives are `ethereum-eip155-3` and `lisk-da3ed6a454`.

### Reserved

Chain IDs starting with `local-` are reserved for local chains. Please note the
trailing `-`, i.e. `localichain` could be registered at some point.

## Registry

The following chain IDs are registered. Please add new chain IDs via a pull
request.

| Chain ID             | Description                                                                                                                             | Example                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `iov-%s`             | An IOV chain with the network name in `%s`                                                                                              | `iov-lovenet` for the Lovenet testnet                                   |
| `ethereum-eip155-%d` | An Ethereum chain with the chain ID from [EIP155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md) in the placeholder `%d` | `ethereum-eip155-1` for Ethereum mainnet, `ethereum-eip155-5` for Görli |
| `lisk-%s`            | A Lisk chain with a 10 digit prefix of the nethash in `%s`                                                                              | `lisk-da3ed6a454` for the Lisk testnet                                  |
| `rise-%s`            | A RISE chain with a 10 digit prefix of the nethash in `%s`                                                                              | `rise-296dc9a4d1` for the RISE testnet                                  |

## Background

- The term "chain ID" comes from the Tendermint genesis file entry and was
  adapted for our context.

## Contributors

Substantial contributions by the following people in the form of text, review
and ideas made this document possible:

- Simon Warta ([webmaster128](https://github.com/webmaster128))
- Ethan Frey ([ethanfrey](https://github.com/ethanfrey))
- Isabella Dell ([isabello](https://github.com/isabello))
- Will Clark ([willclarktech](https://github.com/willclarktech))

## License

This document is licensed under a
[Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/).
