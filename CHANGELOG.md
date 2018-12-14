# Changelog

## 0.10.1

* @iov/tendermint-rpc: convert `const enum`s to `enum`s in public interface to
  allow callers to use `--isolatedModules`.

## 0.10.0

* @iov/bcp-types: `BcpTransactionResponse` now contains a `blockInfo` property
  that allows you to get block related data associated with the transactions
  and subscribing to updates. `metadata` was deprecated in favour of `blockInfo`.
* @iov/bcp-types: the new interfaces `getBlockHeader` and `watchBlockHeaders`
  provide block header information.
* @iov/bns: Fix encoding of `BcpTxQuery.hash` in `listenTx` and `liveTx`
* @iov/socket: New package with wrappers around WebSockets: `SocketWrapper`
  and `StreamingSocket` used by tendermint-rpc and Ethereum.
* @iov/stream: Add `toListPromise` that collects stream events and returns a
  list when done.
* @iov/stream: `ValueAndUpdates.waitFor` now returns the values that matched
  the search condition.
* @iov/stream: `DefaultValueProducerCallsbacks.error` added to produce errors.
* @iov/tendermint-rpc: Gracefully handle duplicate subscriptions.

Breaking changes

* @iov/base-types: Remove `TxId` in favour of `TxHash` in @iov/tendermint-rpc.
* @iov/bcp-types: An `Amount` is now a `quantity` expressed as a string, a
  `fractionalDigits` number and a `tokenTicker`. This replaces the `whole`,
  `fractional` pair. `BcpTicker` does not contain `sigFigs` anymore because
  it is not needed there. `BcpCoin` is now an `Amount` and a `BcpTicker`.
* @iov/bcp-types: Wrapper type `BcpNonce` was dropped from all interfaces
  in favour of just `Nonce`.
* @iov/bcp-types: `BcpConnection.getNonce`/`.watchNonce` now only accept
  `BcpAddressQuery` or `BcpPubkeyQuery` as argument type.
* @iov/bcp-types: `BcpConnection.listenTx` now takes an `BcpTxQuery` argument
  analogue to `.searchTx` and `.liveTx`.
* @iov/bcp-types: `BcpTransactionResponse` was removed in favour of the new
  `PostTxResponse`.
* @iov/bcp-types: Change binary `TransactionIdBytes` to printable
  `TransactionId` and use in `TxCodec.identifier`, `PostTxResponse` and
  `BcpTxQuery`.
* @iov/bcp-types: `BcpTxQuery.tags` is now optional
* @iov/bcp-types: Remove type `RecipientId`; use `Address` instead.
* @iov/bcp-types: Remove unused `BaseTx.ttl` and `TtlBytes`
* @iov/bcp-types: Allow extension of transaction types: move BNS transactions
  into @iov/bns, rename generic ones to `SendTransaction` and
  `Swap{Offer,Claim,Counter,Timeout}Transaction`. Property `kind` is now
  a string in the format "{domain}/{concrete_type}", e.g. "bcp/send" or
  "bns/set_name".
* @iov/bns: `BnsConnection.postTx` now resolves before a transaction is in a
  block. The field `blockInfo` of its response can be used to track the
  transaction state.
* @iov/bns: `getHeader`/`watchHeaders` were removed in favour of
  `getBlockHeader`/`watchBlockHeaders` from BCP.
