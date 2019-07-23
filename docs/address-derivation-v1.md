# IOV address derivation version 1

IOV uses industry standard technology to derive cryptographic key pairs and
blockchain addresses from a secret mnemonic. The first step is to derive an
Ed25519 key pair from the secret. The address is then derived from the public
key in a second step.

## Create the base secret

The base secret is an English
[BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)-compatible
mnemonic.

Even though it is potentially feasible to extend this spec for the use of
mnemonics in different languages, none of our software currently supports doing
that.

Note: There are extensions to BIP39 that allow mnemonics with fewer than 12
words. Those mnemonics should be considered insecure for our purposes and none
of our software supports them.

## Derive a key pair from a mnemonic

The IOV Name Service (i.e. our blockchain) uses Ed25519 for signing.
Hierarchical deterministic (HD) key derivation allows us to derive multiple
Ed25519 key pairs from a single mnemonic. We follow the
[SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)
standard.

## Derivation paths

[BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
describes a HD derivation scheme that allows using multiple coins with a single
mnemonic. Following this standard, we registered the coin index 234 for the IOV
token in
[SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).

Since IOV is an account-based model, our paths follows
[Trezor's recommendation](https://github.com/trezor/trezor-firmware/tree/master/core/docs/coins)
that

> If the coin is UTXO-based the path should have all five parts, precisely as
> defined in BIP-32. If it is account-based we follow Stellar's SEP-0005 - paths
> have only three parts 44'/c'/a'.

This results in HD paths of the form

```
m/44'/234'/a'
```

where `a` is an account index starting at 0. We call this format "BIP44-like"
because it follows the idea of BIP44 but is not compatible to the 5-component
BIP44 standard.

### Simple addresses (deprecated)

[During development](https://github.com/iov-one/iov-core/blob/v0.15.0/docs/KeyBase.md#simple-addresses),
we used the derivation path `m/4804438'/a'`. This was created and called
"simple" because we initially planned to use a multi-dimensional 5-component
BIP44 path in the long run. However, we gave up this idea and now the IOV path
described above is equally simple.

## Deriving addresses from keypairs

Given an Ed25519 public key, we derive IOV addresses as follows

```
address := bech32(prefix, sha256(ascii("sigs/ed25519/") + pubkey)[0:20]);
```

where `prefix` (the human readable part of
[Bech32](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)) is
"tiov" for testnets and "iov" for mainnet.

## Example

The mnemonic

```
wisdom harvest task decrease hybrid mad concert drift ready traffic feel smoke
```

derives to the Ed25519 public keys and testnet addresses:

```
m/44'/234'/0':
12ee6f581fe55673a1e9e1382a0829e32075a0aa4763c968bc526e1852e78c95
tiov1hx6vjcmsgj7wgu64ajdglrhpusl3fmercl8mxe

m/44'/234'/1':
c26a2feeb1fa1a424509148943af1d32c88bf3f4138c76a6cf266b1836c8edec
tiov1mh9p0y0ne8n03y5x8tjrjlxz4ku3vqluq6g26s

m/44'/234'/2':
ed87b8b1ea2b2c533ffe402c9e0bb2abd7b724a1810d6dc5579a03b5fbbafec6
tiov16xrvuk2867536tj5j6zzhy205efzrzac8g7zhc
```

## Useful links

- [Token finder](https://iov-one.github.io/token-finder/)
  ([source](https://github.com/iov-one/token-finder)) is helpful for debugging
  HD key and address derivation.
- [The HdPaths class in IOV-Core](https://github.com/iov-one/iov-core/blob/master/packages/iov-keycontrol/src/hdpaths.ts),
  which shows the various derivation paths used in our software.
