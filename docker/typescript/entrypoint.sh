#!/bin/bash
set -exo pipefail

cd /sdk_codegen
yarn install

# generate the various SDKs
NODE_TLS_REJECT_UNAUTHORIZED='0' yarn sdk

# now here run whatever tests!
source /home/looker/.bash_profile
#Your test
