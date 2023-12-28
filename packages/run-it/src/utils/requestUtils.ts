/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import type { IAPIMethods, IRawResponse } from '@looker/sdk-rtl';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import type { IApiModel, IMethod, IType } from '@looker/sdk-codegen';
import {
  ArrayType,
  DelimArrayType,
  EnumType,
  HashType,
  IntrinsicType,
  trimInputs,
} from '@looker/sdk-codegen';
import { getEnvAdaptor } from '@looker/extension-utils';

import type { RunItHttpMethod, RunItInput, RunItValues } from '../RunIt';
import { RunItFormKey } from '../components';

/** Hook to set a URL somewhere else in APIX */
export type RunItSetter = (value: any) => any;

/**
 * A "no-op" function
 * @param value passed through
 */
export const runItNoSet: RunItSetter = (value: any) => value;

/**
 * Replaces {foo} with vars[foo] in provided path
 * @param path with templatized param names
 * @param vars Collection of path params
 * @returns Path with param names replaced with values
 */
const macro = (path: string, vars: RunItValues) =>
  path.replace(/{(\w+)}/g, (_, b) => vars[b]);

/**
 * Construct a full request path including path params
 * @param path A request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @returns a full request path
 */
export const pathify = (path: string, pathParams?: RunItValues): string => {
  let result = path;
  if (pathParams && path.includes('{')) {
    result = macro(path, pathParams);
  }
  return result;
};

/**
 * Prepares the inputs for use with the SDK and other RunIt components
 * @param inputs An array describing RunIt form inputs
 * @param requestContent Current request parameters
 */
export const prepareInputs = (
  inputs: RunItInput[],
  requestContent: RunItValues
) => {
  const result = cloneDeep(requestContent);
  for (const input of inputs) {
    const name = input.name;
    if (input.location === 'body') {
      try {
        let parsed;
        if (name in requestContent) {
          const value = requestContent[name];
          /** The value is not a string when the user has not interacted with this param and prepareInputs has been
           * called (e.g. if user navigates to the Code tab).
           */
          parsed = typeof value === 'string' ? JSON.parse(value) : value;
        } else {
          /** This scenario occurs when RunIt is about to be mounted for a new method */
          parsed = input.type;
        }
        result[name] = parsed;
      } catch (e) {
        /** Treat as x-www-form-urlencoded */
        result[name] = requestContent[name];
      }
    }
  }
  return result;
};

/**
 * Load and clear any saved form values from the session
 * @param configurator storage service
 */
export const formValues = async () => {
  const adaptor = getEnvAdaptor();
  const formValue = await adaptor.localStorageGetItem(RunItFormKey);
  const result = formValue ? JSON.parse(formValue) : {};
  adaptor.localStorageRemoveItem(RunItFormKey);
  return result;
};

/**
 * Initializes the request content object from local storage or input definitions, in that order
 * @param configurator storage service
 * @param inputs
 * @param requestContent the current request content
 */
export const initRequestContent = (
  inputs: RunItInput[],
  requestContent = {}
) => {
  // TODO: Temporarily disabling request form state persistence until RunIt is using redux
  // let content = await formValues()
  let content = {};
  if (isEmpty(content)) {
    content = prepareInputs(inputs, requestContent);
  }
  return content;
};

/**
 * Takes all form input values and categorizes them based on their request location
 * @param inputs RunIt form inputs
 * @param requestContent Form input values
 * @param keepBody true to keep body as is. false trims body values (default)
 * @returns path, query and body param objects
 */
export const createRequestParams = (
  inputs: RunItInput[],
  requestContent: RunItValues,
  keepBody = false
) => {
  const pathParams = {};
  const queryParams = {};
  const prepped = prepareInputs(inputs, requestContent);
  const trimmed = trimInputs(prepped, keepBody);
  let body;
  for (const input of inputs) {
    const name = input.name;
    switch (input.location) {
      case 'path':
        pathParams[name] = trimmed[name];
        break;
      case 'query':
        queryParams[name] = trimmed[name];
        break;
      case 'body':
        body = trimmed[name];
        break;
      default:
        throw new Error(`Invalid input location: '${input.location}'`);
    }
  }
  return [pathParams, queryParams, body];
};