* @iov/core: Rename `MultiChainSigner.signAndCommit` -> `.signAndPost`
* @iov/crpto: the new types `Secp256k1Signature` and `ExtendedSecp256k1Signature` replace DER encoded signatures in `Secp256k1`.
* @iov/faucets: Remove `BovFaucet`. Use `IovFaucet` instead.
* @iov/keycontrol: `Secp256k1HdWallet.createTransactionSignature` now uses the custom fixed length encoding instead of DER to allow blockchains utilizing the recovery parameter.
* @iov/stream: `streamPromise` was renamed to `fromListPromise`.
* @iov/tendermint-rpc: Rename `txCommitSuccess` to `broadcastTxCommitSuccess` and add `broadcastTxSyncSuccess`
* @iov/tendermint-rpc: Remove all fields from `BroadcastTxAsyncResponse`
* @iov/tendermint-rpc: Change type of `BroadcastTxSyncResponse.hash` to `TxId`
* @iov/tendermint-rpc: Un-export interface `RpcTxEvent`
* @iov/tendermint-rpc: Change all `Method` enum names to PascalCase
* @iov/tendermint-rpc: `Client.subscribeTx` now takes a `QueryString` argument
* @iov/tendermint-rpc: Support for Tendermint version 0.20.0 and 0.21.0 is
  deprecated and will be removed in the next version of IOV-Core. If you need
  support for Tendermint < 0.25.0, please open an issue on Github and we'll
  maintain it.

## 0.9.3

* @iov/bns: Add missing error propagation from `searchTx`/`listenTx` into `liveTx` stream.

## 0.9.2

* @iov/bns: Add `getHeader` and `watchHeaders` methods to access block headers

## 0.9.1

* @iov/stream: Generalize `streamPromise` to take a promise of an iterable
* @iov/bns: Fix order of events in `listenTx`. All history tx events are now emitted before updates.

## 0.9.0

* @iov/core: Export `Secp256k1HdWallet` and import by default in @iov/cli.
* @iov/faucets: Postpone removal of `BovFaucet` to 0.10.x

Breaking changes

* @iov/bcp-types: Rename `FungibleToken` to `Amount`
* @iov/bns: Re-generate BNS codec from weave v0.9.0 and adapt wrapper types.
* @iov/bns: Add support for blockchain and username NFTs
* @iov/crypto: Convert pubkey of Secp256k1Keypair into uncompressed format with prefix `04`.
* @iov/crypto: Secp256k1.createSignature/.verifySignature now comsume a message hash and do no hashing internally.
* @iov/dpos: Rename `Amount`/`parseAmount` to `Quantity`/`parseQuantity`
* @iov/keycontrol: Let `Secp256k1HdWallet` work on uncompressed pubkeys. Since `Secp256k1HdWallet`
  was not used yet, there is no migration for existing `Secp256k1HdWallet`.
* @iov/tendermint-types: Move types `PrivateKeyBundle`, `PrivateKeyBytes` into @iov/bns;
  split `Tag` into `BcpQueryTag` in @iov/bcp-types and `QueryTag` in @iov/tendermint-rpc;
  rename `TxQuery` into `BcpTxQuery` in @iov/bcp-types; make `SignatureBundle` available
  in @iov/tendermint-rcp only and rename to `VoteSignatureBundle`; move `buildTxQuery` into @iov/bns.
* @iov/tendermint-types: renamed to @iov/base-types

## 0.8.1

* @iov/dpos: Deduplicate `Serialization` from Lisk and RISE
* @iov/keycontrol: Add `Wallet.printableSecret` and `UserProfile.printableSecret`
* @iov/keycontrol: Add `HdPaths.bip44` and `HdPaths.metamaskHdKeyTree` HD path builders
* @iov/tendermint-rpc: Ensure transaction search results are sorted by height

## 0.8.0

* @iov/dpos: Add new package with shared code for Lisk and RISE. Don't use this directly. No code change necessary for users of @iov/lisk and @iov/rise.
* @iov/faucets: add `IovFaucet` to connect to the new faucet application
* @iov/keycontrol: add format versioning to `Wallet`, `Keyring`, keyring encryption and `UserProfile`

Deprecations

* @iov/faucets: `BovFaucet` is deprecated and will be removed in 0.9. Migrate to the `IovFaucet`.

Breaking changes

* @iov/lisk: LiskConnection.postTx does not wait for block anymore (analogue to RiseConnection.postTx),
  making it faster and more reliable. Transaction state tracking will improve in the future.
* Due to updates in all serialization formats, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.8.0. To migrate to
  the new version, extract the secret data using an older version and
  create a new UserProfile in 0.8.0.

