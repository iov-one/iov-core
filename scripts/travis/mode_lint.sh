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

export ESLINT_FLAGS='--config ../../.eslintrc.ci.json'

fold_start "yarn-lint"
yarn lint
fold_end
