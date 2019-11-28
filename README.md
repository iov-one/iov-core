# IOV-Core

[![Build Status](https://travis-ci.com/iov-one/iov-core.svg?token=evC2AgcwxuvHjXeBP3jq&branch=master)](https://travis-ci.com/iov-one/iov-core)

This repo is provides core functionality to all clients in a cross-platform
typescript library. This can be used to build cli/gui clients, automated
scripts, or help build bcp-proxy apps.

Main functionality provided:

- Solid crypto library with HD support for ed25519 (following SLIP-0010, ledger
  compatible)
- Secure private key management, including encrypted local storage for both
  browser and node
- Generic, type-safe adaptor to read/write on tendermint rpc server (with http/s
  and ws/s support)
- Adaptor to query / create transactions for IOV's testnet of the BNS blockchain
- Adaptor for key management using IOV's BNS ledger app
- High level controller for managing multiple user profiles and various key
  material
- High level controller for managing read/write connections to multiple
  blockchains (CoreWriter)
- Integration with REPL environment for quick prototyping for developers

This is still in pre-alpha state and will evolve quickly as we add support for
multiple blockchains, more transactions types, and better extensibility.
However, all attempts have been made that the foundational code is quite solid.
A security audit and stable release will occur along with the timeline of IOV's
mainnet launch, but developers looking for client-side libraries can do initial
prototypes with the current state.

We are actively building out multiple clients on top of this library and shaking
out usability issues in the API.

## Users

The following projects use IOV-Core (add yourself via a PR):

| Project                                                      | Tech stack / JavaScript environments |
| ------------------------------------------------------------ | ------------------------------------ |
| [TokenFinder](https://github.com/iov-one/token-finder)       | TypeScript / React / Browsers        |
| [iov-faucet](https://github.com/iov-one/iov-faucet)          | TypeScript / NodeJS 10               |
| [@iov/ledger-bns](https://github.com/iov-one/iov-ledger-bns) | TypeScript / NodeJS / Browsers       |

## Compatibility

The compiled code from this package, which is published on npm, should work on
any modern (2018) browser, and node 10.13+. The development environment has been
tested on node 10.13.

**Yarn not Npm** Please `npm install -g yarn` and use `yarn install`,
`yarn build`, etc. Developers who installed with `npm i` have reported problems
in compiling, so wipe out `node_modules` and enjoy `yarn`.

CI Tests:

- Linux: node 10.13, chrome, (electron manually)
- OSX: node 10.13, chrome, firefox, safari, (electron manually)
- Windows: node 10.13, (edge, electron manually)

## Getting Started

The best way to learn about code is to use it. You can read some
[examples in @iov/multichain](./packages/iov-multichain/README.md). And you can
use a REPL to [interactively try the code](./packages/iov-cli/README.md).

Once you understand the basics, you can dig in deeper with the API
documentation.

## API Docs

Documentation is published at
[https://iov-one.github.io/iov-core-docs/](https://iov-one.github.io/iov-core-docs/).

To build the documentation locally, run
`yarn install && yarn build && yarn docs` in this repository. This will generate
a `./docs` directory in each package that you can browse locally to see API docs
on the various packages.

## Contributing

We are more than happy to accept open source contributions. However, please try
to work on existing issues or create an issue and get feedback from one of the
[main contributors](https://github.com/iov-one/iov-core/graphs/contributors)
before starting on a PR. If you don't know where to start, we try to tag
["good first issues"](https://github.com/iov-one/iov-core/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
that provide a nice way to get started with the IOV-Core repo.

### Development Environment

If you go into a subpackage and try to `yarn build` or `yarn test`, chances are
it will fail. The reason is that we only check in `*.ts` files, while we need
the compiled `*.js` files to import other packages. We push these to npm but do
not check them into git to avoid commit noise.

To get started, please go to the root directory and run:

```
yarn install
yarn build
yarn test
```

Once that passes, you have the code built and can go into any subdirectory, edit
code and verify the changes with `yarn test` on that one package.

### Integration Tests

There are a number of integration tests involving communication with tendermint
(in `@iov/tendermint-rpc`) and the BNS blockchain (in `@iov/bns`) that require a
test server to run and are skipped by default. If you are working on those
packages, please run those tests. (They require docker to be installed and
executable by the current user)

#### Tendermint

```
./scripts/tendermint/start.sh
export TENDERMINT_ENABLED=1

cd packages/iov-tendermint-rpc
yarn test
cd ../..

unset TENDERMINT_ENABLED
./scripts/tendermint/stop.sh
```

#### BNS

If you are working on `@iov/bns`, you can run the tests against a local BNS
devnet. See
[scripts/bnsd/README.md](https://github.com/iov-one/iov-core/tree/master/scripts/bnsd/README.md#start)
for instructions on how to start the BNS devnet. Then run the tests as follows:

```
cd packages/iov-bns
yarn test
```

#### Lisk

If you are working on `@iov/lisk`, you can run the tests against a local Lisk
devnet. See
[scripts/lisk/README.md](https://github.com/iov-one/iov-core/tree/master/scripts/lisk#start)
for instructions on how to start the Lisk devnet. Then run the tests as follows:

```
cd packages/iov-lisk
yarn test
```

### Browser tests

The CI runs all code not only under node, but also in various browsers.

These work almost all of the time, but if you CI test fails in the browser, or
if you are just curious to see this work, you can run the browser tests locally
with any of the following, in any package you are working on:

```
yarn test-chrome
yarn test-firefox
yarn test-safari  # osx only
yarn test-edge    # windows only
```

### Developing under Windows 10

Most of the developers working on this project in windows are also using Windows
Subsystem for Linux (WSL), which should have maximum compatibility, as CI is
linux and osx. However, we do attempt to ensure that this code also compiles on
the normal windows shell, if you have set up git, node, yarn etc. correctly.
(Note this has only be verified under windows 10, no guarantees for older
versions).

### Line endings (CRLF vs LF)

All the code in the repo should use LF not the windows-specific CRLF as a line
ending. `tsc` is currently set up to output properly. However, you should also
make sure your editor saves with `LF` line endings rather than `CRLF`.

A bigger issue is `git` changing the endings upon commit. Here is a short
workaround, adapted from a
[stackoverflow discussion](https://stackoverflow.com/questions/2517190/how-do-i-force-git-to-use-lf-instead-of-crlf-under-windows):

```
git config --global core.autocrlf false
git config --global core.eol lf
```

## FAQ For Potential Issues

### Libusb fails to build, why?

If you are running on linux, you may not have the proper dependencies installed.
For Ubuntu, try the following:
`sudo apt-get install libudev-dev libusb-1.0-0 libusb-1.0-0-dev`. These are
needed to compile the usb driver.

Sometimes compiling native code with `node-pre-gyp` causes issues in very recent
versions of Node.js. At the moment, Node.js 10 and 11 should work.

### Docker fails to run a test server

If you're using OSX and Docker Desktop for Mac and you get an error like the
following, you'll need to add your `$TMPDIR` path to the list of shared paths:

```
docker: Error response from daemon: Mounts denied:
The path /path/to/tmpdir is not shared from OS X and is not known to Docker.
You can configure shared paths from Docker -> Preferences... -> File Sharing.
See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
```

In a terminal, run this command to find out your `$TMPDIR`:

```sh
echo $TMPDIR
```

Then add it to the list of shared paths in Docker -> Preferences ... -> File
Sharing. Apply and restart, and try to start the test server again.

### My PR works but the CI rejects it

Make sure you at least ran `yarn test` in all the directories where you modified
code. The CI will reject any PR if type definitions change after compiling the
code to ensure it was build and committed prior to pushing.

## License

This repository is licensed under the Apache License 2.0 (see NOTICE and
LICENSE).
