# Changelog

## 0.7.0 (not yet released)

* @iov/lisk: new package to connect to the Lisk blockchain
* @iov/rise: new package to connect to the RISE blockchain
* @iov/encoding: bech32 encoding support for address bytes

Breaking changes

* @iov/bcp-types: `Address` is now a `string` instead of an `Uint8Array`
* @iov/bcp-types: `BcpTransactionResponse.metadata.success` was removed since failures are reported as promise rejections
* @iov/bcp-types: optional field `expectedChainId` added to `ChainConnector`
* @iov/bcp-types: `BcpConnection.getAccount` can not ne called with a pubkey input
* @iov/bcp-types: `Nonce` is now implemented by `Int53` from @iov/encoding instead of `Long`
* @iov/bns: `Client` was renamed to `BnsConnection`. The `connect()` function was renamed to `BnsConnection.establish()`
* @iov/keycontrol: `Ed25519KeyringEntry` now takes a keypair as an argument in `createIdentity()`
* @iov/keycontrol: `Ed25519SimpleAddressKeyringEntry` was removed in favour of `Ed25519HdWallet` together with `HdPaths.simpleAddress`
* @iov/keycontrol: in `UserProfile`, `.entriesCount`, `.entryLabels` and `.entryIds` have been merged into `.wallets`
* @iov/keycontrol: in `UserProfile`, `.setEntryLabel`, `.createIdentity`, `.setIdentityLabel`, `.getIdentities`, `.signTransaction`, `.appendSignature` now only accept string IDs for the entry/wallet argument
* @iov/keycontrol: `DefaultValueProducer` and `ValueAndUpdates` moved into @iov/stream
* @iov/keycontrol: `KeyringEntry.createIdentity` now takes a required options argument of type `Ed25519KeyringEntry | ReadonlyArray<Slip10RawIndex> | number`
* @iov/keycontrol: rename symbols to `Wallet`, `WalletId`, `WalletImplementationIdString`, `WalletSerializationString`
* @iov/keycontrol: rename `Ed25519KeyringEntry` to `Ed25519WalletId`
* @iov/keycontrol: in `Keyring`, rename `.getEntries/.getEntryById` to `.getWallets/.getWallet`
* @iov/core: rename `IovWriter` to `MultiChainSigner`
* @iov/core: rename the getter `reader` to `connection` in `MultiChainSigner`
* @iov/core: `MultiChainSigner.addChain` now returns chain information of the chain added
* @iov/ledger-bns: in `LedgerSimpleAddressKeyringEntry`, `.createIdentity` takes an index argument
* @iov/ledger-bns: rename `LedgerSimpleAddressKeyringEntry` to `LedgerSimpleAddressWallet`
* Due to updates in the Keyring serialization, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.7.0. To migrate to
  the new version, extract the secret data using an older version and
  create a new UserProfile in 0.7.0.

Enhancements:

* @iov/keycontrol: `UserProfile.setEntry()` now returns `WalletInfo` of new wallet added, for ease of use

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
