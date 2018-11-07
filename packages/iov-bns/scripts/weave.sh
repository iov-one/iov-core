#!/bin/bash
# This will check out the version of weave passed on the cli.
# Usage: bash weave.sh <v0.9.0>
# OR     VERSION=v0.9.0 bash weave.sh

# use cli arg, or environmental variable
TAG=${1:-$VERSION}
if [ -z "$TAG" ]; then
  echo "Please provide a tag to checkout, either as an arg or via VERSION env var";
  exit 1;
fi

# clone or update weave
if [ -d weave ]; then
  cd weave;
  git fetch;
else
  git clone git@github.com:iov-one/weave.git
  cd weave;
fi
git checkout "$TAG";
