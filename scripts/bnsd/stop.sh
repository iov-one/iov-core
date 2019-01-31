#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

for NAME in "bnsd-app" "bnsd-tendermint"; do
  echo "Killing and removing container named '$NAME' ..."
  docker container rm -f "$NAME"
done
