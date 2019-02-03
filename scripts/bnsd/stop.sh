#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

echo "Killing BNSd containers ..."
docker container kill "bnsd-app" "bnsd-tendermint"
