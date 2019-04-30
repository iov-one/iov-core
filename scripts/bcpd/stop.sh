#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

echo "Killing BCPd containers ..."
docker container kill "bcpd-app" "bcpd-tendermint"
