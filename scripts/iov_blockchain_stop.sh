# shellcheck shell=bash

# blockchain_stop is meant to be sourced by .travis.yml or locally after running tests

if [[ ! -z ${TM_PID:-} ]]; then
  echo "Stopping tendermint: $TM_PID"
  kill "${TM_PID}"
  unset TM_PID
  unset TENDERMINT_ENABLED
fi

if [[ ! -z ${BOV_APP_PID:-} ]]; then
  echo "Stopping bov: ${BOV_TM_PID} ${BOV_APP_PID}"
  kill "${BOV_APP_PID}"
  kill "${BOV_TM_PID}"
  unset BOV_APP_PID
  unset BOV_TM_PID
  unset BOV_ENABLED
  # for debug output
  # cat /tmp/bnsd_app.log
fi
