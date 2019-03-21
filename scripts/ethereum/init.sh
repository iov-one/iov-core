#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

export GANACHE_PORT="8545"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

yarn ts-node "$SCRIPT_DIR/deploy_contracts.ts"
