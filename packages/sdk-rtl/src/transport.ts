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

import type { Agent } from 'https';
import {
  matchCharsetUtf8,
  matchModeBinary,
  matchModeString,
} from './constants';
import { DelimArray } from './delimArray';
import { LookerSDKError } from './lookerSDKError';
import type { IAuthSession } from './authSession';
import { sleep } from './sleep';

export const agentPrefix = 'TS-SDK';
export const LookerAppId = 'x-looker-appid';

/** default maximum number of retries to attempt */
export const MaxTries = 3;

/** Set to `true` to turn on tracing wherever it may be referenced in the sdk */
const tracing = false;

/**
 * trivial tracing function that should be replaced with a log plugin
 * @param message description for trace
 * @param info any additional information to produce for output
 */
export function trace(message: string, info?: any) {
  if (tracing) {
    // eslint-disable-next-line no-console
    console.debug(message);
    if (info) {
      // eslint-disable-next-line no-console
      console.debug({ info });
    }
  }
}

/**
 * is this status code retryable?
 *
 * @returns true if statusCode is 202, 429, or 503
 * @param statusCode HTTP status code
 *
 */
export function canRetry(statusCode: number) {
  return (
    statusCode === StatusCode.Accepted ||
    statusCode === StatusCode.TooManyRequests ||
    statusCode === StatusCode.ServiceUnavailable
  );
}

/** ResponseMode for an HTTP request */
export enum ResponseMode {
  'binary', // this is a binary response
  'string', // this is a "string" response
  'unknown', // unrecognized response type
}

/**
 * MIME patterns for string content types
 * @type {RegExp}
 */
export const contentPatternString = new RegExp(matchModeString, 'i');

/**
 * MIME patterns for "binary" content types
 * @type {RegExp}
 */
export const contentPatternBinary = new RegExp(matchModeBinary, 'i');

/**
 * MIME pattern for UTF8 charset attribute
 * @type {RegExp}
 */
export const charsetUtf8Pattern = new RegExp(matchCharsetUtf8, 'i');

/**
 * Default request timeout
 * @type {number} default request timeout is 120 seconds, or two minutes
 */
export const defaultTimeout = 120;

/** Recognized HTTP methods */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'TRACE'
  | 'HEAD';

/**
 * HTTP status codes
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status for reference
 * TODO is there a platform-agnostic list of these that can be used instead of this static declaration?
 */
export enum StatusCode {
  OK = 200,
  Created,
  Accepted,
  NonAuthoritative,
  NoContent,
  ResetContent,
  PartialContent,
  MultiStatus,
  MultiStatusDav,
  IMUsed = 226,
  MultipleChoice = 300,
  MovedPermanently,
  Found,
  SeeOther,
  NotModified,
  UseProxy,
  UnusedRedirect,
  TemporaryRedirect,
  PermanentRedirect,
  BadRequest = 400,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  ProxyAuthRequired,
  RequestTimeout,
  Conflict,
  Gone,
  LengthRequired,
  PreconditionFailed,
  PayloadTooLarge,
  UriTooLong,
  UnsupportedMediaType,
  RequestedRangeNotSatisfiable,
  ExpectationFailed,
  ImATeapot,
  MisdirectedRequest = 421,
  UnprocessableEntity,
  Locked,
  FailedDependency,
  TooEarly,
  UpgradeRequired,
  PreconditionRequired = 428,
  TooManyRequests,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,
  InternalServerError = 500,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
  HttpVersionNotSupported,
  VariantAlsoNegotiates,
  InsufficientStorage,
  LoopDetected,
  NotExtended = 510,
  NetworkAuthRequired,
}

/** Property bag for submitting an HTTP request */
export interface IRawRequest {
  /** HTTP request method */
  method: HttpMethod;
  /** HTTP Request path */
  path: string;
  /** optional query parameters collection */
  queryParams?: Values;
  /** optional request body */
  body?: any;
  /** optional API authenticator callback */
  authenticator?: Authenticator;
  /** optional transport settings overrides */
  options?: Partial<ITransportSettings>;
}

