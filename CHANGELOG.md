# Changelog

## 0.4.0

Breaking changes

* @iov/cli: wait() helper function removed
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
