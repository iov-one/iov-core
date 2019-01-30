#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Build
#

fold_start "yarn-docs"
yarn docs
fold_end

#
# Deploy
#

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

  ./scripts/copy_docs.sh

  (
    cd "../iov-core-docs"
    git add ./latest
    git commit -m "Update docs"
    git push -f
  )
fi
