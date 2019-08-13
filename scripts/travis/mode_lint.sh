#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Includes
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# shellcheck disable=SC1090
source "$SCRIPT_DIR/_includes.sh";

#
# Lint
#

fold_start "yarn-lint"
yarn lint
fold_end

#
# Sanity
#

fold_start "format"
# This in combination with check-dirty (below) ensures code formatting is up-to-date
yarn format
fold_end

fold_start "format-text"
# This in combination with check-dirty (below) ensures text formatting is up-to-date
yarn format-text
fold_end

fold_start "check-dirty"
# Ensure build step didn't modify source files to avoid unprettified repository state
SOURCE_CHANGES=$(git status --porcelain)
if [[ -n "$SOURCE_CHANGES" ]]; then
  echo "Error: repository contains changes."
  echo "Showing 'git status' and 'git diff' for debugging reasons now:"
  git status
  git diff
  exit 1
fi
fold_end
