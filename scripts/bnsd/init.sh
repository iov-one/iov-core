#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# get this files directory regardless of pwd when we run it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -n "${INIT_PROPOSALS:-}" ]; then
  sleep 3
  echo "Deploying proposals..."
  node "${SCRIPT_DIR}/deploy_proposals.js"
  echo "Done."
fi
