#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/iov1/tendermint/tags/
export BNSD_TM_VERSION=v0.29.1
# Choose from https://hub.docker.com/r/iov1/bnsd/tags/
export BNSD_VERSION=v0.14.0

# get this files directory regardless of pwd when we run it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BNSD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bnsd.XXXXXXXXX")
export BNSD_DIR
echo "BNSD_DIR = $BNSD_DIR"

LOGS_FILE_TM="${TMPDIR:-/tmp}/bnsd_tm.log"
LOGS_FILE_APP="${TMPDIR:-/tmp}/bnsd_app.log"

"${SCRIPT_DIR}"/bnsd_init.sh
"${SCRIPT_DIR}"/bnsd_tm.sh > "$LOGS_FILE_TM" &
"${SCRIPT_DIR}"/bnsd_app.sh > "$LOGS_FILE_APP" &

sleep 3
# for debug output
cat "$LOGS_FILE_TM"
cat "$LOGS_FILE_APP"
