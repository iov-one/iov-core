#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

PORT=${TM_PORT:-12345}
VERSION=${TM_VERSION:-0.21.0}

chmod 777 "${TM_DIR}"

docker run -v "${TM_DIR}:/tendermint" \
  "tendermint/tendermint:${VERSION}" init

# must enable tx index for search and subscribe
exec docker run -p "${PORT}:26657" -v "${TM_DIR}:/tendermint" \
  -e "TM_TX_INDEX_INDEX_ALL_TAGS=true" \
  "tendermint/tendermint:${VERSION}" node \
  --proxy_app=kvstore \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
