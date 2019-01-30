#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/trufflesuite/ganache-cli/tags
VERSION="v6.2.5"
PORT="8545"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/ganache.XXXXXXXXX")
chmod 777 "${TMP_DIR}"
echo "Using temporary dir $TMP_DIR"
LOGFILE="$TMP_DIR/ganache.log"

docker pull "trufflesuite/ganache-cli:${VERSION}"

docker run -d \
  -p "${PORT}:8545" \
  "trufflesuite/ganache-cli:${VERSION}" \
  -p 8545 --networkId 5777 \
  --account "0x5e4744cb651ef4598b5ea6183aa1a39e09699b4479bb1e73f717299a9cc84718,100000000000000000000" \
  --account "0x67f3bca40c3ec02b8c8630a09c459270bb29ad7f1c650156513a30c75a6a8a5f,1234567890987654321" \
  --account "0xcaabb4e5e22beb7f4ba936c53b3a3a29f9f4908073d8f4cfd300773581c46af8,100000000000000000000" \
  --account "0x531f5ff5a5171853bed4255539c47b2c14b85bc57722c6c0c1cac4be2ba768a3,10000000000000000000000" \
  > "$LOGFILE" &

echo "ganache-cli running and logging into $LOGFILE"
