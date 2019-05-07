#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$BCPD_TM_VERSION" ]; then
  echo "BCPD_TM_VERSION must be set"; exit 1
fi

if [ -z "$BCPD_VERSION" ]; then
  echo "BCPD_VERSION must be set"; exit 1
fi

if [ -z "$BCPD_DIR" ]; then
  echo "BCPD_DIR must be set"; exit 1
fi


chmod 777 "${BCPD_DIR}"

docker run --rm \
  --user="$UID" \
  -v "${BCPD_DIR}:/tendermint" \
  "iov1/tendermint:${BCPD_TM_VERSION}" \
  init

mv "${BCPD_DIR}/config/genesis.json" "${BCPD_DIR}/config/genesis.json.orig"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_STATE=$(<"$SCRIPT_DIR/genesis_app_state.json")
jq ". + {\"app_state\" : $APP_STATE}" \
  "${BCPD_DIR}/config/genesis.json.orig" \
  > "${BCPD_DIR}/config/genesis.json"

docker run --rm \
  --user="$UID" \
  -v "${BCPD_DIR}:/data" \
  "iov1/bcpd:${BCPD_VERSION}" \
  -home "/data" \
  init -i

sed -ie 's/cors_allowed_origins.*$/cors_allowed_origins = ["*"]/' \
  "${BCPD_DIR}/config/config.toml"