## 0.7.1

* @iov/lisk: Implement `LiskConnection.getTicker` and `.getAllTickers`
* @iov/rise: Implement `RiseConnection.getTicker` and `.getAllTickers`

## 0.7.0

* @iov/bcp-types: optional field `expectedChainId` added to `ChainConnector`
* @iov/bcp-types: `BcpConnection.getAccount` can now be called with a pubkey input
* @iov/bcp-types: `TxReadCodec` and all its implementations now contain a `isValidAddress` method
* @iov/core: `MultiChainSigner.addChain` now returns chain information of the chain added
* @iov/lisk: new package to connect to the Lisk blockchain
* @iov/rise: new package to connect to the RISE blockchain
* @iov/encoding: bech32 encoding support for address bytes
* @iov/keycontrol: `UserProfile.setEntry()` now returns `WalletInfo` of new wallet added, for ease of use

Breaking changes

* @iov/bcp-types: `Address` is now a `string` instead of an `Uint8Array`
* @iov/bcp-types: `BcpTransactionResponse.metadata.success` was removed since failures are reported as promise rejections
* @iov/bcp-types: `Nonce` is now implemented by `Int53` from @iov/encoding instead of `Long`
* @iov/bns: `Client` was renamed to `BnsConnection`. The `connect()` function was renamed to `BnsConnection.establish()`
* @iov/core: rename `IovWriter` to `MultiChainSigner`
* @iov/core: rename the getter `reader` to `connection` in `MultiChainSigner`
* @iov/faucets: `BovFaucet.credit` now expects an address in bech32 format
* @iov/keycontrol: `Ed25519KeyringEntry` now takes a keypair as an argument in `createIdentity()`
* @iov/keycontrol: `Ed25519SimpleAddressKeyringEntry` was removed in favour of `Ed25519HdWallet` together with `HdPaths.simpleAddress`
* @iov/keycontrol: in `UserProfile`, `.entriesCount`, `.entryLabels` and `.entryIds` have been merged into `.wallets`
* @iov/keycontrol: in `UserProfile`, `.setEntryLabel`, `.createIdentity`, `.setIdentityLabel`, `.getIdentities`, `.signTransaction`, `.appendSignature` now only accept string IDs for the entry/wallet argument
* @iov/keycontrol: `DefaultValueProducer` and `ValueAndUpdates` moved into @iov/stream
* @iov/keycontrol: `KeyringEntry.createIdentity` now takes a required options argument of type `Ed25519KeyringEntry | ReadonlyArray<Slip10RawIndex> | number`
* @iov/keycontrol: rename symbols to `Wallet`, `WalletId`, `WalletImplementationIdString`, `WalletSerializationString`
* @iov/keycontrol: rename `Ed25519KeyringEntry` to `Ed25519WalletId`
* @iov/keycontrol: in `Keyring`, rename `.getEntries/.getEntryById` to `.getWallets/.getWallet`
* @iov/keycontrol: in `Keyring`, remove obsolete `.getEntryByIndex`
* @iov/keycontrol: in `UserProfile`, rename `.addEntry/.setEntryLabel` to `.addWallet/.setWalletLabel`
* @iov/ledger-bns: in `LedgerSimpleAddressKeyringEntry`, `.createIdentity` takes an index argument
* @iov/ledger-bns: rename `LedgerSimpleAddressKeyringEntry` to `LedgerSimpleAddressWallet`
* Due to updates in the Keyring serialization, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.7.0. To migrate to
  the new version, extract the secret data using an older version and
  create a new UserProfile in 0.7.0.

## 0.6.1

* @iov/keycontrol: add Ed25519HdWallet and Secp256k1HdWallet that work like Ed25519SimpleAddressKeyringEntry but allow derivation of arbirtary SLIP-0010 paths
* @iov/core: move ChainConnector into @iov/bcp-types to avoid new chains to depend on @iov/core
* @iov/bcp-types: various refactorings to improve multi chain support

Other notes

