#!/bin/bash
set -exo pipefail

cd /sdk_codegen
yarn install

# generate the various typescript SDK
yarn sdk typescript

# now here run whatever tests!
source /home/looker/.bash_profile
#Your test
yarn test
