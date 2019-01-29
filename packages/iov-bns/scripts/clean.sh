#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This must be run after weave.sh and will clean up the protobuf files
# before compilation, to remove traces of gogoproto
#
# It will write all cleaned proto to ./$OUTDIR, default ./clean

BASEDIR=$(pwd)

CODEDIR=go/src/github.com/iov-one/weave
OUTDIR=${OUTDIR:-clean}

rm -rf "./${OUTDIR}"

(
  cd "$CODEDIR"
  find . -name '*.proto' -not -path '*/vendor/*' -not -path '*/examples/*' -not -path '*/cmd/bcpd/*' > tmp
  while IFS= read -r file
  do
    outfile="$BASEDIR/$OUTDIR/$file"
    outdir=$(dirname "$outfile")
    mkdir -p "$outdir"
    echo "$outfile"
    # This just removes all options after the fields, and removes illegal ;; typos
    sed 's/ *\[[^]]*\];/;/g' "$file" | sed 's/;;/;/' > "$outfile"
  done < tmp
  rm tmp
)
