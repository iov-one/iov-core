#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

export TSLINT_FLAGS='-c ./tslint_ci.json'

fold_start "yarn-lint"
yarn lint
fold_end
