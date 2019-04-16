#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

PORT=23457

if [ -z "$BCPD_TM_VERSION" ]; then
  echo "BCPD_TM_VERSION must be set"; exit 1
fi

if [ -z "$BCPD_VERSION" ]; then
  echo "BCPD_VERSION must be set"; exit 1
fi

if [ -z "$BCPD_DIR" ]; then
  echo "BCPD_DIR must be set"; exit 1
fi

# this assumes it was run after bcpd_init.sh and this exists
if [ ! -d "${BCPD_DIR}" ]; then
  echo "Error: directory not created for bcpd"; exit 1;
fi

# tx indexing set in init
exec docker run --rm \
  --user="$UID" \
  -p "${PORT}:26658" -v "${BCPD_DIR}:/tendermint" \
  --name "bcpd-tendermint" \
  --rm "iov1/tendermint:${BCPD_TM_VERSION}" node \
  --proxy_app="unix:///tendermint/app.sock" \
  --rpc.laddr=tcp://0.0.0.0:26658 \
  --log_level=state:info,rpc:info,*:error
