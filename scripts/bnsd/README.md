# Starting a local BNS blockchain

This starts a local [bnsd](https://github.com/iov-one/weave) application.

## Requirements

- docker and docker-compose

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
