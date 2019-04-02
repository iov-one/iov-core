#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

export GANACHE_PORT="8545"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Don't pull before run. We can use whatever version of alpine is available locally.
DOCKER_HOST_IP=$(docker run --rm alpine ip route | awk 'NR==1 {print $3}')

(
  # Use docker because this must run in nodejs 10+
  cd "$SCRIPT_DIR/deployment"
  docker build -t "ethereum-deployment:manual" .
  docker run --read-only --rm "ethereum-deployment:manual" "ws://$DOCKER_HOST_IP:$GANACHE_PORT/ws"
)
