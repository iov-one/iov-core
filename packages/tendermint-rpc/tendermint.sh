#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

PORT=${TM_PORT:-12345}
VERSION=${TM_VERSION:-0.20.0}

DIR="${HOME}/tmtest/${VERSION}"

# be extra careful a missing variable doens't delete root
sudo rm -rf "${DIR:-/tmp/foo}"
mkdir -p "${DIR}"
chmod 777 "${DIR}"

docker run -v "${DIR}:/tendermint" \
  tendermint/tendermint:${VERSION} init

exec docker run -p ${PORT}:26657 -v "${DIR}:/tendermint" \
  tendermint/tendermint:${VERSION} node \
  --proxy_app=kvstore \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --log_level=state:info,rpc:info,*:error
