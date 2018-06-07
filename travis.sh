#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

yarn build
yarn test

(
  # Test browser
  cd packages/iov-crypto

  if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
      yarn test-safari
      yarn test-firefox
      yarn test-chrome
  fi
)
