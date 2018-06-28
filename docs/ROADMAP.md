# Technical Roadmap (Rough)

This is a rough map of major points that need to be done to reach
some milestones

## Web4-write proof of concept

MVP just shows we can generate HD keys, save/load them, and use them to sign transactions and send tokens on the network.

- [x] HD Keyring works (with fixed path)
- [ ] KeyringController handles persistence
- [x] We can encode the sendtx transaction for bcp-demo (`bns-codec`)
- [ ] Tendermint rpc client
- [ ] Client wrapper to parse data as defined in [bcp-minimal](https://github.com/iov-one/bcp-spec/blob/master/library/web4/rpc/README.md#bcp-minimal)
- [ ] Simple cli (or repl) tool that will use web4 codebase to sign and send transactions, pulling proper nonce from the chain

## Web4-read proof of concept

- [ ] Clarify interface for blockchain client, including subscriptions (observable) and [bcp-basic](https://github.com/iov-one/bcp-spec/blob/master/library/web4/rpc/README.md#bcp-basic) 
- [ ] Enhance tendermint rpc wrapper to fulfill interface
- [ ] Produce a webapp that can show account balances using this interface
- [ ] Enhance webapp to show tx history

## BCP-Proxy proof of concept (Web4-read MVP)

- [ ] Add bcp-client that talks to bcp proxy and fulfills bcp-basic blockchain interface (as above)
- [ ] Add bcp-proxy implementation that talks to tendermint chain (demo: combing client and server)
- [ ] Add bcp-proxy implementation that talks to lisk
- [ ] Update above webapp to query over both lisk and tendermint chains with a chain selector

## Web4-write Extension MVP

- [ ] Define public API to call web4-write from webapp
- [ ] Design simple chrome extension that displays data from web4-write, creates accounts, requests confirmations on signing transactions
- [ ] Update webapp to talk to web4-write to query current account and show that balance
- [ ] Update webapp to send "sendtx" requests to web4-write based on user input in webapp
- [ ] MVP should show balances and allow sending in normal webapp, all keys and transactions confirmation in chrome extension
- [ ] Support both bcp-demo chain as well as Lisk (via bcp-proxy)

## Enhancement: Flexible Web4-Read
Depends on: Backend implmentation and deployment of "bcp-plus" chain as bcp-demo extended

- [ ] Design extensible query endpoints from client -> bcp-proxy -> chain
- [ ] Define some "query definition format" to define/discover what queries are possible
- [ ] Add "codec definition format" for protobuf parsing and transformation, use this with tendermint-rpc to talk to a bcp-plus chain 
- [ ] Demonstrate adding a query over bcp-proxy (using in turn the expanded tendermint-rpc client to talk to the blockchain)

## Enhancement: Flexible Web4-Write

- [ ] Design "meta-codec" format that can generate chain-specific tx-codec for a "blockchain family" given a defintion file...
  - eg. all weave-based systems could share a meta-codec that allows adding individual tx, all ethereum chains could customize the swap contract in their definiton, etc.
- [ ] Add definitions for bcp-demo and bcp-plus example to the package
- [ ] Auto-generate chain codecs from meta-codec + definition in "txBuilder" lookup
- [ ] Sign bcp-plus transactions without hardcoding them in web4-write (only using defintion files)
- TODO.....

## Enhancement: BNS Integration
Depends on: BNS implementation on backend completed and deployed

- [ ] Add BCP-Plus query integration for full BNS feature set
- [ ] Complete full tx-codec support for all BNS transactions
- [ ] Add support for name lookup to chrome extension
- [ ] Add management of value name (registration/transfer) to Chrome extension
- [ ] Add lookup of chains to chrome extension and webapp (extend "chain selector")
- [ ] Add queries and browsing of names/chains to webapp (not extension)

## Enhancement Dynamic Codecs

- [ ] Support downloading codec definitions from BNS
- TODO.....

## Enhancement: Secure Queries

- [ ] Add merkle proofs to all weave/bcp-demo/bns query responses
- [ ] Write typescript light-client implementation to verify headers and proofs
- [ ] Integrate this with tendermint rpc to produce secure query
- [ ] Use Secure Queries to query BNS chain, provide a "root of trust" header in the app
- TODO....

## Enhancement: Ethereum Proxy

- [ ] Upload (or use existing) contracts to provide support for swap and name service on ethereum
- [ ] Add meta-codec to create ethereum transactions for these contracts
- [ ] Add definition files for 1-2 testnets and mainnet
- [ ] Add bcp-proxy support to provide bcp-basic support using the chosen contracts
- [ ] Add secp256k1 HD support to keybase
- [ ] Sign ethereum tx with same HD path as metamask (can import mneumonic to grant access to other account)
- [ ] Verify we can use ethereum chains just like lisk or bcp-demo chain with same webapp, and switch between chains

## Enhancement: Electron App

- [ ] Package webapp (using web4-read) and web4-write into one electron binary
- [ ] Provide nicer integration of confirmation steps (now that is it not a "malicious webapp" but the same binary making tx requests)
- [ ] Provide downloadable version of electron app for download
- [ ] Experiment with deterministic builds, allowing multiple people to compile and sign the same binary
- TODO....

## Enhancement: React-Native App

- [ ] Package webapp (using web4-read) and web4-write into one react-native binary
- [ ] Provide simple tx sending workflow (as per electron app)
- [ ] Provide downloadable version of Android (and iOS?) app for download
- [ ] Experiment with deterministic builds, allowing multiple people to compile and sign the same binary
- TODO....