# shellcheck shell=bash

# blockchain_start is called in .travis.yml or also locally before running tests
# to ensure we have all the blockchains set up for the full integration tests

if [ -z "${BASH_SOURCE[0]}" ]; then
  echo "\${BASH_SOURCE[0]} is unset or empty. This usually means your current shell does not support it.";
  echo "Please use bash do start and stop the blockchain or use your shell scripting superhero powers to show us a better solution at"
  echo "https://github.com/iov-one/iov-core"
else
  # get this files directory regardless of pwd when we run it
  SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

  export TM_VERSION=0.21.0
  docker pull tendermint/tendermint:${TM_VERSION}
  export TENDERMINT_ENABLED=1

  export BNSD_TM_VERSION=0.21.0
  export BOV_VERSION=v0.8.0
  docker pull iov1/tendermint:${BNSD_TM_VERSION}
  docker pull iov1/bnsd:${BOV_VERSION}
  export BOV_ENABLED=1

  TM_DIR=$(mktemp -d "${TMPDIR:-/tmp}/tendermint_${TM_VERSION}.XXXXXXXXX")
  BOV_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bov_${BOV_VERSION}.XXXXXXXXX")
  export TM_DIR
  export BOV_DIR
  echo "TM_DIR = $TM_DIR"
  echo "BOV_DIR = $BOV_DIR"

  "${SCRIPT_DIR}"/tendermint/tendermint.sh > /tmp/foo.log &
  export TM_PID=$!
  echo "Started tendermint" $TM_PID
  sleep 2

  "${SCRIPT_DIR}"/bnsd/bnsd_init.sh
  "${SCRIPT_DIR}"/bnsd/bnsd_tm.sh > /tmp/bnsd_tm.log &
  export BOV_TM_PID=$!
  "${SCRIPT_DIR}"/bnsd/bnsd_app.sh > /tmp/bnsd_app.log &
  export BOV_APP_PID=$!
  sleep 3
  # for debug output
  cat /tmp/bnsd_tm.log
  cat /tmp/bnsd_app.log
fi
