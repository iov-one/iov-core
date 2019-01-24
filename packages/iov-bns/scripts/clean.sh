#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This must be run after weave.sh and will clean up the protobuf files
# before compilation, to remove traces of gogoproto
# 
# It will write all cleaned proto to ./$OUTDIR, default ./clean

INDIR=weave
OUTDIR=${OUTDIR:-clean}

rm -rf ./${OUTDIR}

for file in `find ./weave -name '*.proto' -not -path '*/vendor/*' -not -path '*/examples/*' -not -path '*/cmd/bcpd/*'`; do
  outfile=$(echo $file | sed s/$INDIR/$OUTDIR/)
  outdir=$(dirname $outfile)
  mkdir -p $outdir
  echo $outfile

  # This was targeted removing of gogoproto flags, but left []; for options on fields, which caused silent compile errors
  # cat $file | sed 's/(gogoproto.*) *= *[^]]*//g' | sed 's/^.*github.com\/gogo\/protobuf\/gogoproto\/gogo.*//' > $outfile

  # This just removes all options after the fields, and removes illegal ;; typos
  cat $file | sed 's/ *\[[^]]*\];/;/g' | sed 's/;;/;/' > $outfile
done
