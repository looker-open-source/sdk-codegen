#!/bin/bash
cd ../../..
yarn gen Protobuf
if [ -d "proto/grpc_proxy/src/main/proto/sdk/4.0" ]; then
    rmdir proto/grpc_proxy/src/main/proto/sdk/4.0
fi
yarn gen GrpcProxy
if [ -d "proto/grpc_proxy/src/main/java/com/google/looker/server/sdk/4.0" ]; then
    rmdir proto/grpc_proxy/src/main/java/com/google/looker/server/sdk/4.0
fi
rm proto/grpc_proxy/src/main/java/com/google/looker/server/sdk/LookerModels.java
