#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

TM_VERSION=${TM_VERSION:-0.21.0}
BOV_VERSION=${BOV_VERSION:-v0.5.1}

DIR="${HOME}/bovtest/${TM_VERSION}"

# be extra careful a missing variable doens't delete root
sudo rm -rf "${DIR:-/tmp/foo}"
mkdir -p "${DIR}"
chmod 777 "${DIR}"

docker run -v "${DIR}:/tendermint" \
  "iov1/tendermint:${TM_VERSION}" init

docker run -v "${DIR}:/data" "iov1/bov:${BOV_VERSION}" -home "/data" \
  init CASH b1ca7e78f74423ae01da3b51e676934d9105f282
