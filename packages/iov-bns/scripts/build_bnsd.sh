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
make tools
make deps

echo "Compiling bnsd..."
cd ./cmd/bnsd
make build
cp ./bnsd "$GOPATH/bin"

echo "Compiling bcpd..."
cd ../bcpd
make build
cp ./bcpd "$GOPATH/bin"

echo "bnsd and bcpd installed under ./go/bin"
