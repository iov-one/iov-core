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

fold_start "test-cli-installation"
(
  WORKSPACE=$(pwd)
  DEMO_PROJECT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/iov-cli-installation.XXXXXXXXX")
  cd "$DEMO_PROJECT_DIR"
  yarn init -y
  yarn add "$WORKSPACE/packages/iov-cli" --dev
  "$(yarn bin)/iov-cli" --selftest
)
fold_end

if [[ "$TRAVIS_OS_NAME" == "linux" ]] && [[ "$TRAVIS_NODE_VERSION" == "8" ]] && [[ "$TRAVIS_BRANCH" == "master" ]] && [[ "$TRAVIS_PULL_REQUEST_BRANCH" == "" ]]; then
  (
    cd "$HOME"
    git config --global user.email "travis@iov.invalid"
    git config --global user.name "Travis Job"
  )

  (
    cd ".."
    git clone "https://webmaster128:$GITHUB_API_KEY@github.com/iov-one/iov-core-docs.git"
    cd "iov-core-docs"
    git checkout gh-pages
    git reset master
  )

  ./copy_docs.sh

  (
    cd "../iov-core-docs"
    git add ./latest
    git commit -m "Update docs"
    git push -f
  )
fi
