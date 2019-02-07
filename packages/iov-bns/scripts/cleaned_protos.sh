#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# This must be run after weave.sh and will clean up the protobuf files
# before compilation, to remove traces of gogoproto
#
# It will write all cleaned proto to a temporary dir

CODEDIR=go/src/github.com/iov-one/weave
OUT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/clean_proto.XXXXXXXXX")

# Write debugging to STDERR
>&2 echo "Using temporary folder for prepared .proto files: $OUT_DIR"

(
  cd "$CODEDIR"
  find . -name '*.proto' -not -path '*/vendor/*' -not -path '*/examples/*' -not -path '*/cmd/bcpd/*' > tmp
  while IFS= read -r filename
  do
    outfile="$OUT_DIR/$filename"
    outdir=$(dirname "$outfile")
    mkdir -p "$outdir"
    echo "$outfile"
    cp "$filename" "$outfile"
    # This just removes all options after the fields
    sed -ie 's/ *\[[^]]*\];/;/g' "$outfile"
    # removes illegal ;; typos
    sed -ie 's/;;/;/' "$outfile"
    # convert comments into doc comments
    sed -ie 's|// |/// |' "$outfile"
  done < tmp
  rm tmp
)
