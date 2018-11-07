#!/bin/bash
# This will check out the version of weave passed on the cli.
# Usage: bash weave.sh <v0.9.0>

# check args
if [ -z "$1" ]; then
  echo "Please provide a tag to checkout";
  exit 1;
fi
TAG="$1"

# clone or update weave
if [ -d weave ]; then
  cd weave;
  git fetch;
else
  git clone git@github.com:iov-one/weave.git
  cd weave;
fi
git checkout "$TAG";
