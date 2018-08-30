#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

for path in ./packages/*
do
  if [[ -d "$path" ]]; then
    echo "Generating .npmignore in directory $path";

    (
      echo "#"
      echo "# Auto-generated file. All changes will be lost!"
      echo "# See update_npm_ignore.sh"
      echo "#"
      echo ""
      cat ./.gitignore
      if [[ -f "$path/.gitignore" ]]; then
        echo ""
        cat "$path/.gitignore"
      fi

      echo ""
      echo "# .npmignore additions"
      echo "!build/"
      # we are not in the business of bundling for licensing reasons
      echo "karma.conf.js"
      echo "webpack*.config.js"
    ) > "$path/.npmignore";
  fi
done
