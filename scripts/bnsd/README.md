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

```
mnemonic: degree tackle suggest window test behind mesh extra cover prepare oak script

path: 44'/234'/0'
pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea

path: 44'/234'/1'
pubkey: ddeae7091cbdcc09c4d11658a2e35598ef0be0f16ef9235701317cb725033aae
IOV address: tiov12shyht3pvvacvyee36w5844jkfh5s0mf4gszp9

path: 44'/234'/2'
pubkey: d8eef380a90268c0e9740e0fbfc73a7836bd3dd40448ad7d46d878b22fddd1eb
IOV address: tiov18mgvcwg4339w40ktv0hmmln80ttvza2n6hjaxh

path: 44'/234'/3'
pubkey: a258cbd5a261d9a710e7dbb3b7084da530168c3f43d0aa5431a61bb2bbb58752
IOV address: tiov1n29gges26z4napj5lqjkmzuq6mpkqk32plsgyz

path: 44'/234'/4'
pubkey: be9e5ce944613974b6098686cd89abd71a56af4bd8ff3eb58159c3fa33ffe304
IOV address: tiov192ehw3lerre6s4vadrnkt82x4zlq0uw5j48dcs
```
