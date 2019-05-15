#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# A temporary dir created to make the docker-compose files from
# https://github.com/LiskHQ/lisk/tree/v1.4.0/docker available.
TMP_DIR="${TMPDIR:-/tmp}/@iov"
mkdir -p "$TMP_DIR"

LISK_DIR="lisk"
# can be a branch or tag
LISK_TAG="v1.6.0"
# Use a version available on docker hub: https://hub.docker.com/r/lisk/core/tags/
LISK_DOCKER_VERSION="1.6.0"

(
  cd "$TMP_DIR"
  echo "Navigated to temp directory $(pwd)"
  if [ -d "$LISK_DIR" ]; then
    if ! git -C "$LISK_DIR" describe --tags --exact-match --match="$LISK_TAG"; then
      echo "WARNING: Found incompatible Lisk repo. Deleting..."
      rm -rf "$LISK_DIR"
      git clone --depth 1 --branch "$LISK_TAG" https://github.com/LiskHQ/lisk.git
    fi
  else
    git clone --depth 1 --branch "$LISK_TAG" https://github.com/LiskHQ/lisk.git
  fi

  (
    cd "lisk/docker"
    sed -e "s|ENV_LISK_VERSION=.*|ENV_LISK_VERSION=$LISK_DOCKER_VERSION|" .env.development > .env

    make
    make coldstart
  )
)
