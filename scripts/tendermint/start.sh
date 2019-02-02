#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/tendermint/tendermint/tags/
# TENDERMINT_VERSION is available for manualy testing different versions and usually unset
VERSION=${TENDERMINT_VERSION:-0.25.0}
PORT=${TENDERMINT_PORT:-12345}
NAME=${TENDERMINT_NAME:-tendermint-25}

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/tendermint.XXXXXXXXX")
chmod 777 "${TMP_DIR}"
echo "Using temporary dir $TMP_DIR"
LOGFILE="$TMP_DIR/tendermint.log"

docker pull "tendermint/tendermint:${VERSION}"

docker run --rm \
  --user="$UID" \
  -v "${TMP_DIR}:/tendermint" \
  "tendermint/tendermint:${VERSION}" \
  init

# make sure we allow cors origins, only possible by modifying the config file
# https://github.com/tendermint/tendermint/issues/3216
sed -ie 's/cors_allowed_origins.*$/cors_allowed_origins = ["*"]/' "${TMP_DIR}/config/config.toml"

# must enable tx index for search and subscribe
docker run --rm \
  --user="$UID" \
  --name "$NAME" \
  -p "${PORT}:26657" -v "${TMP_DIR}:/tendermint" \
  -e "TM_TX_INDEX_INDEX_ALL_TAGS=true" \
  "tendermint/tendermint:${VERSION}" node \
  --proxy_app=kvstore \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error \
  > "$LOGFILE" &

echo "Tendermint running and logging into $LOGFILE"
