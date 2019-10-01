#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/tendermint/gaia/tags
VERSION="v2.0.0"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/gaia.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"
LOGFILE="$TMP_DIR/gaia.log"
CURRENT_DIR="$(realpath "$(dirname "$0")")"
HOME_DIR="/home"

docker run \
  --rm \
  --user="$UID" \
  -t \
  --name gaiad \
  -v "$CURRENT_DIR/.gaiad:$HOME_DIR/.gaiad" \
  -v "$CURRENT_DIR/.gaiacli:$HOME_DIR/.gaiacli" \
  -w "$HOME_DIR" \
  --env "HOME=$HOME_DIR" \
  "tendermint/gaia:${VERSION}" \
  gaiad start \
  > "$LOGFILE" &

echo "gaiad running and logging into $LOGFILE"
