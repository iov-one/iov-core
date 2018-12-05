#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# A temporary dir created to make the docker-compose files from
# https://github.com/LiskHQ/lisk/tree/1.2.0/docker available.
# Only used as long as this script runs
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/lisk_start.XXXXXXXXX")

# can be a branch or tag
LISK_BRANCH="v1.2.0"

(
  cd "$TMP_DIR"
  echo "Navigated to temp directory $(pwd)"
  git clone --depth 1 --branch "$LISK_BRANCH" https://github.com/LiskHQ/lisk.git

  (
    cd "lisk/docker"
    cp .env.development .env
    # Use a version available on docker hub: https://hub.docker.com/r/lisk/core/tags/
    sed -i -e 's|ENV_LISK_VERSION=.*|ENV_LISK_VERSION=1.2.0-alpha.3|' .env

    make
    make coldstart
  )
)