/** Untyped basic HTTP response type for "raw" HTTP requests */
export interface IRawResponse {
  /** Http method of the request */
  method: HttpMethod;
  /** ok is `true` if the response is successful, `false` otherwise */
  ok: boolean;
  /** HTTP request url */
  url: string;
  /** HTTP response code */
  statusCode: number;
  /** HTTP response status message text */
  statusMessage: string;
  /** MIME type of the response from the HTTP response header */
  contentType: string;
  /** The body of the HTTP response, without any additional processing */
  body: any;
  /** Optional performance tracking starting mark name */
  startMark?: string;
  /** Response headers */
  headers: IRequestHeaders;
  /** Request start time */
  requestStarted: number;
  /** Completion time for request */
  responseCompleted: number;
}

/** IRawResponse observer function type */
export type RawObserver = (raw: IRawResponse) => IRawResponse;

/** A successful SDK call. */
export interface ISDKSuccessResponse<T> {
  /** Whether the SDK call was successful. */
  ok: true;
  /** The object returned by the SDK call. */
  value: T;
}

/** An errant SDK call. */
export interface ISDKErrorResponse<T> {
  /** Whether the SDK call was successful. */
  ok: false;
  /** The error object returned by the SDK call. */
  error: T;
}

/** An error representing an issue in the SDK, like a network or parsing error. */
export interface ISDKError {
  type: 'sdk_error';
  message: string;
}

export type SDKResponse<TSuccess, TError> =
  | ISDKSuccessResponse<TSuccess>
  | ISDKErrorResponse<TError | ISDKError>;

/** Keyed string hash */
export interface IRequestHeaders {
  [key: string]: string;
}

/**
 * Generic http request property collection
 * TODO: Trim this down to what is required
 */
export interface IRequestProps {
  [key: string]: any;
  /** full url for request, including any query params */
  url: string;

  /** body of request. optional */
  body?: any;
  /** headers for request. optional */
  headers: IRequestHeaders;
  /** Http method for request. required. */
  method: HttpMethod;
  /** Redirect processing for request. optional */
  redirect?: any;
  /** Credentials to use */
  credentials?: 'include' | 'omit' | 'same-origin' | undefined;

  /** http.Agent instance, allows custom proxy, certificate etc. */
  agent?: Agent;
  /** support gzip/deflate content encoding. false to disable */
  compress?: boolean;
  /** maximum redirect count. 0 to not follow redirect */
  follow?: number;
  /** maximum response body size in bytes */
  size?: number;
  /** req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies) */
  timeout?: number;
}

/** General purpose authentication callback */
export type Authenticator = (props: any) => any;

/** Alpha: Properties for an async Waitable retry handler */
export interface IWait {
  /** HTTP request that responded with a retry code */
  request: IRawRequest;
  /** HTTP response that is a retry */
  response: IRawResponse;
  /** Attempt number for the retry */
  attempt: number;
  /** Time in milliseconds to wait before retrying */
  waitMS: number;
}

/** Alpha: Response from a Waitable function */
export interface IWaitResponse {
  /** cancel, retry, or error are the allowed responses for the retryable waiter */
  response: 'cancel' | 'retry' | 'error';
  /** Optional reason for the response */
  reason?: string;
}

/** Alpha: Waitable function override for retrying an HTTP request */
export type Waitable = (waiting: IWait) => Promise<IWaitResponse>;

/** Interface for API transport values */
export interface ITransportSettings {
  [key: string]: any;
  /** base URL of API REST web service */
  base_url: string;
  /** standard headers to provide in all transport requests */
  headers?: IRequestHeaders;
  /** whether to verify ssl certs or not. Defaults to true */
  verify_ssl: boolean;
  /** request timeout in seconds. Default to 30 */
  timeout: number;
  /** encoding override */
  encoding?: string | null;
  /** agent tag to use for the SDK requests */
  agentTag: string;
  /** maximum number of times for a retry response */
  maxTries?: number;
  /** override for awaiting retry requests */
  waitHandler?: Waitable;
  /** abort controller signal customization */
  signal?: AbortSignal;
}

/** Transport plug-in interface */
export interface ITransport {
  /** Observer lambda to process raw responses */
  observer: RawObserver | undefined;

  /**
   * default retryable HTTP request. If maxTries > 1 in the `options`
   * properties for the SDK, this is where HTTP requests will be retried.
   */
  retry(request: IRawRequest): Promise<IRawResponse>;

  /**
   * HTTP request function for atomic, fully downloaded raw HTTP responses
   *
   * Note: This method returns the result of the HTTP request without any error handling
   *
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns typed response of `TSuccess`, or `TError` result
   */
  rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse>;

