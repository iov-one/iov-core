#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Includes
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/_includes.sh";

#
# Install
#

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
  ./scripts/lisk/init.sh
  export LISK_ENABLED=1
  fold_end

  fold_start "cosmos-start"
  ./scripts/cosmos/start.sh
  export COSMOS_ENABLED=1
  fold_end

  fold_start "ethereum-start"
  ./scripts/ethereum/start.sh
  export ETHEREUM_ENABLED=1
  fold_end

  # Wait until API is ready and run in background because script
  # takes some time but will be ready before tests start
  (sleep 5 && ./scripts/ethereum/init.sh ) &
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
echo "use Cosmos? ${COSMOS_ENABLED:-no}"

#
# Build
#

fold_start "yarn-build"
yarn build
fold_end

fold_start "check-dirty"
# Ensure build step didn't modify source files to avoid outdated .d.ts files
SOURCE_CHANGES=$(git status --porcelain)
if [[ -n "$SOURCE_CHANGES" ]]; then
  echo "Error: repository contains changes."
  echo "Showing 'git status' and 'git diff' for debugging reasons now:"
  git status
  git diff
  exit 1
fi
fold_end

export SKIP_BUILD=1

if [[ "$MODE" == "tests-chrome" ]]; then
  fold_start "test-chrome"
  yarn run lerna run test-chrome
  fold_end
elif [[ "$MODE" == "tests-firefox" ]]; then
  # A version of Firefox is preinstalled on Linux VMs and can be used via xvfb
  fold_start "test-firefox"
  xvfb-run --auto-servernum yarn run lerna run test-firefox
  fold_end
else
  #
  # Tests
  #

  fold_start "commandline-tests"
  yarn test
  fold_end

  fold_start "iov-cli-selftest"
  (
    cd packages/iov-cli
    yarn test-bin
  )
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

if [[ -n ${COSMOS_ENABLED:-} ]]; then
  fold_start "cosmos-stop"
  unset COSMOS_ENABLED
  ./scripts/cosmos/stop.sh
  fold_end
fi

if [[ -n ${LISK_ENABLED:-} ]]; then
  fold_start "lisk-stop"
  unset LISK_ENABLED
  ./scripts/lisk/stop.sh
  fold_end
fi

if [[ -n ${TENDERMINT_ENABLED:-} ]]; then
  fold_start "tendermint-stop"
  unset TENDERMINT_ENABLED
  ./scripts/tendermint/all_stop.sh
  fold_end
fi
