#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

mkdir -p ../iov-core-docs/latest

for name in $(find ./packages -maxdepth 2 -name docs -type d | cut -c 12- | cut -d"/" -f1); do
  echo "$name"
  rsync -a "./packages/$name/docs/" "../iov-core-docs/latest/$name"
done
