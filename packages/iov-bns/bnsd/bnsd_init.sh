#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$TM_VERSION" ]; then
  echo "TM_VERSION must be set"; exit 1
fi

if [ -z "$BOV_VERSION" ]; then
  echo "BOV_VERSION must be set"; exit 1
fi

if [ -z "$BOV_DIR" ]; then
  echo "BOV_DIR must be set"; exit 1
fi


chmod 777 "${BOV_DIR}"

docker run --user="$UID" \
  -v "${BOV_DIR}:/tendermint" \
  "iov1/tendermint:${TM_VERSION}" \
  init

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp "$SCRIPT_DIR/genesis.json" "${BOV_DIR}/config/genesis.json"

docker run --user="$UID" \
  -v "${BOV_DIR}:/data" \
  "iov1/bnsd:${BOV_VERSION}" \
  -home "/data" \
  init -i
