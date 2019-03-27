# Technical Roadmap (Rough)

This is a rough map of major points that need to be done to reach some
milestones

The Roadmap is a work-in-progress, so please add comments to help clarify and
point out missing items

---------------- (Mostly) finished, may need polish ----------------

## BcpConnection/writer MVP

MVP just shows we can generate HD keys, save/load them, and use them to sign
transactions and send tokens on the network.

- [x] HD Keyring works (with fixed path)
- [x] KeyringController handles persistence
- [x] We can encode the sendtx transaction for bcp-demo (`bns-codec`)
- [x] Tendermint RPC client
- [x] Client wrapper to parse data as defined in
      [bcp-minimal](https://github.com/iov-one/bcp-spec/blob/master/library/iov-core/rpc/README.md#bcp-minimal)
- [x] Simple cli (using repl) tool that will use `IOV Core` codebase to sign and
      send transactions. Queries proper nonce from the chain

## Wallet integration

- [x] Cleanup, open source, and publish iov-core to npm
- [x] Produce a [webapp](https://github.com/iov-one/bcp-menu) that can show
      account balances using above interface
- [x] Enhance webapp to show tx history

## Ledger integration (on hold)

- [x] Implement ledger app that can sign BNS transactions with ed25519
- [x] Call into ledger app from Typescript repo (iov-ledger-bns)
- [x] Wrap ledger into KeyringEntry interface (like Ed25519SimpleAddress)
- [x] Update all bcp-demo code and client code to always prehash sha512
- [x] Demo usage in CLI
- [ ] Investigate possibilities and integrate into web wallet (if possible???)

## Streaming interface

- [x] Clarify interface for blockchain client, including subscriptions
      (observable)
- [x] Enhance Tendermint RPC wrapper to fulfill interface
- [/] Enhance Lisk/Ethereum adaptors to fulfil interface
- [x] Update wallet to use new realtime/reactive interface

## Add support for NFTs (bns only)

- [x] DEPENDENCY: implement NFTs in bcp-demo
- [x] Update bns protobuf definitions from new bcp protobuf files
- [x] Add more transaction types and codec support
- [x] Write integration tests of NFT transfer with bcp-demo
- [ ] Update with full suite of NFTs

## Ethereum Proxy

- [x] Add secp256k1 HD support to `keybase` (same hd path as
      ed25519simpleaddress for now)
- [x] Add `bcp-proxy` support to provide `bcp-basic` queries for account balance
- [x] Add support for sendtx with ETH (encode simple transaction and submit to
      blockchain)
- [/] Enable querying all transactions per account (note: currently using
  etherscan)
- [x] Add support for 1 testnet, mainnet, and poanetwork
- [ ] Extend sendtx and queries to handle erc20 tokens, by hardcoding a lookup
      of token name to contract address and sigfigs
- [ ] Transaction history shows ERC20 amounts as well as ETH amounts
- [ ] Implement atomic swap contract in solidity
- [ ] Add swap transactions and queries that interact with our uploaded swap
      contract (using hardcoded contract address)
- [x] Sign Ethereum tx with same HD path as metamask. Importing mnemonic enables
      use in iov-core and metamask
- [/] Verify we can use Ethereum chains just like Lisk or `bcp-demo` chain with
  same webapp, and switch between chains

## Value name support

- [/] Add transactions to buy, (TODO: transfer, swap) values names (building on
  NFTs)
- [x] Improve queries to show proper names for account lookups (bns surely and
      bcp-proxy maybe?)
- [x] Expose API for integration in web wallet (using observables as above)

---------------- Next steps ----------------

## Core-Writer Extension MVP (chrome and firefox?)

- This is to create the equivalent of the metamask plugin using iov-core library
  under the hood... one approach to securely handle keys in Blockchain UIs, but
  not the only
- [ ] Define public API to call `MultiChainSigner` from webapp
- [ ] Design simple chrome extension that displays data from `MultiChainSigner`,
      creates accounts, requests confirmations on signing transactions
- [ ] Update webapp to talk to MultiChainSigner to query current account and
      show that balance
- [ ] Update webapp to send "sendtx" requests to MultiChainSigner based on user
      input in webapp
- [ ] MVP should show balances and allow sending in normal webapp, all keys and
      transactions confirmation in chrome extension
- [ ] Support both `bcp-demo` and Lisk (and Ethereum, if implemented already)
      chains

## Enhancement: BNS Integration

Depends on: BNS implementation on backend completed and deployed

- [x] Add `BCP-Plus` query integration for full BNS feature set
- [ ] Complete full `tx-codec` support for all BNS transactions
- [ ] Add support for name lookup via chrome extension
- [ ] Add management of value name (registration/transfer) to Chrome extension
- [ ] Add lookup of chains via chrome extension and webapp (extend "chain
      selector")
- [ ] Add queries and browsing of names/chains via webapp (not extension)

## Enhancement: Cosmos-Sdk support

- [ ] Find/build and test reliable codec for amino encoding in Typescript (look
      at irisnet work to repurpose protobuf.js)
- [ ] Find/build and test reliable codec for "canonical json" encoding for
      building sign bytes
- [ ] Create valid secp256k1 signatures that match golang code expectations
- [ ] Query and parse account balances from cosmos-sdk binary
- [ ] Create a sendtx accepted by cosmos-sdk binary
- [ ] Query and parse transaction (given an account)
- [ ] Complete high-level BcpConnection tests for querying and moving tokens
- [ ] Add streaming support (watch transactions and account)
- [ ] Add 1-2 custom transactions and queries to demonstrate feasibility

## Enhancement: Secure Queries

- [ ] Add merkle proofs to all weave/bcp-demo/bns query responses
- [ ] Write typescript light-client implementation to verify headers and proofs
- [ ] Integrate this with tendermint rpc to produce secure query
- [ ] Use Secure Queries to query BNS chain, provide a "root of trust" header in
      the app
- TODO....

---------------- Rough ideas not quite ready for backlog ----------------

## Enhancement: Flexible Core-Writer (maybe rethink this one)

- [x] Design extensible transaction interfaces
- [ ] Design `meta-codec` format that can generate chain-specific tx-codec for a
      "blockchain family" given a definition file...
  - all weave-based systems could share a meta-codec that allows adding
    individual tx,
  - all Ethereum chains could customize the swap contract in their definition,
    etc.
- [ ] Add definitions for `bcp-demo` and `bcp-plus` example to the package
- [ ] Auto-generate chain codecs from `meta-codec` + definition in "txBuilder"
      lookup
- [ ] Sign `bcp-plus` transactions using only definitions
- TODO....

## Enhancement: Other chains

- [ ] Cosmos Hub
- [ ] Stellar
- [ ] Quorum (modified ethereum/web3 interface)
- [ ] Tezos
- [ ] NEM?
- [ ] NEO?
- [ ] Ripple?
- [ ] Various Lisk/Ethereum compatible forks (since we have the code already)

## Enhancement Dynamic Codecs

- [ ] Support downloading codec definitions from BNS
- TODO: Add more detail

## Enhancement: Electron App

- [ ] Package webapp containing `BcpConnection` and `MultiChainSigner` into an
      electron binary
- [ ] Provide streamlined integration of confirmation steps, as the binary
      should trust itself
- [ ] Provide packaged version of electron app for download
- [ ] Experiment with deterministic builds, allowing multiple people to compile
      and sign the same binary
- TODO....

## Enhancement: React-Native App

- [ ] Package webapp containing `BcpConnection` and `MultiChainSigner` into a
      react-native binary
- [ ] Provide simple tx sending workflow (as per electron app)
- [ ] Provide downloadable version of Android (and iOS?) app for download
- [ ] Experiment with deterministic builds, allowing multiple people to compile
      and sign the same binary
- TODO....

## Earlier work

- `iov-keybase` was a start to sketch out a public api that could be used when
  used out of process as a browser extension. It's available on the git tag
  `iov-keybase`:
  https://github.com/iov-one/iov-core/tree/iov-keybase/packages/iov-keybase
- The `KeyController` interface was an approach to design the key controller
  from top to bottom, which has been superceeded by a bottom-to-top approach
  that resulted in the now active UserProfile. It's available on the git tag
  `keycontroller-interface`:
  https://github.com/iov-one/iov-core/blob/keycontroller-interface/packages/iov-keycontrol/src/keycontroller.d.ts
