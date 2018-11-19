#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/tendermint/tendermint/tags/
# TENDERMINT_VERSION is available for manualy testing different versions and usually unset
VERSION=${TENDERMINT_VERSION:-0.25.0}
PORT=12345

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/tendermint.XXXXXXXXX")
chmod 777 "${TMP_DIR}"
echo "Using temporary dir $TMP_DIR"
LOGFILE="$TMP_DIR/tendermint.log"

docker pull "tendermint/tendermint:${VERSION}"

docker run --user="$UID" \
  -v "${TMP_DIR}:/tendermint" \
  "tendermint/tendermint:${VERSION}" \
  init

# must enable tx index for search and subscribe
docker run --user="$UID" \
  -p "${PORT}:26657" -v "${TMP_DIR}:/tendermint" \
  -e "TM_TX_INDEX_INDEX_ALL_TAGS=true" \
  "tendermint/tendermint:${VERSION}" node \
  --proxy_app=kvstore \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error \
  > "$LOGFILE" &

echo "Tendermint running and logging into $LOGFILE"
