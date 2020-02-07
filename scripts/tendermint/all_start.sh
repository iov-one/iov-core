#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Find latest patch releases at https://hub.docker.com/r/tendermint/tendermint/tags/
declare -a TM_VERSIONS
TM_VERSIONS[31]=v0.31.11
TM_VERSIONS[32]=v0.32.3

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for KEY in "${!TM_VERSIONS[@]}"; do
  export TENDERMINT_VERSION="${TM_VERSIONS[$KEY]}"
  export TENDERMINT_PORT="111$KEY"
  export TENDERMINT_NAME="tendermint-$KEY"

  echo "Starting $TENDERMINT_NAME ($TENDERMINT_VERSION) on port $TENDERMINT_PORT ..."
  "$SCRIPT_DIR/start.sh"
done
