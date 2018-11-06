#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$BNSD_TM_VERSION" ]; then
  echo "BNSD_TM_VERSION must be set"; exit 1
fi

if [ -z "$BOV_VERSION" ]; then
  echo "BOV_VERSION must be set"; exit 1
fi

if [ -z "$BOV_DIR" ]; then
  echo "BOV_DIR must be set"; exit 1
fi

# this assumes it was run after bnsd_init.sh and this exists
if [ ! -d "${BOV_DIR}" ]; then
  echo "Error: directory not created for bov"; exit 1;
fi

PORT=${BOV_PORT:-22345}

# tx indexing set in bov init
exec docker run --user="$UID" \
  -p "${PORT}:26657" -v "${BOV_DIR}:/tendermint" \
  "iov1/tendermint:${BNSD_TM_VERSION}" node \
  --proxy_app="unix:///tendermint/app.sock" \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
