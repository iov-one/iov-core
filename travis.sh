#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

yarn build
yarn test

(
  # Test browser
  cd packages/iov-crypto

  yarn test-chrome

  if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
      yarn test-safari

      # Firefox does not run on Linux VMs because "no DISPLAY environment variable specified"
      yarn test-firefox
  fi
)
