#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

function fold_start() {
  export CURRENT_FOLD_NAME="$1"
  travis_fold start "$CURRENT_FOLD_NAME"
  travis_time_start
}

function fold_end() {
  travis_time_finish
  travis_fold end "$CURRENT_FOLD_NAME"
}

fold_start "yarn-build"
yarn build
fold_end

export SKIP_BUILD=1

fold_start "yarn-docs"
yarn docs
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

fold_start "commandline-tests"
yarn test
fold_end

# Test in browsers

fold_start "test-chrome"
yarn run lerna run test-chrome
fold_end

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  fold_start "test-safari"
  yarn run lerna run test-safari
  fold_end

  # Firefox does not run on Linux VMs because "no DISPLAY environment variable specified"
  fold_start "test-firefox"
  yarn run lerna run test-firefox
  fold_end
fi
