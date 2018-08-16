# Changelog

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
