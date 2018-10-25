#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

function shutdownGanache() {
  # shellcheck disable=SC2009
  GANACHE_SEARCH=$(ps -ef | grep "[g]anache" || true)
  GANACHE_PID=$(echo "${GANACHE_SEARCH}" | awk '{print $2}')
  if [ "$GANACHE_PID" != "" ]
  then
    echo "Killing existing Ganache CLI process $GANACHE_PID"
    kill -9 "$GANACHE_PID"
  fi
}

shutdownGanache
