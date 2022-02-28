#!/bin/bash
cd ../../..
yarn sdk Protobuf
rmdir proto/grpc_proxy/src/main/proto/sdk/4.0
yarn sdk GrpcProxy
rmdir proto/grpc_proxy/src/main/java/com/google/looker/server/sdk/4.0
rm proto/grpc_proxy/src/main/java/com/google/looker/server/sdk/LookerModels.java
