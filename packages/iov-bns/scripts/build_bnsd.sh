#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This depends on an existing version from a previous weave.sh run
# This will do all steps to build bnsd and copy it into ./go/bin

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export GOPATH="$SCRIPT_DIR/../go"
export PATH="${GOPATH}:${PATH}"

cd "$GOPATH"
mkdir -p bin
cd src/github.com/iov-one/weave

echo "Preparing dependencies..."
make deps

echo "Compiling weave project..."
make dist

echo "Copying bnsd..."
cp ./cmd/bnsd/bnsd "$GOPATH/bin"

echo "bnsd installed under $GOPATH/bin"
