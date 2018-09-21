# Changelog

## 0.6.0

* @iov/core: expose Ed25519KeyringEntry
* @iov/keycontrol: refactor entry ID generation

Breaking changes

* Due to updates in the Keyring serialization, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.6.0. To migrate to
  the new version, extract the secret data using an older version and
  create a new UserProfile in 0.6.0.

## 0.5.4

* @iov/cli: fix global installation support

## 0.5.3

## 0.5.2

## 0.5.1

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
