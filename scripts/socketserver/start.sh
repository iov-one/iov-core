#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

LOGFILE="/tmp/socketserver.log"

"$SCRIPT_DIR/echo.py" > "$LOGFILE" &

# Debug start
sleep 3
cat "$LOGFILE"
