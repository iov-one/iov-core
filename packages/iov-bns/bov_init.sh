#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

TM_VERSION=${TM_VERSION:-0.21.0}
BOV_VERSION=${BOV_VERSION:-v0.5.1}

chmod 777 "${BOV_DIR}"

docker run -v "${BOV_DIR}:/tendermint" \
  "iov1/tendermint:${TM_VERSION}" init

docker run -v "${BOV_DIR}:/data" "iov1/bov:${BOV_VERSION}" -home "/data" \
  init CASH b1ca7e78f74423ae01da3b51e676934d9105f282

echo "Tendermint Version"
docker run "iov1/tendermint:${TM_VERSION}" version

echo "Bov Version"
docker run "iov1/bov:${BOV_VERSION}" version
