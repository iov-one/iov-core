#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

TM_VERSION=${TM_VERSION:-0.21.0}
VERSION=${BOV_VERSION:-v0.5.1}

# this assumes it was run after bov_init.sh and this exists
if [ ! -d "${BOV_DIR}" ]; then
  echo "Error: directory not created for bov";
  exit 1;
fi

exec docker run -v "${BOV_DIR}:/data" "iov1/bov:${VERSION}" -home "/data" \
  start -bind="unix:///data/app.sock"
