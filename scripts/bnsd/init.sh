#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

if [ -n "${INIT_PROPOSALS:-}" ]; then
  sleep 3
  echo "Deploying proposals..."
  node "./deploy_proposals.js"
  echo "Done."
fi
