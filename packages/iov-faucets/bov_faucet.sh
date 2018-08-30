#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && shellcheck "$0"

if [ ! -d "${FAUCET_DIR}" ]; then
  echo "Error: FAUCET_DIR does not exist";
  exit 1;
fi

(
  echo "coins:"
  echo "- ticker: IOV"
  echo "  whole: 10"
  echo "- ticker: CASH"
  echo "  whole: 10"
  echo "- ticker: ALX"
  echo "  whole: 10"
  echo "- ticker: PAJA"
  echo "  whole: 10"
  echo "middlewares:"
  echo "- recovery"
  echo "- logging"
  echo "- cors"
) > "${FAUCET_DIR}/config.yaml"

(
  # Note: the content of this file is invalid at the moment
  echo -n "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
) > "${FAUCET_DIR}/pk"

exec docker run \
  -v "${FAUCET_DIR}/config.yaml":/config.yaml \
  -v "${FAUCET_DIR}/pk:/pk" \
  -p 8080:8080 \
  --env TESTNET_NAME="http://localhost:22345" \
  iov1/faucet faucet \
  --key_file pk
