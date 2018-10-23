#!/bin/bash
# Helper script for starting/stopping ganache and running tests
#

function startupGanache() {
  GANACHE_SEARCH="$(ps -ef | grep "[g]anache" | awk '{print $2}')"
  export GANACHE_PID="${GANACHE_SEARCH}"
  if [ "$GANACHE_PID" != "" ]
  then
    echo "Killing existing Ganache CLI process $GANACHE_PID"
    kill -9 $GANACHE_PID

    ./node_modules/.bin/ganache-cli -p 7545 -i 5777 -m "$MNEMONIC" > /dev/null &
    export GANACHE_PID=$!
    echo "Started new Ganache CLI as process $GANACHE_PID"
  else
    ./node_modules/.bin/ganache-cli -p 7545 -i 5777 -m "$MNEMONIC" > /dev/null &
    export GANACHE_PID=$!
    echo "Started new Ganache CLI as process $GANACHE_PID"
  fi
}

startupGanache
