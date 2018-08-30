#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

PACKAGE_DIR="iov-core"

PREV_VERSION=$(jq -r .version < "packages/$PACKAGE_DIR/package.json")
VERSION="$1"

# Get Github token with "repo" permission from https://github.com/settings/tokens
# and set via `export GITHUB_API_TOKEN=xyz`.
GITHUB_USERNAME=$(curl -sS -H "Authorization: token $GITHUB_API_TOKEN" https://api.github.com/user | jq -r .login)

echo "Checking yarn version:" "$(yarn --version)"
echo "Checking github authorization: $GITHUB_USERNAME"
echo "Previous version: $PREV_VERSION"
echo "Releasing as version: $VERSION"
read -rp "Single line update description: " CHANGELOG

while true; do
  read -rp "Do you wish to continue? [yn] " yn
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

TAG=$(cd "packages/$PACKAGE_DIR" && npm version "$VERSION")

yarn install
yarn build
export SKIP_BUILD=1

(
  cd "packages/$PACKAGE_DIR"
  yarn pack-node
  yarn docs
)

TMP_DIR="tmp"
RELEASE_DIR="$TMP_DIR/iov-core"
BUNDLE_NAME="iov-core-bundle.$TAG.tar.gz"
mkdir -p "$RELEASE_DIR"
rm -rf "${RELEASE_DIR:?}"/*
cp "packages/$PACKAGE_DIR/dist/node/index.js" "$RELEASE_DIR"
cp -R "packages/$PACKAGE_DIR/types" "$RELEASE_DIR"
cp -R "packages/$PACKAGE_DIR/docs" "$RELEASE_DIR"

#shellcheck disable=SC2016
TEMPLATE='{
  "name": "iov-core-local",
  "version": "\($version)",
  "private": true,
  "license": "Internal only!",
  "main": "index.js",
  "types": "types/index.d.ts",
}'
jq -n --arg version "$VERSION" "$TEMPLATE" > "$RELEASE_DIR"/package.json

(
  cd "$TMP_DIR"
  tar -cvzf "$BUNDLE_NAME" iov-core
)

OLD_CHANGELOG=$(tail -n +3 CHANGELOG.md)
(
  echo "# Changelog"
  echo ""
  echo "## $VERSION"
  echo ""
  echo "$CHANGELOG"
  echo ""
  echo "$OLD_CHANGELOG"
) > CHANGELOG.md

git add CHANGELOG.md
git add "packages/$PACKAGE_DIR"
git commit -m "Set version: $VERSION"
git tag --message "" --annotate "$TAG"

git push origin "$TAG"

# Create Github release
UPLOAD_URL=$(curl -sS \
  -H "Authorization: token $GITHUB_API_TOKEN" \
  -X POST \
  -d "{ \"tag_name\": \"$TAG\", \"name\": \"$TAG\", \"body\": \"$CHANGELOG\", \"draft\": false }" \
  https://api.github.com/repos/iov-one/iov-core/releases | jq -r .upload_url)
# Remove trailing {?name,label}
UPLOAD_URL="${UPLOAD_URL%\{*}"
echo "Asset upload URL: $UPLOAD_URL"

# Upload asset
curl -sS \
  -H "Authorization: token $GITHUB_API_TOKEN" \
  -H "Content-Type: application/x-gzip" \
  --upload-file "$TMP_DIR/$BUNDLE_NAME" \
  "$UPLOAD_URL?name=$BUNDLE_NAME" && echo

echo "Done :)"
