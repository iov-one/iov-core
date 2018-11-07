#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/faucet_start.XXXXXXXXX")
(
  cd "$TMP_DIR"
  git clone --depth 1 --branch master https://github.com/iov-one/iov-faucet
  (
    cd "iov-faucet"
    yarn install
    yarn build

    LOGFILE="$TMP_DIR/faucet.log"
    yarn dev-start > "$LOGFILE" &
    FAUCET_PID=$!
    echo "Faucet running as process $FAUCET_PID logging into $LOGFILE"
  )
)
