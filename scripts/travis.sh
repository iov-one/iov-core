#!/bin/bash
# shellcheck disable=SC1091
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Config
#

export TSLINT_FLAGS='-c ./tslint_ci.json'

# Ensure consecutive Safari sessions don't re-open old tabs
# https://github.com/karma-runner/karma-safari-launcher/issues/6
if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  defaults write com.apple.Safari ApplePersistenceIgnoreState YES
fi

function fold_start() {
  export CURRENT_FOLD_NAME="$1"
  travis_fold start "$CURRENT_FOLD_NAME"
  travis_time_start
}

function fold_end() {
  travis_time_finish
  travis_fold end "$CURRENT_FOLD_NAME"
}

#
# Install
#

source ./scripts/retry.sh
retry 3 yarn install

#
# Start blockchains
#

# Use Docker if available (currently Linux only)
if command -v docker > /dev/null ; then
  source ./scripts/iov_blockchain_start.sh

  ./scripts/lisk/start.sh
  export LISK_ENABLED=1

  # Wait until API is ready and run in background because script waits for
  # blocks and takes some time but will be ready before tests start
  (sleep 20 && ./scripts/lisk/init.sh ) &
fi

export GANACHE_MNEMONIC="oxygen fall sure lava energy veteran enroll frown question detail include maximum"
./scripts/ethereum/start.sh
export ETHEREUM_ENABLED=1

echo "use tendermint?" "${TENDERMINT_ENABLED:-no}"
echo "use bov?" "${BOV_ENABLED:-no}"
echo "use ethereum?" ${ETHEREUM_ENABLED:-no}
echo "use Lisk?" ${LISK_ENABLED:-no}

#
# Start faucet
#

if [[ ! -z ${BOV_ENABLED:-} ]]; then
  ./scripts/iov_faucet_start.sh
fi

#
# Build
#

fold_start "yarn-build"
yarn build
fold_end

export SKIP_BUILD=1

fold_start "yarn-docs"
yarn docs
fold_end

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
# Deploy
#

if [[ "$TRAVIS_OS_NAME" == "linux" ]] && [[ "$TRAVIS_NODE_VERSION" == "8" ]] && [[ "$TRAVIS_BRANCH" == "master" ]] && [[ "$TRAVIS_PULL_REQUEST_BRANCH" == "" ]]; then
  (
    cd "$HOME"
    git config --global user.email "travis@iov.invalid"
    git config --global user.name "Travis Job"
  )

  (
    cd ".."
    git clone "https://webmaster128:$GITHUB_API_KEY@github.com/iov-one/iov-core-docs.git"
    cd "iov-core-docs"
    git checkout gh-pages
    git reset master
  )

  ./copy_docs.sh

  (
    cd "../iov-core-docs"
    git add ./latest
    git commit -m "Update docs"
    git push -f
  )
fi

#
# Cleanup
#
unset ETHEREUM_ENABLED
./scripts/ethereum/stop.sh

source ./scripts/iov_blockchain_stop.sh
