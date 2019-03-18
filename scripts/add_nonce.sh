#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This must be called from repo root as current directory

NONCE=$(date +%s)

for packagedir in ./packages/*; do
  if [[ -d "$packagedir" ]]; then
    echo "$packagedir"
    mkdir -p "$packagedir/nonces"
    echo "Directory used to trigger lerna package updates for all packages" \
      > "$packagedir/nonces/README.txt"
    touch "$packagedir/nonces/$NONCE"
  fi
done
