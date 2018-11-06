#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

TM_VERSION=0.21.0
TM_DIR=$(mktemp -d "${TMPDIR:-/tmp}/tendermint.XXXXXXXXX")
echo "TM_DIR = $TM_DIR"

PORT=${TM_PORT:-12345}

chmod 777 "${TM_DIR}"

docker pull "tendermint/tendermint:${TM_VERSION}"

docker run --user="$UID" \
  -v "${TM_DIR}:/tendermint" \
  "tendermint/tendermint:${TM_VERSION}" \
  init

# must enable tx index for search and subscribe
exec docker run --user="$UID" \
  -p "${PORT}:26657" -v "${TM_DIR}:/tendermint" \
  -e "TM_TX_INDEX_INDEX_ALL_TAGS=true" \
  "tendermint/tendermint:${TM_VERSION}" node \
  --proxy_app=kvstore \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
