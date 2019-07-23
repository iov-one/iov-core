#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

WEAVE=${1:-"./go/src/github.com/iov-one/weave/spec/testvectors"}
>&2 echo "Collecting test vectors from $WEAVE ..."

function normalizeHex() {
  xxd -r -p - | xxd -p -c 999999
}

function readAsString() {
  jq -r "$2" "$1"
}

function readHexBytes() {
  readAsString "$1" "$2" | normalizeHex
}

function readBase64Bytes() {
  readAsString "$1" "$2" | base64 --decode - | xxd -p -c 999999
}

function readBin() {
  xxd -p -c 999999 < "$1"
}

>&2 echo "Reading address ..."
address=$(bech32 -e -h tiov "$(cut -d " " -f2 "$WEAVE/ADDRESS.txt")")

>&2 echo "Reading coin files ..."
coin_whole=$(readAsString "$WEAVE/coin.json" .whole)
coin_fractional=$(readAsString "$WEAVE/coin.json" .fractional)
coin_ticker=$(readAsString "$WEAVE/coin.json" .ticker)
coin_bin=$(readBin "$WEAVE/coin.bin")

>&2 echo "Reading pubkey/privkey files ..."
pubkey_ed25519_raw=$(readBase64Bytes "$WEAVE/pub_key.json" .Pub.Ed25519)
pubkey_bin=$(readBin "$WEAVE/pub_key.bin")
privkey_ed25519_raw=$(readBase64Bytes "$WEAVE/priv_key.json" .Priv.Ed25519)
privkey_bin=$(readBin "$WEAVE/priv_key.bin")

>&2 echo "Reading unsigned_tx files ..."
unsigned_tx_sender=$(bech32 -e -h tiov "$(readHexBytes "$WEAVE/unsigned_tx.json" .Sum.CashSendMsg.source)")
unsigned_tx_recipient=$(bech32 -e -h tiov "$(readHexBytes "$WEAVE/unsigned_tx.json" .Sum.CashSendMsg.destination)")
unsigned_tx_amount_whole=$(readAsString "$WEAVE/unsigned_tx.json" .Sum.CashSendMsg.amount.whole)
unsigned_tx_amount_ticker=$(readAsString "$WEAVE/unsigned_tx.json" .Sum.CashSendMsg.amount.ticker)
unsigned_tx_memo=$(readAsString "$WEAVE/unsigned_tx.json" .Sum.CashSendMsg.memo)
unsigned_tx_bin=$(readBin "$WEAVE/unsigned_tx.bin")
unsigned_tx_signbytes=$(readBin "$WEAVE/unsigned_tx.signbytes")

>&2 echo "Reading signed_tx files ..."
signed_tx_sig_nonce=$(readAsString "$WEAVE/signed_tx.json" ".signatures[0].sequence")
signed_tx_sig_ed25519_raw=$(readBase64Bytes "$WEAVE/signed_tx.json" ".signatures[0].signature.Sig.Ed25519")
signed_tx_bin=$(readBin "$WEAVE/signed_tx.bin")

>&2 echo "Creating JSON document ..."
echo "{}" \
  | jq ".coin.quantity = \"${coin_whole}0000${coin_fractional}\"" \
  | jq ".coin.ticker = \"${coin_ticker}\"" \
  | jq ".coin.bin = \"$coin_bin\"" \
  | jq ".address = \"$address\"" \
  | jq ".pubkey.ed25519_raw = \"$pubkey_ed25519_raw\"" \
  | jq ".pubkey.bin = \"$pubkey_bin\"" \
  | jq ".privkey.ed25519_raw = \"$privkey_ed25519_raw\"" \
  | jq ".privkey.bin = \"$privkey_bin\"" \
  | jq ".unsigned_tx.sender = \"$unsigned_tx_sender\"" \
  | jq ".unsigned_tx.recipient = \"$unsigned_tx_recipient\"" \
  | jq ".unsigned_tx.amount.quantity = \"${unsigned_tx_amount_whole}000000000\"" \
  | jq ".unsigned_tx.amount.ticker = \"$unsigned_tx_amount_ticker\"" \
  | jq ".unsigned_tx.memo = \"$unsigned_tx_memo\"" \
  | jq ".unsigned_tx.bin = \"$unsigned_tx_bin\"" \
  | jq ".unsigned_tx.signbytes = \"$unsigned_tx_signbytes\"" \
  | jq ".signed_tx.sig.nonce = \"$signed_tx_sig_nonce\"" \
  | jq ".signed_tx.sig.ed25519_raw = \"$signed_tx_sig_ed25519_raw\"" \
  | jq ".signed_tx.bin = \"$signed_tx_bin\""
