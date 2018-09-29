# blockchain_start is called in .travis.yml or also locally before running tests
# to ensure we have all the blockchains set up for the full integration tests

# get this files directory regardless of pwd when we run it
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# this is root of all the lerna packages to find package-specific scripts
PACKAGES="${DIR}/../packages"

export TM_VERSION=0.21.0
export BOV_VERSION=v0.6.0
docker pull tendermint/tendermint:${TM_VERSION}
docker pull iov1/tendermint:${TM_VERSION}
docker pull iov1/bov:${BOV_VERSION}
export TENDERMINT_ENABLED=1
export BOV_ENABLED=1

export TM_DIR=$(mktemp -d "${TMPDIR:-/tmp}/tendermint_${TM_VERSION}.XXXXXXXXX")
export BOV_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bov_${BOV_VERSION}.XXXXXXXXX")
echo "TM_DIR = $TM_DIR"
echo "BOV_DIR = $BOV_DIR"

${PACKAGES}/iov-tendermint-rpc/tendermint.sh > /tmp/foo.log &
export TM_PID=$!
echo "Started tendermint" $TM_PID
sleep 2

${PACKAGES}/iov-bns/bov_init.sh
${PACKAGES}/iov-bns/bov_tm.sh > /tmp/bov_tm.log &
export BOV_TM_PID=$!
${PACKAGES}/iov-bns/bov_app.sh > /tmp/bov_app.log &
export BOV_APP_PID=$!
sleep 3
# for debug output
cat /tmp/bov_tm.log
cat /tmp/bov_app.log
