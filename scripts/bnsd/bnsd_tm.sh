#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

PORT=22345

if [ -z "$BNSD_TM_VERSION" ]; then
  echo "BNSD_TM_VERSION must be set"; exit 1
fi

if [ -z "$BNSD_VERSION" ]; then
  echo "BNSD_VERSION must be set"; exit 1
fi

if [ -z "$BNSD_DIR" ]; then
  echo "BNSD_DIR must be set"; exit 1
fi

# this assumes it was run after bnsd_init.sh and this exists
if [ ! -d "${BNSD_DIR}" ]; then
  echo "Error: directory not created for bnsd"; exit 1;
fi

# tx indexing set in init
exec docker run --user="$UID" \
  -p "${PORT}:26657" -v "${BNSD_DIR}:/tendermint" \
  "iov1/tendermint:${BNSD_TM_VERSION}" node \
  --proxy_app="unix:///tendermint/app.sock" \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
