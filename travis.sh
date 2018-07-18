#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

echo "travis_fold:start:yarn-build"
yarn build
echo "travis_fold:end:yarn-build"

export SKIP_BUILD=1

echo "travis_fold:start:check-dirty"
# Ensure build step didn't modify source files to avoid unprettified repository state
SOURCE_CHANGES=$(git status --porcelain)
if [[ -n "$SOURCE_CHANGES" ]]; then
  echo "Error: repository contains changes."
  echo "Showing 'git status' and 'git diff' for debugging reasons now:"
  git status
  git diff
  exit 1
fi
echo "travis_fold:end:check-dirty"

echo "travis_fold:start:commandline-tests"
yarn test
echo "travis_fold:end:commandline-tests"

# Test browser
for PACKAGE in iov-bns iov-crypto iov-keycontrol iov-tendermint-rpc; do
  echo "travis_fold:start:browser-tests-$PACKAGE"
  (
    cd "packages/$PACKAGE"

    yarn test-chrome

    if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
      yarn test-safari

      # Firefox does not run on Linux VMs because "no DISPLAY environment variable specified"
      yarn test-firefox
    fi
  )
  echo "travis_fold:end:browser-tests-$PACKAGE"
done
