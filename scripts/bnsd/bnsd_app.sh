#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$BNSD_VERSION" ]; then
  echo "BNSD_VERSION must be set"; exit 1
fi

if [ -z "$BNSD_DIR" ]; then
  echo "BNSD_DIR must be set"; exit 1
fi

# this assumes it was run after bnsd_init.sh and this exists
if [ ! -d "${BNSD_DIR}" ]; then
  echo "Error: directory not created for bnsd"; exit 1;
fi

exec docker run --user="$UID" \
  -v "${BNSD_DIR}:/data" \
  "iov1/bnsd:${BNSD_VERSION}" \
  -home "/data" \
  start -bind="unix:///data/app.sock"