/**
 * Makes an http request using the SDK browser transport rawRequest method
 * @param sdk functional SDK that supports rawRequest via its transport
 * @param basePath base path for the URL. For standalone this includes the specKey. Empty for extension.
 * @param httpMethod Request operation
 * @param endpoint Request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @param queryParams Collection of query params
 * @param body Collection of body params
 */
export const runRequest = async (
  sdk: IAPIMethods,
  basePath: string,
  httpMethod: RunItHttpMethod,
  endpoint: string,
  pathParams: RunItValues,
  queryParams: RunItValues,
  body: any
): Promise<IRawResponse> => {
  if (!sdk.authSession.isAuthenticated()) {
    await sdk.ok(sdk.authSession.login());
  }
  const url = `${basePath}${pathify(endpoint, pathParams)}`;
  const requestStarted = Date.now();
  const raw = await sdk.authSession.transport.rawRequest(
    httpMethod,
    url,
    queryParams,
    body,
    (props) => sdk.authSession.authenticate(props)
  );
  const responseCompleted = Date.now();
  // populate timing info if it's not already provided by the transport
  if (!raw.requestStarted) raw.requestStarted = requestStarted;
  if (!raw.responseCompleted) raw.responseCompleted = responseCompleted;
  return raw;
};

/**
 * Return a default value for a given type name
 * @param type A type name
 */
const getTypeDefault = (type: string) => {
  // TODO: use potential equivalent from sdk-codegen, confirm formats
  switch (type) {
    case 'boolean':
      return false;
    case 'int64':
    case 'integer':
      return 0;
    case 'float':
    case 'double':
      return 0.0;
    case 'hostname':
    case 'ipv4':
    case 'ipv6':
    case 'uuid':
    case 'uri':
    case 'string':
    case 'email':
      return '';
    case 'string[]':
      return [];
    case 'object':
      return {};
    case 'datetime':
      return '';
    default:
      return '';
  }
};

/**
 * Given a type object reduce it to its writeable intrinsic and/or custom type properties and their default values
 * @param spec Api spec
 * @param type A type object
 */
const createSampleBody = (spec: IApiModel, type: IType) => {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const getSampleValue = (type: IType) => {
    if (type instanceof IntrinsicType) return getTypeDefault(type.name);
    if (type instanceof DelimArrayType)
      return getTypeDefault(type.elementType.name);
    if (type instanceof EnumType) return '';
    if (type instanceof ArrayType)
      return type.customType
        ? [recurse(spec.types[type.customType])]
        : getTypeDefault(type.name);
    if (type instanceof HashType)
      return type.customType ? recurse(spec.types[type.customType]) : {};

    return recurse(type);
  };
  /* eslint-enable @typescript-eslint/no-use-before-define */

  const recurse = (type: IType) => {
    const sampleBody: RunItValues = {};
    for (const prop of type.writeable) {
      const sampleValue = getSampleValue(prop.type);
      if (sampleValue !== undefined) {
        sampleBody[prop.name] = sampleValue;
      }
    }
    return sampleBody;
  };
  return recurse(type);
};

/**
 * Convert model type to an editable type
 * @param spec API model for building input editor
 * @param type to convert
 */
const editType = (spec: IApiModel, type: IType) => {
  if (type instanceof IntrinsicType) return type.name;
  // TODO create a DelimArray editing component as part of the complex type editor
  if (type instanceof DelimArrayType) return 'string';
  return createSampleBody(spec, type);
};

/**
 * Given an SDK method create and return an array of inputs for the run-it form
 * @param spec Api spec
 * @param method A method object
 */
export const createInputs = (spec: IApiModel, method: IMethod): RunItInput[] =>
  method.allParams.map((param) => ({
    name: param.name,
    location: param.location,
    type: editType(spec, param.type),
    required: param.required,
    description: param.description,
  }));
