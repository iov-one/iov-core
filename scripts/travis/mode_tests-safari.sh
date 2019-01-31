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
# Config
#

# Ensure consecutive Safari sessions don't re-open old tabs
# https://github.com/karma-runner/karma-safari-launcher/issues/6
defaults write com.apple.Safari ApplePersistenceIgnoreState YES

#
# Build
#

fold_start "yarn-build"
yarn build
fold_end

export SKIP_BUILD=1

#
# Test Safari
#

fold_start "test-safari"
yarn run lerna run test-safari
fold_end
