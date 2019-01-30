#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

function fold_start() {
  export CURRENT_FOLD_NAME="$1"
  travis_fold start "$CURRENT_FOLD_NAME"
  travis_time_start
}

function fold_end() {
  travis_time_finish
  travis_fold end "$CURRENT_FOLD_NAME"
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

fold_start "yarn-install"
# shellcheck disable=SC1091
source ./scripts/retry.sh
retry 3 yarn install
fold_end

case "$MODE" in
tests)
  "$SCRIPT_DIR/mode_tests.sh" ;;
lint)
  "$SCRIPT_DIR/mode_lint.sh" ;;
docs)
  "$SCRIPT_DIR/mode_docs.sh" ;;
*)
  echo "Invalid MODE"; exit 1 ;;
esac
