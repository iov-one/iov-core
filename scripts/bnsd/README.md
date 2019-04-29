# Starting a local BNS blockchain

This starts a local [bnsd](https://github.com/iov-one/weave) application.

## Requirements

- docker

## Start

From repo root:

```
./scripts/bnsd/start.sh
export BNSD_ENABLED=1
```

## Stop

From repo root:

```
./scripts/bnsd/stop.sh
unset BNSD_ENABLED
```

## Genesis accounts

IOV HD derivation used for IOV-Core tests and
[Faucet HD wallet](https://github.com/iov-one/iov-faucet/#faucet-hd-wallet) used
for the token holder account of iov-faucet.

```
mnemonic: degree tackle suggest window test behind mesh extra cover prepare oak script

path: m/44'/234'/0'
pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea

path: m/1229936198'/1'/0'/0'
pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
```