  /**
   * HTTP request function for atomic, fully downloaded responses
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns typed response of `TSuccess`, or `TError` result
   */
  request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /**
   * Processes the raw response, converting it into an SDKResponse
   * @param raw response result
   */
  parseResponse<TSuccess, TError>(
    raw: IRawResponse
  ): Promise<SDKResponse<TSuccess, TError>>;

  /**
   * HTTP request function for a streamable response
   * @param callback that receives the stream response and pipes it somewhere
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns `T` upon success
   * @throws `ISDKErrorResponse` on failure
   */
  stream<T>(
    callback: (response: Response) => Promise<T>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<T>;
}

export interface IAPIMethods {
  authSession: IAuthSession;
  sdkVersion: string;
  apiPath: string;
  apiVersion: string;

  /** A helper method for simplifying error handling of SDK responses.
   *
   * Pass in a promise returned by any SDK method, and it will return a promise
   * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
   * information in the error case, but allows you to route all the error cases
   * into a single promise rejection.
   *
   * The promise will have an `Error` rejection reason with a string `message`.
   * If the server error contains a `message` field, it will be provided, otherwise a
   * generic message will occur.
   *
   * ```ts
   * const sdk = LookerSDK({...})
   * let look
   * try {
   *    look = await sdk.ok(sdk.create_look({...}))
   *    // do something with look
   * }
   * catch(e) {
   *    // handle error case
   * }
   * ```
   */
  ok<TSuccess, TError>(
    promise: Promise<SDKResponse<TSuccess, TError>>
  ): Promise<TSuccess>;

  /**
   * Determine whether the url should be an API path, relative from base_url, or is already fully specified override
   * @param path Request path
   * @param options Transport settings
   * @param authenticator optional callback
   * @returns the fully specified request path including any query string parameters
   */
  makePath(
    path: string,
    options: Partial<ITransportSettings>,
    authenticator?: Authenticator
  ): string;

