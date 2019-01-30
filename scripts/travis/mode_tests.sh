#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Config
#

# Ensure consecutive Safari sessions don't re-open old tabs
# https://github.com/karma-runner/karma-safari-launcher/issues/6
if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  defaults write com.apple.Safari ApplePersistenceIgnoreState YES
fi

#
# Install
#

# For socketserver
pip3 install websockets

#
# Start blockchains
#

# Use Docker if available (currently Linux only)
if command -v docker > /dev/null ; then
  fold_start "socketserver-start"
  ./scripts/socketserver/start.sh
  export SOCKETSERVER_ENABLED=1
  fold_end

  fold_start "tendermint-start"
  ./scripts/tendermint/all_start.sh
  export TENDERMINT_ENABLED=1
  fold_end

  fold_start "bnsd-start"
  ./scripts/bnsd/start.sh
  export BNSD_ENABLED=1
  fold_end

  fold_start "lisk-start"
  ./scripts/lisk/start.sh
  export LISK_ENABLED=1
  fold_end

  # Wait until API is ready and run in background because script waits for
  # blocks and takes some time but will be ready before tests start
  (sleep 20 && ./scripts/lisk/init.sh ) &

  fold_start "ethereum-start"
  ./scripts/ethereum/start.sh
  export ETHEREUM_ENABLED=1
  fold_end
fi

#
# Start faucet
#

if [[ -n ${BNSD_ENABLED:-} ]]; then
  fold_start "faucet-start"
  ./scripts/iov_faucet_start.sh
  export FAUCET_ENABLED=1
  fold_end
fi

echo "use tendermint? ${TENDERMINT_ENABLED:-no}"
echo "use bnsd? ${BNSD_ENABLED:-no}"
echo "use IOV faucet? ${FAUCET_ENABLED:-no}"
echo "use ethereum? ${ETHEREUM_ENABLED:-no}"
echo "use Lisk? ${LISK_ENABLED:-no}"

#
# Build
#

fold_start "update-npmipgnore"
# This in combination with check-dirty (below) ensures .npmignore files are up-to-date
./scripts/update_npmignore.sh
fold_end

fold_start "yarn-build"
yarn build
fold_end

export SKIP_BUILD=1

fold_start "check-dirty"
# Ensure build step didn't modify source files to avoid unprettified repository state
SOURCE_CHANGES=$(git status --porcelain)
if [[ -n "$SOURCE_CHANGES" ]]; then
  echo "Error: repository contains changes."
  echo "Showing 'git status' and 'git diff' for debugging reasons now:"
  git status
  git diff
  exit 1
fi
fold_end

#
# Test
#

fold_start "commandline-tests"
yarn test
fold_end

#
# CLI selftest
#

fold_start "iov-cli-selftest"
(
  cd packages/iov-cli
  yarn test-bin
)
fold_end

# Test in browsers

fold_start "test-chrome"
yarn run lerna run test-chrome
fold_end

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  fold_start "test-safari"
  yarn run lerna run test-safari
  fold_end

  # Firefox does not run on Linux VMs because "no DISPLAY environment variable specified"
  fold_start "test-firefox"
  yarn run lerna run test-firefox
  fold_end
fi

# fold_start "test-local-cli-installation"
# (
#   WORKSPACE=$(pwd)
#   DEMO_PROJECT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/iov-cli-installation.XXXXXXXXX")
#   cd "$DEMO_PROJECT_DIR"
#   yarn init -y
#   yarn add "$WORKSPACE/packages/iov-cli" --dev
#   "$(yarn bin)/iov-cli" --selftest
# )
# fold_end

# fold_start "test-global-cli-installation"
# (
#   WORKSPACE=$(pwd)
#   # Go to some other place where dependencies are not around
#   OTHER_PLACE=$(mktemp -d "${TMPDIR:-/tmp}/some-lost-place.XXXXXXXXX")
#   cd "$OTHER_PLACE"
#   yarn global add "$WORKSPACE/packages/iov-cli"
#   command -v iov-cli
#   iov-cli --selftest
# )
# fold_end

#
# Cleanup
#

if [[ -n ${FAUCET_ENABLED:-} ]]; then
  fold_start "faucet-stop"
  unset FAUCET_ENABLED
  ./scripts/iov_faucet_stop.sh
  fold_end
fi

if [[ -n ${ETHEREUM_ENABLED:-} ]]; then
  fold_start "ethereum-stop"
  unset ETHEREUM_ENABLED
  ./scripts/ethereum/stop.sh
  fold_end
fi

if [[ -n ${BNSD_ENABLED:-} ]]; then
  fold_start "bnsd-stop"
  unset BNSD_ENABLED
  ./scripts/bnsd/stop.sh
  fold_end
fi

if [[ -n ${TENDERMINT_ENABLED:-} ]]; then
  fold_start "tendermint-stop"
  unset TENDERMINT_ENABLED
  ./scripts/tendermint/all_stop.sh
  fold_end
fi
