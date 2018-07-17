#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

# PORT=${BOV_PORT:-22345}
VERSION=${TM_VERSION:-0.21.0}

DIR="${HOME}/bovtest/${VERSION}"

# be extra careful a missing variable doens't delete root
sudo rm -rf "${DIR:-/tmp/foo}"
mkdir -p "${DIR}"
chmod 777 "${DIR}"

docker run -v "${DIR}:/tendermint" \
  "iov1/tendermint:${VERSION}" init

# must enable tx index for search and subscribe
# exec docker run -p "${PORT}:26657" -v "${DIR}:/tendermint" \
#   -e "TM_TX_INDEX_INDEX_ALL_TAGS=true" \
#   "iov1/tendermint:${VERSION}" node \
#   --proxy_app="unix:///tendermint/app.sock" \
#   --rpc.laddr=tcp://0.0.0.0:26657 \
#   --log_level=state:info,rpc:info,*:error
