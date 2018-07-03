#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

yarn build

# Ensure build step didn't modify source files to avoid unprettified repository state
SOURCE_CHANGES=$(git status --porcelain)
if [[ -n "$SOURCE_CHANGES" ]]; then
  echo "Error: repository contains changes."
  echo "Showing 'git status' and 'git diff' for debugging reasons now:"
  git status
  git diff
  exit 1
fi

yarn test

# Test browser
for PACKAGE in bns-codec iov-crypto iov-keycontrol; do
  (
    cd "packages/$PACKAGE"

    yarn test-chrome

    if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
      yarn test-safari

      # Firefox does not run on Linux VMs because "no DISPLAY environment variable specified"
      yarn test-firefox
    fi
  )
done
