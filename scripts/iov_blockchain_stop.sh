# shellcheck shell=bash

# blockchain_stop is meant to be sourced by .travis.yml or locally after running tests

if [[ ! -z ${TENDERMINT_ENABLED:-} ]]; then
  echo "Stopping tendermint"
  "${SCRIPT_DIR}"/tendermint/stop.sh
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
