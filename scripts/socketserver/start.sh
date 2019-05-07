#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

LOGFILE_4444="${TMPDIR:-/tmp}/socketserver_4444.log"
LOGFILE_4445="${TMPDIR:-/tmp}/socketserver_4445.log"

"$SCRIPT_DIR"/echo.py --port 4444 --delay 0 > "$LOGFILE_4444" &
"$SCRIPT_DIR"/echo.py --port 4445 --delay 4 > "$LOGFILE_4445" &

# Debug start
sleep 3
cat "$LOGFILE_4444"
cat "$LOGFILE_4445"
