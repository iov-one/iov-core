#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

declare -a TM_VERSIONS
TM_VERSIONS[25]=0.25.0
TM_VERSIONS[27]=0.27.4

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for KEY in "${!TM_VERSIONS[@]}"; do
  export TENDERMINT_VERSION="${TM_VERSIONS[$KEY]}"
  export TENDERMINT_PORT="111$KEY"
  export TENDERMINT_NAME="tendermint-$KEY"

  echo "Starting $TENDERMINT_NAME ($TENDERMINT_VERSION) on port $TENDERMINT_PORT ..."
  "$SCRIPT_DIR/start.sh"
done
