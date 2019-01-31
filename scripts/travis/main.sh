#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/_includes.sh";

fold_start "yarn-install"
retry 3 yarn install
fold_end

case "$MODE" in
tests-default)
  "$SCRIPT_DIR/mode_tests-default.sh" ;;
tests-chrome)
  "$SCRIPT_DIR/mode_tests-default.sh" ;;
tests-firefox)
  "$SCRIPT_DIR/mode_tests-default.sh" ;;
tests-safari)
  "$SCRIPT_DIR/mode_tests-safari.sh" ;;
lint-docs)
  "$SCRIPT_DIR/mode_lint.sh"
  "$SCRIPT_DIR/mode_docs.sh"
  ;;
*)
  echo "Invalid MODE"; exit 1 ;;
esac
