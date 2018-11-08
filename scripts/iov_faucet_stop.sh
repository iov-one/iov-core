#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

CONTAINER_ID=$(docker container ls | grep "iov1/iov-faucet" | awk '{print $1}')

echo "Killing container '$CONTAINER_ID' ..."
docker container kill "$CONTAINER_ID"
