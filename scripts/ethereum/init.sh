#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

export GANACHE_PORT="8545"

# Don't pull before run. We can use whatever version of alpine is available locally.
DOCKER_HOST_IP=$(docker run --rm alpine ip route | awk 'NR==1 {print $3}')

docker run --rm --read-only "iov1/ethereum-deployment:latest" "ws://$DOCKER_HOST_IP:$GANACHE_PORT/ws"
