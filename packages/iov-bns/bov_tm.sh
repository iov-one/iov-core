#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

PORT=${BOV_PORT:-22345}
VERSION=${TM_VERSION:-0.21.0}

# this assumes it was run after bov_init.sh and this exists
if [ ! -d "${BOV_DIR}" ]; then
  echo "Error: directory not created for bov";
  exit 1;
fi


# tx indexing set in bov init
exec docker run -p "${PORT}:26657" -v "${BOV_DIR}:/tendermint" \
  "iov1/tendermint:${VERSION}" node \
  --proxy_app="unix:///tendermint/app.sock" \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
