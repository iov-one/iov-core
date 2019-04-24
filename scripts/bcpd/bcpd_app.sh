#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -z "$BCPD_VERSION" ]; then
  echo "BCPD_VERSION must be set"; exit 1
fi

if [ -z "$BCPD_DIR" ]; then
  echo "BCPD_DIR must be set"; exit 1
fi

# this assumes it was run after bcpd_init.sh and this exists
if [ ! -d "${BCPD_DIR}" ]; then
  echo "Error: directory not created for bcpd"; exit 1;
fi

exec docker run --rm \
  --user="$UID" \
  -v "${BCPD_DIR}:/data" \
  --name "bcpd-app" \
  "iov1/bcpd:${BCPD_VERSION}" \
  -home "/data" \
  start -bind="unix:///data/app.sock"
