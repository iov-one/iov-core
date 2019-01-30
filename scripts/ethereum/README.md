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

## Initial develoment accounts

When starting the development chain, we seed the following accounts with tokens

* Main identity `m/44'/60'/0'/0/0` that sends all the test transactions
* Second identity `m/44'/60'/0'/0/1` that has a fixed balance for state queries
* Third identity `m/44'/60'/0'/0/2` unused for now
* Faucet token holder `m/1229936198'/1'/0'/0'`

### Generate secret keys for Ganache CLI

Use @iov/cli to get a list of secret keys, public keys and addressed for the identities above

```ts
const seed = await Bip39.mnemonicToSeed(new EnglishMnemonic("oxygen fall sure lava energy veteran enroll frown question detail include maximum"));
const paths: ReadonlyArray<ReadonlyArray<Slip10RawIndex>> = [
  HdPaths.ethereum(0), // main
  HdPaths.ethereum(1), // second
  HdPaths.ethereum(2), // third
  // faucet token holder
  [Slip10RawIndex.hardened(1229936198), Slip10RawIndex.hardened(1), Slip10RawIndex.hardened(0), Slip10RawIndex.hardened(0)],
]

for (const path of paths) {
  const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, path);
  const { pubkey } = await Secp256k1.makeKeypair(privkey);
  const address = ethereumPubkeyToAddress({ algo: Algorithm.Secp256k1, data: pubkey as PublicKeyBytes })
  console.log(`0x${toHex(privkey)},0x${toHex(pubkey)},${address}`)
}
```

gives you

```csv
0x5e4744cb651ef4598b5ea6183aa1a39e09699b4479bb1e73f717299a9cc84718,0x04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381,0x88F3b5659075D0E06bB1004BE7b1a7E66F452284
0x67f3bca40c3ec02b8c8630a09c459270bb29ad7f1c650156513a30c75a6a8a5f,0x041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8,0x0A65766695A712Af41B5cfECAaD217B1a11CB22A
0xcaabb4e5e22beb7f4ba936c53b3a3a29f9f4908073d8f4cfd300773581c46af8,0x043187d755c1a7c252fb1ef1469b6f099c848e007438ad6aa389994614e6e489034dfa6a028930ce7553165326abdcd18ee48de9c4843b86984acf1fbff4f3974c,0x585ec8C463C8f9481f606456402cE7CACb8D2d2A
0x531f5ff5a5171853bed4255539c47b2c14b85bc57722c6c0c1cac4be2ba768a3,0x04bace828f3e36d871bbd01020c1da4919f99804e3867c40fe684ab9aaf3f099b3a7e10b1e10b77585bee94b4ca4fa141841aba6c2d851454e9c774190684a2bd0,0x65E2fF4C989dd53387dfeFF8b36e58265047Cf34
```
