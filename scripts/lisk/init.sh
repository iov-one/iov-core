#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

gnutimeout="$(command -v gtimeout || echo timeout)"

# When the HTTP API is ready, the genesis block (height 1) is not necessarily processed.
# We need the genesis block in order to process initial transactions, so let's wait for height >= 1.
echo "$(date) [Lisk node init] Waiting for node to answer and genesis block to be processed"
# shellcheck disable=SC2016
"$gnutimeout" 50 bash -c 'until [ "$(HEIGHT=$(curl  -sS --fail http://localhost:4000/api/node/status | jq -e .data.height) && echo $HEIGHT || echo 0)" -ge 1 ]; do sleep 2; done'
echo # add line break
echo "$(date) [Lisk node init] Got response"

echo "$(date) [Lisk node init] Posting transactions ..."

curl -sS -X POST \
  -H "Content-type: application/json" \
  -d '{"type":0,"amount":"144550000","recipientId":"2222222L","senderPublicKey":"c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f","timestamp":81017778,"fee":"10000000","asset":{},"signature":"3be0019dce1bd0c5586720d3e6b6355cac291d8c236e832f4fe68ea3f0926dd3d4e84f72e083cbc301a55cef0237fc5732b0f0516fd4c4b6345a6e71b9f7e800","id":"14104830969050871842"}' \
  http://localhost:4000/api/transactions
echo # add line break

curl -sS -X POST \
  -H "Content-type: application/json" \
  -d '{"type":0,"amount":"10044556677","recipientId":"1349293588603668134L","senderPublicKey":"c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f","timestamp":76888413,"fee":"10000000","asset":{"data":"We ❤️ developers – iov.one"},"signature":"2f79fb84fdf9b968f518c0c98add37811bd6cb46172cc1759cc35b5bca2f65cb0a213511cc93bda37adb2c6e1e77d5a9f6facb4a471e80622962b48e5be3d402","id":"12493173350733478622"}' \
  http://localhost:4000/api/transactions
echo # add line break

# Wait until block is forged and processed
sleep 15

curl -sS -X POST \
  -H "Content-type: application/json" \
  -d '{"type":0,"amount":"100000000","recipientId":"1349293588603668134L","senderPublicKey":"e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6","timestamp":76888557,"fee":"10000000","asset":{"data":"We ❤️ developers – iov.one"},"signature":"7f272033202323a6107a92629774102aa580c544abf66dd7c001cc5582259fcfe2b13cab475f130c5d485cae8e078b856a7f56865e6bcfd8b03792d45d6dc00e","id":"3947878526850651767"}' \
  http://localhost:4000/api/transactions
echo # add line break
