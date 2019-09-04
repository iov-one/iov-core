# shellcheck shell=bash

#
# Travis helpers
#
function fold_start() {
  export CURRENT_FOLD_NAME="$1"

  if [[ "${TRAVIS_COMMIT:-}" != "" ]]; then
    travis_fold start "$CURRENT_FOLD_NAME"
    travis_time_start "$CURRENT_FOLD_NAME"
  else
    echo "Starting $CURRENT_FOLD_NAME"
  fi
}

function fold_end() {
  if [[ "${TRAVIS_COMMIT:-}" != "" ]]; then
    travis_time_finish "$CURRENT_FOLD_NAME"
    travis_fold end "$CURRENT_FOLD_NAME"
  else
    echo "Done with $CURRENT_FOLD_NAME"
  fi
}

# shellcheck disable=SC1090
source "$SCRIPT_DIR/_retry.sh";
