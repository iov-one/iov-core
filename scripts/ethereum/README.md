# Local Ethereum test network

Ganache CLI is used to provide a local test network. It is started and stopped
via Docker using the following scripts.

## Start/stop

To start use

```
./scripts/ethereum/start.sh
export ETHEREUM_ENABLED=1
```

and to stop

```
unset ETHEREUM_ENABLED
./scripts/ethereum/stop.sh
```

## Query transactions by account

Since this functionality is not standard in ethereum ecosystem, we provide a setup to connect with blockchain scrapers that index transactions by user account. To enable such functionality:

```
export ETHEREUM_SCRAPER=1
```
