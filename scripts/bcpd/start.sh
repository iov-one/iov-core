#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/iov1/tendermint/tags/
export BCPD_TM_VERSION=v0.29.1
# Choose from https://hub.docker.com/r/iov1/bcpd/tags/
export BCPD_VERSION=v0.14.0

# get this files directory regardless of pwd when we run it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BCPD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bcpd.XXXXXXXXX")
export BCPD_DIR
echo "BCPD_DIR = $BCPD_DIR"

LOGS_FILE_TM="${TMPDIR:-/tmp}/bcpd_tm.log"
LOGS_FILE_APP="${TMPDIR:-/tmp}/bcpd_app.log"

"${SCRIPT_DIR}"/bcpd_init.sh
"${SCRIPT_DIR}"/bcpd_tm.sh > "$LOGS_FILE_TM" &
"${SCRIPT_DIR}"/bcpd_app.sh > "$LOGS_FILE_APP" &

sleep 3
# for debug output
cat "$LOGS_FILE_TM"
cat "$LOGS_FILE_APP"
