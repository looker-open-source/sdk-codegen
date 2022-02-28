#!/bin/bash

# Not used as not ready for prime time. Use as reference for the Looker protobuf generator.

openapi-generator generate -g protobuf-schema -o ../src/main/proto2 -i ../../../spec/Looker.4.0.oas.json --package-name looker --additional-properties=identifierNamingConvention=snake_case
