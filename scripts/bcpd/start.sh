#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# Choose from https://hub.docker.com/r/iov1/tendermint/tags/
export BCPD_TM_VERSION=v0.29.1
# Choose from https://hub.docker.com/r/iov1/bcpd/tags/
export BCPD_VERSION=v0.11.0

docker pull "iov1/tendermint:${BCPD_TM_VERSION}"
docker pull "iov1/bcpd:${BCPD_VERSION}"

# get this files directory regardless of pwd when we run it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BCPD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bcpd.XXXXXXXXX")
export BCPD_DIR
echo "BCPD_DIR = $BCPD_DIR"
bash "${SCRIPT_DIR}"/bcpd_init.sh
bash "${SCRIPT_DIR}"/bcpd_tm.sh > "${TMPDIR:-/tmp}/bcpd_tm.log" &
bash "${SCRIPT_DIR}"/bcpd_app.sh > "${TMPDIR:-/tmp}/bcpd_app.log" &

sleep 3
# for debug output
cat "${TMPDIR:-/tmp}/bcpd_tm.log"
cat "${TMPDIR:-/tmp}/bcpd_app.log"
