# Local Ethereum test network

## Start

```
export GANACHE_MNEMONIC="oxygen fall sure lava energy veteran enroll frown question detail include maximum"
./scripts/ethereum/start.sh
export ETHEREUM_ENABLED=1
```

### Query transactions by account
Since this functionality is not standard in ethereum ecosystem, we provide a setup to connect with blockchain scrapers that index transactions by user account. To enable such functionality:
```
export ETHEREUM_SCRAPER=1
```

## Stop

```
unset ETHEREUM_ENABLED
./scripts/ethereum/stop.sh
```
