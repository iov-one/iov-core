#!/bin/bash
# Helper script for starting/stopping ganache and running tests
#

function shutdownGanache() {
  GANACHE_SEARCH="$(ps -ef | grep "[g]anache" | awk '{print $2}')"
  GANACHE_PID="${GANACHE_SEARCH}"
  if [ "$GANACHE_PID" != "" ]
  then
    echo "Killing existing Ganache CLI process $GANACHE_PID"
    kill -9 $GANACHE_PID
  fi
}

shutdownGanache
