#!/bin/bash

function startupGanache() {
  GANACHE_SEARCH="$(ps -ef | grep "[g]anache" | awk '{print $2}')"
  GANACHE_PID="${GANACHE_SEARCH}"
  if [ "$GANACHE_PID" != "" ]
  then
    echo "Killing existing Ganache CLI process $GANACHE_PID"
    kill -9 $GANACHE_PID
  fi
  ./node_modules/.bin/ganache-cli -p 7545 -i 5777 -m "$MNEMONIC" > /dev/null &
  GANACHE_PID=$!
  echo "Started new Ganache CLI as process $GANACHE_PID"
}

startupGanache
