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

exec docker run \
  -v "${FAUCET_DIR}/config.yaml":/config.yaml \
  -v "${FAUCET_DIR}/pk:/pk" \
  -p 8080:8080 \
  --env TESTNET_NAME="http://localhost:22345" \
  iov1/faucet faucet \
  --key_file pk
