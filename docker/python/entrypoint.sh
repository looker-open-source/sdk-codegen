#!/bin/bash
set -exo pipefail

cd /sdk_codegen
yarn install

# generate the various SDKs
NODE_TLS_REJECT_UNAUTHORIZED='0' yarn sdk

cd /sdk_codegen/python
python setup.py install

# now here run whatever tests!
source /home/looker/.bash_profile
python -m pytest --junitxml=sdk_codegen/results/test.xml /sdk_codegen/python/tests/integration/test_methods.py
