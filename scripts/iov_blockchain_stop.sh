# shellcheck shell=bash

# blockchain_stop is meant to be sourced by .travis.yml or locally after running tests

if [[ ! -z ${TM_PID:-} ]]; then
  echo "Stopping tendermint: $TM_PID"
  kill "${TM_PID}"
  unset TM_PID
  unset TENDERMINT_ENABLED
fi

if [[ ! -z ${BNSD_APP_PID:-} ]]; then
  echo "Stopping bnsd (Tendermint: ${BNSD_TM_PID:-}; Application: ${BNSD_APP_PID:-})"
  kill "${BNSD_APP_PID}"
  kill "${BNSD_TM_PID}"
  unset BNSD_APP_PID
  unset BNSD_TM_PID
  unset BNSD_ENABLED
  # for debug output
  # cat /tmp/bnsd_app.log
fi
