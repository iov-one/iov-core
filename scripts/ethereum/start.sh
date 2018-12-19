#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/trufflesuite/ganache-cli/tags
VERSION="v6.2.4"
PORT="8545"
GANACHE_MNEMONIC="oxygen fall sure lava energy veteran enroll frown question detail include maximum"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/ganache.XXXXXXXXX")
chmod 777 "${TMP_DIR}"
echo "Using temporary dir $TMP_DIR"
LOGFILE="$TMP_DIR/ganache.log"

docker pull "trufflesuite/ganache-cli:${VERSION}"

docker run -d \
  -p "${PORT}:8545" \
  "trufflesuite/ganache-cli:${VERSION}" \
  -p 8545 --networkId 5777 --mnemonic "$GANACHE_MNEMONIC" \
  > "$LOGFILE" &

echo "ganache-cli running and logging into $LOGFILE"
