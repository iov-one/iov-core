#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This will check out the version of weave passed on the cli.
# Usage: ./scripts/weave.sh v0.9.0
# OR     VERSION=v0.9.0 ./scripts/weave.sh

# use cli arg, or environmental variable
TAG=${1:-$VERSION}
if [ -z "$TAG" ]; then
  echo "Please provide a tag to checkout, either as an arg or via VERSION env var"
  exit 1
fi

DEST="./go/src/github.com/iov-one"
mkdir -p "${DEST}"
cd "${DEST}"

# clone or update weave
if [ -d weave ]; then
  (
    cd weave
    git fetch
    git checkout "$TAG"
  )
else
  git clone --branch "$TAG" git@github.com:iov-one/weave.git
fi