  /**
   *
   * A helper method to add authentication to an API request for deserialization
   *
   * @param method type of HTTP method
   * @param path API endpoint path
   * @param queryParams Optional query params collection for request
   * @param body Optional body for request
   * @param options Optional overrides like timeout and verify_ssl
   */
  authRequest<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /**
   * A helper method to add authentication to an API request for streaming
   * @param callback
   * @param method HTTP method
   * @param path HTTP request path
   * @param queryParams query string parameters
   * @param body of the request
   * @param options Optional overrides like timeout and verify_ssl
   * @returns {Promise<T>}
   */
  authStream<T>(
    callback: (response: Response) => Promise<T>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<T>;

  /** Make a GET request */
  get<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Make a HEAD request */
  head<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Make a DELETE request */
  delete<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Make a POST request */
  post<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Make a PUT request */
  put<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Make a PATCH request */
  patch<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;
}

/**
 * Is the content type binary or "string"?
 * @param contentType MIME content type description
 * @returns {ResponseMode.binary | ResponseMode.string}
 */
export function responseMode(contentType: string) {
  if (contentType.match(contentPatternString)) {
    return ResponseMode.string;
  }
  if (contentType.match(contentPatternBinary)) {
    return ResponseMode.binary;
  }
  return ResponseMode.unknown;
}

/**
 * Does this content type have a UTF-8 charset?
 * @param contentType
 * @returns match if it exists
 */
export function isUtf8(contentType: string) {
  return contentType.match(/;.*\bcharset\b=\butf-8\b/i);
}

/** Used for name/value pair collections like for QueryParams */
export type Values = { [key: string]: any } | null | undefined;

/**
 * Encode parameter if not already encoded
 *
 * Note: this includes recognition of Date, DelimArray, and default objects for special handling
 *
 * @param value value of parameter
 * @returns URI encoded value
 */
export function encodeParam(value: any) {
  if (value instanceof Date) {
    value = value.toISOString();
  } else if (value instanceof DelimArray) {
    value = value.toString();
  }
  // check for object type to prevent "[object Object]" as the value.toString()
  let encoded =
    typeof value === 'object' ? JSON.stringify(value) : value.toString();

  // decodeURIComponent throws URIError if there is a % character
  // without it being part of an encoded
  try {
    const decoded = decodeURIComponent(value);
    if (value === decoded) {
      encoded = encodeURIComponent(value);
    }
  } catch (e) {
    if (e instanceof URIError) {
      encoded = encodeURIComponent(value);
    } else {
      throw e;
    }
  }
  return encoded;
}

/**
 * Converts `Values` to query string parameter format
 * @param values Name/value collection to encode
 * @returns {string} query string parameter formatted values. Both `false` and `null` are included. Only `undefined` are omitted.
 */
export function encodeParams(values?: Values) {
  if (!values) return '';

  const keys = Object.keys(values);
  return keys
    .filter(k => values[k] !== undefined) // `null` and `false` will both be passed
    .map(k => k + '=' + encodeParam(values[k]))
    .join('&');
}

/**
 * constructs the path argument including any optional query parameters
 * @param path the base path of the request
 * @param obj optional collection of query parameters to encode and append to the path
 */
export function addQueryParams(path: string, obj?: Values) {
  if (!obj) {
    return path;
  }
  const qp = encodeParams(obj);
  return `${path}${qp ? '?' + qp : ''}`;
}

const utf8 = 'utf-8';

/**
 * Convert this value to a string representation however we can do it
 * @param val
 */
function bufferString(val: any) {
  let result = 'Unknown error';
  try {
    const decoder = new TextDecoder(utf8);
    result = decoder.decode(val);
  } catch (e: any) {
    // Supremely ugly hack. If we get here, we must be in Node (or IE 11, but who cares about that?)
    // Node requires an import from `util` for TextDecoder to be found BUT it "just has" Buffer unless WebPack messes us up
    try {
      if (val instanceof Buffer) {
        result = Buffer.from(val).toString(utf8);
      } else {
        result = JSON.stringify(val);
      }
    } catch (err: any) {
      // The fallback logic here will at least give us some information about the error being thrown
      result = JSON.stringify(val);
    }
  }
  return result;
}

/**
 * SDK error handler
 * @param response any kind of error
 * @returns a new `Error` object with the failure message
 */
export function sdkError(response: any) {
  if (typeof response === 'string') {
    return new LookerSDKError(response);
  }
  if ('error' in response) {
    const error = response.error;
    if (typeof error === 'string') {
      return new LookerSDKError(error);
    }
    // Try to get most specific error first
    if ('error' in error) {
      const result = bufferString(error.error);
      return new LookerSDKError(result);
    }
    if ('message' in error) {
      return new LookerSDKError(response.error.message.toString(), {
        errors: error.errors,
        documentation_url: error.documentation_url,
      });
    }
    if ('statusMessage' in error) {
      return new LookerSDKError(error.statusMessage);
    }
    const result = bufferString(error);
    return new LookerSDKError(result);
  }
  if ('message' in response) {
    return new LookerSDKError(response.message);
  }
  const error = JSON.stringify(response);
  return new LookerSDKError(`Unknown error with SDK method ${error}`);
}

/** A helper method for simplifying error handling of SDK responses.
 *
 * Pass in a promise returned by any SDK method, and it will return a promise
 * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
 * information in the error case, but allows you to route all the error cases
 * into a single promise rejection.
 *
 * The promise will have an `Error` rejection reason with a string `message`.
 * If the server error contains a `message` field, it will be provided, otherwise a
 * generic message will occur.
 *
 * ```ts
 * const sdk = LookerSDK({...})
 * let look
 * try {
 *    look = await sdkOk(sdk.create_look({...}))
 *    // do something with look
 * }
 * catch(e) {
 *    // handle error case
 * }
 * ```
 */
export async function sdkOk<TSuccess, TError>(
  promise: Promise<SDKResponse<TSuccess, TError>>
) {
  const result = await promise;
  if (result.ok) {
    return result.value;
  } else {
    throw sdkError(result);
  }
}

/**
 * Converts a byte array to a "URL safe" base64 string
 * @param u8 byte array to convert
 */
export function safeBase64(u8: Uint8Array) {
  const rawBase64 = btoa(String.fromCharCode(...u8));
  return rawBase64.replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Type predicate. Asserts that a given object is error-like.
 * @param error a value of unknown type
 * @return boolean true if the error has a `message` key of type string.
 */
export function isErrorLike<T>(error: T): error is T & { message: string } {
  if (typeof error !== 'object') return false;
  if (!error) return false;
  if (!Object.prototype.hasOwnProperty.call(error, 'message')) return false;
  if (typeof (error as unknown as { message: unknown }).message !== 'string')
    return false;
  return true;
}

/**
 * Calculate complete delay for exponential backoff/retry with jitter
 * @param attempt count of attempts
 * @param baseDelayMs minimum delay, based on `Retry-After` header
 * @param maxDelayMs maximum delay to allow
 * @param jitterFactor multiplication factor for jitter value
 */
export function jittery(
  attempt: number,
  baseDelayMs = 1000,
  maxDelayMs = 10000,
  jitterFactor = 0.5
): number {
  // Exponential Backoff: Double the delay with each retry
  let exponentialDelay = baseDelayMs * Math.pow(2, attempt);

  // Cap the delay to prevent excessive wait times
  exponentialDelay = Math.min(exponentialDelay, maxDelayMs);

  // Apply Jitter: Introduce randomness to avoid retry collisions
  const jitter = Math.random() * jitterFactor * exponentialDelay;
  const delayWithJitter = exponentialDelay + jitter;

  return delayWithJitter;
}

/**
 * Default retry waiting function. Called after jitter period is calculated
 * @param wait parameters for request/response/attempt and wait time
 */
export async function retryWait(wait: IWait): Promise<IWaitResponse> {
  await sleep(wait.waitMS);
  return { response: 'retry', reason: `waited ${wait.waitMS} ms` };
}

/**
 * Calculate the jitter time and call the waiter
 * @param rawRequest request that had a retry. `options.maxTries` is available here.
 * @param rawResponse retry response
 * @param attempt count of attempts made.
 * @param waiter function to perform waiting process
 */
export async function pauseForRetry(
  rawRequest: IRawRequest,
  rawResponse: IRawResponse,
  attempt: number,
  waiter: Waitable = retryWait
) {
  // calculate minimum delay in MS
  const retryAfter = rawResponse.headers['Retry-After'];
  const after = (retryAfter ? Number(retryAfter) : 1.0) * 1000;
  // randomize the retry
  const jitter = jittery(attempt, after);
  const response = await waiter({
    request: rawRequest,
    response: rawResponse,
    attempt,
    waitMS: jitter,
  });
  return response;
}

/**
 * Merge base settings with custom settings, ensuring no header overrides are lost
 * @param base settings
 * @param custom settings
 */
export const mergeOptions = (
  base: Partial<ITransportSettings>,
  custom: Partial<ITransportSettings>
): Partial<ITransportSettings> => {
  const headers = { ...base.headers, ...custom.headers } ?? {};
  const result = { ...base, ...custom, ...{ headers } };
  return result;
};

/**
 * Create a default "no reply" response object for retry loops
 * @param method Http method for initialization
 * @param requestPath Http path for request to initialize
 */
export function initResponse(
  method: HttpMethod,
  requestPath: string
): IRawResponse {
  return {
    method,
    url: requestPath,
    body: 'no reply at all',
    contentType: 'text/plain',
    ok: false,
    statusCode: 404,
    statusMessage: 'Not found',
    headers: {},
    requestStarted: 0,
    responseCompleted: 0,
  };
}

/**
 * Modify and return response object indicating retry waiting had an error
 * @param response to modify
 */
export function retryError(response: IRawResponse): IRawResponse {
  // retry wait function decided on 'error' so throw an error equivalent
  response.statusCode = StatusCode.RequestTimeout;
  response.ok = false;
  if (!response.statusMessage) {
    response.statusMessage = 'Retry waiting exited with an error condition';
  }
  return response;
}

/**
 * should the request verify SSL?
 * @param options Defaults to the instance options values
 * @returns true (the default) if the request should require full SSL verification
 */
export function verifySsl(options?: Partial<ITransportSettings>) {
  return options && 'verify_ssl' in options ? options.verify_ssl : true;
}

/**
 * Get the HTTP request timeout, in seconds
 *
 * The configured timeout value must be > 0 to be used
 *
 * @param options Defaults to `defaultTimeout`
 */
export function sdkTimeout(options?: Partial<ITransportSettings>): number {
  if (options && 'timeout' in options && options.timeout && options.timeout > 0)
    return options.timeout;
  return defaultTimeout;
}
