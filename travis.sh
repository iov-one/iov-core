#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
    # Test browser
    (
      cd packages/iov-crypto
      yarn test-safari
    )
else
    yarn build
    yarn test
fi
