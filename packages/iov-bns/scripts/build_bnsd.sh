#!/bin/bash
# This depends on an existing version from a previous weave.sh run
# This will do all steps to build bnsd and copy it into ./go/bin

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export GOPATH="$SCRIPT_DIR/../go"
export PATH="${GOPATH}:${PATH}"

cd "$GOPATH"
mkdir -p bin
cd src/github.com/iov-one/weave
ls

echo "Preparing dependencies..."
make tools
make deps

echo "Compiling binary..."
cd ./cmd/bnsd
make build
cp ./bnsd "$GOPATH/bin"

echo "bnsd installed under ./go/bin"