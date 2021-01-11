/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import { CodeGen } from './codeGen'
import {
  IMethod,
  IParameter,
  IProperty,
  IType,
  titleCase,
  camelCase,
} from './sdkModels'

// eslint-disable @typescript-eslint/no-unused-vars

/**
 * Pseudocde generator
 */
export class GrpcProxyGen extends CodeGen {
  codePath = './proto/grpc_proxy/src/main/java/com/google/looker/server'
  packagePath = ''
  sdkPath = 'sdk'
  itself = ''
  fileExtension = '.java'
  commentStr = '// '
  nullStr = 'null'
  transport = 'transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'
  codeQuote = '"'
  enumDelimiter = ',\n'

  indentStr = '  '
  endTypeStr = '\n}'
  needsRequestTypes = false
  willItStream = true

  private readonly defaultApi = '4.0'

  isDefaultApi() {
    return this.apiVersion === this.defaultApi
  }

  supportsMultiApi() {
    return false
  }

  sdkFileName(baseFileName: string) {
    if (baseFileName === 'streams') {
      return this.fileName('sdk/LookerStreamingServiceImpl')
    } else if (baseFileName === 'models') {
      return this.fileName('sdk/LookerModels')
    } else {
      return this.fileName('sdk/LookerServiceImpl')
    }
  }

  /**
   * Grpc Proxy Server generator
   *
   * @param {string} indent indentation for code
   * @param {IMethod} method for signature
   * @returns {string} prototype declaration of method
   */
  methodSignature(indent: string, method: IMethod): string {
    indent = ''
    const params = method.allParams
    const args = params.map((p) => p.name)
    return `${indent}${method.operationId}(${args.join(', ')}): ${
      method.primaryResponse.type.name
    }`
  }

  construct(_indent: string, _type: IType): string {
    return ''
  }

  declareMethod(_indent: string, _method: IMethod): string {
    const titleMethodName = titleCase(_method.operationId)
    const camelMethodName = camelCase(_method.operationId)
    return `${this.formatJavaDoc(_method.description)}
  @Override
  public void ${camelMethodName}(${titleMethodName}Request request, StreamObserver<${titleMethodName}Response> responseObserver) {
    try {
      String inputJson = JsonFormat
          .printer()
          .preservingProtoFieldNames()
          .print(request);
      LookerClientResponse lookerResponse = lookerClient.${_method.httpMethod.toLowerCase()}("${
      _method.endpoint
    }", inputJson);
      Status lookerStatus = lookerResponse.getStatus();
      if (lookerStatus != null) {
        responseObserver.onError(lookerStatus.asRuntimeException());
      } else {
        ${titleMethodName}Response.Builder responseBuilder = ${titleMethodName}Response.newBuilder();
        String outputJson = lookerResponse.getJsonResponse();
        if (outputJson != null) {
          JsonFormat
          .parser()
          .ignoringUnknownFields()
          .merge(outputJson, responseBuilder);
        }
        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
      }
    } catch (InvalidProtocolBufferException e) {
      LOGGER.error("invalid protobuf data", e);
      responseObserver.onError(Status.INVALID_ARGUMENT.asRuntimeException());
    }
  }
    `
  }

  declareStreamer(_indent: string, _method: IMethod): string {
    const titleMethodName = titleCase(_method.operationId)
    const camelMethodName = camelCase(_method.operationId)
    const returnCanStream = _method.returnType?.type.name.endsWith('[]')
    const streamResponse = _method.returnType?.type.name.endsWith('[]')
      ? 'Stream'
      : ''
    const onNext = returnCanStream
      ? `responseBuilder.getResultList().forEach(entry -> {
          ${titleMethodName}StreamResponse.Builder responseBuilder2 = ${titleMethodName}StreamResponse.newBuilder();
          responseBuilder2.setResult(entry);
          responseObserver.onNext(responseBuilder2.build());
        });`
      : `responseObserver.onNext(responseBuilder.build());`
    return `${this.formatJavaDoc(_method.description)}
    @Override
    public void ${camelMethodName}(${titleMethodName}Request request, StreamObserver<${titleMethodName}${streamResponse}Response> responseObserver) {
    try {
      String inputJson = JsonFormat
        .printer()
        .preservingProtoFieldNames()
        .print(request);
      LookerClientResponse lookerResponse = lookerClient.${_method.httpMethod.toLowerCase()}("${
      _method.endpoint
    }", inputJson);
      Status lookerStatus = lookerResponse.getStatus();
      if (lookerStatus != null) {
        responseObserver.onError(lookerStatus.asRuntimeException());
      } else {
        ${titleMethodName}Response.Builder responseBuilder = ${titleMethodName}Response.newBuilder();
        String outputJson = lookerResponse.getJsonResponse();
        if (outputJson != null) {
          JsonFormat
            .parser()
            .ignoringUnknownFields()
            .merge(outputJson, responseBuilder);
        }
        ${onNext}
        responseObserver.onCompleted();
      }
    } catch (InvalidProtocolBufferException e) {
      LOGGER.error("invalid protobuf data", e);
      responseObserver.onError(Status.INVALID_ARGUMENT.asRuntimeException());
    }
  }
    `
  }

  declareParameter(
    _indent: string,
    _method: IMethod,
    _param: IParameter
  ): string {
    return ''
  }

  declareProperty(_indent: string, _property: IProperty): string {
    return ''
  }

  encodePathParams(_indent: string, _method: IMethod): string {
    return ''
  }

  methodsEpilogue(_indent: string): string {
    return '}'
  }

  methodsPrologue(_indent: string): string {
    return this.servicesPrologue('LookerService')
  }

  streamsPrologue(_indent: string): string {
    return this.servicesPrologue('LookerStreamingService')
  }

  modelsEpilogue(_indent: string): string {
    return '}'
  }

  modelsPrologue(_indent: string): string {
    return `
package com.google.looker.server.sdk;

// DELETE THIS FILE - NOT REQUIRED

public class LookerModels {
    `
  }

  beginRegion(_: string, description: string): string {
    return `  //#region ${description}`
  }

  endRegion(_: string, description: string): string {
    return `  //#endregion ${description}`
  }

  declareType() {
    return ''
  }

  summary(_indent: string, _text: string | undefined): string {
    return ''
  }

  typeSignature(_indent: string, _type: IType): string {
    return ''
  }

  private servicesPrologue(serviceName: string) {
    return `
package com.google.looker.server.sdk;

import com.google.looker.grpc.services.*;
import com.google.looker.grpc.services.${serviceName}Grpc.${serviceName}ImplBase;
import com.google.looker.server.rtl.LookerClient;
import com.google.looker.server.rtl.LookerClientResponse;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ${serviceName}Impl extends ${serviceName}ImplBase {

  final private static Logger LOGGER = LoggerFactory.getLogger(${serviceName}Impl.class);

  final private LookerClient lookerClient;

  public ${serviceName}Impl() {
    lookerClient = new LookerClient("${this.apiVersion}");
  }

    `
  }

  private formatJavaDoc(comments: string) {
    if (comments.trim().length === 0) {
      return ''
    } else {
      const lines = comments.split('\n').map((part) => `   * ${part}\n`)
      lines.unshift('  /**\n')
      lines.push('   */')
      return lines.join('')
    }
  }
}
