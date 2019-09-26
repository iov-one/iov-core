#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/tendermint/gaia/tags
VERSION="v2.0.0"
CURRENT_DIR="$(realpath "$(dirname "$0")")"
GAIAD_CONTAINER_NAME="gaiad"

docker run \
  --rm \
  --user="$UID" \
  -it \
  -v "$CURRENT_DIR/.gaiad:/root/.gaiad" \
  -v "$CURRENT_DIR/.gaiacli:/root/.gaiacli" \
  --net "container:$GAIAD_CONTAINER_NAME" \
  "tendermint/gaia:${VERSION}" \
  gaiacli "$@"
