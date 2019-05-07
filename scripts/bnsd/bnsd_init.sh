#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$BNSD_TM_VERSION" ]; then
  echo "BNSD_TM_VERSION must be set"; exit 1
fi

if [ -z "$BNSD_VERSION" ]; then
  echo "BNSD_VERSION must be set"; exit 1
fi

if [ -z "$BNSD_DIR" ]; then
  echo "BNSD_DIR must be set"; exit 1
fi


chmod 777 "${BNSD_DIR}"

docker run --rm \
  --user="$UID" \
  -v "${BNSD_DIR}:/tendermint" \
  "iov1/tendermint:${BNSD_TM_VERSION}" \
  init

mv "${BNSD_DIR}/config/genesis.json" "${BNSD_DIR}/config/genesis.json.orig"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_STATE=$(<"$SCRIPT_DIR/genesis_app_state.json")
jq ". + {\"app_state\" : $APP_STATE}" \
  "${BNSD_DIR}/config/genesis.json.orig" \
  > "${BNSD_DIR}/config/genesis.json"

docker run --rm \
  --user="$UID" \
  -v "${BNSD_DIR}:/data" \
  "iov1/bnsd:${BNSD_VERSION}" \
  -home "/data" \
  init -i

sed -ie 's/cors_allowed_origins.*$/cors_allowed_origins = ["*"]/' \
  "${BNSD_DIR}/config/config.toml"
