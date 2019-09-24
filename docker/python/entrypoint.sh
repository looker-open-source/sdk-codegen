#!/bin/bash
set -exo pipefail

cd /sdk-codegen
yarn install

# generate the various SDKs
NODE_TLS_REJECT_UNAUTHORIZED='0' yarn sdk

cd /sdk-codegen/python
python setup.py install

# now here run whatever tests!