* The new name for keyring entries is "wallet". A keyring contains multiple wallets. This transition was started
  with the intoduction of Ed25519HdWallet and Secp256k1HdWallet and other incompatible API changes will follow in 0.7.
* We welcome our first external code contributor @SpasZahariev! If you want to get familiar woth the codebase,
  check the issues labeled with "good first issue".

## 0.6.0

* @iov/core: expose Ed25519KeyringEntry
* @iov/keycontrol: refactor entry ID generation
* @iov/bcp-types: rename interface IovReader -> BcpConnection
* @iov/bcp-types: make BcpConnection.chainId() synchronous for easier use by clients
* @iov/bns: expose transaction result
* @iov/bns: expose atomic swap queries on the bns client
* @iov/bns: transaction search can handle unlimited number of results

Breaking changes

* Due to updates in the Keyring serialization, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.6.0. To migrate to
  the new version, extract the secret data using an older version and
  create a new UserProfile in 0.6.0.

## 0.5.4

* @iov/cli: fix global installation support

## 0.5.3

* @iov/core and @iov/keycontrol: use strict types for keyring entry IDs

## 0.5.2

* @iov/bns: increase transaction search results to 100 items
* @iov/core and @iov/keycontrol: add keyring entry IDs
* @iov/keycontrol: ensure Ed25519SimpleAddressKeyringEntry.fromEntropyWithCurve/ and .fromMnemonicWithCurve return the correct type

**Note: this version was published with an outdated build
and should not be used**

## 0.5.1

* @iov/bns: expose transaction IDs

## 0.5.0

* @iov/bns: Add support of listening to change events, watching accounts, txs
* @iov/core: Simplify construction of IovWriter
* @iov/crypto: Rename all `Slip0010*` symbols to `Slip10*`
* @iov/crypto: Fix keypair representation of Secp256k1.makeKeypair
* @iov/tendermint: Add support for subscribing to events

Breaking changes

* Due to multi curve support in keyring entries, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.5.0. To migrate to
  the new version, extract the secret data using 0.4.1 and create a new
  UserProfile in 0.5.0.
* The IovWriter construction is changed. You can probably save a line there.
  Please look at @iov/core README to see how to build it.

## 0.4.1

* @iov/faucets: package added to provide easy access to a BovFaucet

## 0.4.0

* @iov/core: Add disconnect method to IovReader
* @iov/tendermint-rpc: Add disconnect method to WebsocketClient
* @iov/ledger-bns: Improved USB connectivity due to hw-transport-node-hid upgrade

Breaking changes

* @iov/cli: wait() helper function removed
* @iov/ledger-bns: LedgerSimpleAddressKeyringEntry.startDeviceTracking() must be called
  before getting device state or calling createIdentity()/createTransactionSignature()
* The name field from the `getAccount` result data does not contain
  the chain ID anymore. Before

      [ { name: 'admin*test-chain-HexTMJ',
      address:
       Uint8Array [
         177,
         202, ...

  Now:

      [ { name: 'admin',
      address:
       Uint8Array [
         177,
         202, ...

## 0.3.1

* @iov/core: Export SetNameTx
* Improve Windows compatibility of build system and add Edge tests

## 0.3.0

* @iov/ledger-bns: Implement LedgerSimpleAddressKeyringEntry.canSign
* @iov/ledger-bns: Add LedgerSimpleAddressKeyringEntry.deviceState
* @iov/keycontrol: Encrypt UserProfile using XChaCha20-Poly1305
* @iov/crypto: Add support for unhardened Secp256k1 HD derivation
* @iov/cli: Add support for top level await

Breaking changes

* Due to an enhanced encryption mechanism, UserProfiles stored with
  IOV-Core 0.2.0 cannot be opened with 0.3.0. To migrate to the new
  version, extract the secret data using 0.2.0 and create a new
  UserProfile in 0.3.0.

## 0.2.0

Finalize library name, add documentation and open source

## 0.1.1

Expose type TransactionKind

## 0.1.0

The beginning of versioning

## 0.0.0

Initial development
