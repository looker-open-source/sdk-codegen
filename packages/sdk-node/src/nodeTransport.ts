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

import nodeCrypto from 'crypto';
import type { Request } from 'request';
import rq from 'request';

import rp from 'request-promise-native';
import type { Readable } from 'readable-stream';
import { PassThrough } from 'readable-stream';
import { StatusCodeError } from 'request-promise-native/errors';
import {
  BaseTransport,
  ResponseMode,
  defaultTimeout,
  responseMode,
  trace,
  LookerAppId,
  agentPrefix,
  safeBase64,
} from '@looker/sdk-rtl';
import type {
  Authenticator,
  HttpMethod,
  ISDKError,
  ITransportSettings,
  SDKResponse,
  Values,
  IRequestHeaders,
  IRawResponse,
  ICryptoHash,
} from '@looker/sdk-rtl';

const utf8 = 'utf8';

const asString = (value: any): string => {
  if (value instanceof Buffer) {
    return Buffer.from(value).toString(utf8);
  }
  if (value instanceof Object) {
    return JSON.stringify(value);
  }
  return value.toString();
};

export class NodeCryptoHash implements ICryptoHash {
  secureRandom(byteCount: number): string {
    // TODO update this to Node 18
    return nodeCrypto.randomBytes(byteCount).toString('hex');
  }

  async sha256Hash(message: string): Promise<string> {
    const hash = nodeCrypto.createHash('sha256');
    hash.update(message);
    return safeBase64(new Uint8Array(hash.digest()));
  }
}

export type RequestOptions = rq.RequiredUriUrl &
  rp.RequestPromiseOptions &
  rq.OptionsWithUrl;

export class NodeTransport extends BaseTransport {
  constructor(protected readonly options: ITransportSettings) {
    super(options);
  }

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    const init: RequestOptions = await this.initRequest(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options
    );
    const req = rp(init).promise();
    let rawResponse: IRawResponse;

    const requestStarted = Date.now();
    let responseCompleted;
    try {
      const res = await req;
      responseCompleted = Date.now();
      const resTyped = res as rq.Response;
      rawResponse = {
        method,
        url: resTyped.url || init.url.toString() || '',
        body: await resTyped.body,
        contentType: String(resTyped.headers['content-type']),
        ok: true,
        statusCode: resTyped.statusCode,
        statusMessage: resTyped.statusMessage,
        headers: res.headers,
        requestStarted,
        responseCompleted,
      };
      // Update OK with response statusCode check
      rawResponse.ok = this.ok(rawResponse);
    } catch (e: any) {
      let statusMessage = `${method} ${path}`;
      let statusCode = 404;
      let contentType = 'text';
      let body;
      responseCompleted = Date.now();
      if (e instanceof StatusCodeError) {
        statusCode = e.statusCode;
        if (e.error instanceof Buffer) {
          body = asString(e.error);
          statusMessage += `: ${statusCode}`;
        } else if (e.error instanceof Object) {
          // Capture error object as body
          body = e.error;
          statusMessage += `: ${e.message}`;
          // Clarify the error message
          body.message = statusMessage;
          contentType = 'application/json';
        }
      } else if (e.error instanceof Buffer) {
        body = asString(e.error);
      } else {
        body = JSON.stringify(e);
        contentType = 'application/json';
      }
      rawResponse = {
        method,
        url: init.url.toString(),
        body,
        contentType,
        ok: false,
        statusCode,
        statusMessage,
        headers: {},
        requestStarted,
        responseCompleted,
      };
    }
    return this.observer ? this.observer(rawResponse) : rawResponse;
  }

  async parseResponse<TSuccess, TError>(res: IRawResponse) {
    const mode = responseMode(res.contentType);
    let response: SDKResponse<TSuccess, TError>;
    let error;
    if (!res.ok) {
      // Raw request had an error. Make sure it's a string before parsing the result
      error = res.body;
      if (typeof error === 'string') {
        try {
          error = JSON.parse(error);
        } catch {
          error = { message: `Request failed: ${error}` };
        }
      }
      response = { ok: false, error };
      return response;
    }
    let result = await res.body;
    if (mode === ResponseMode.string) {
      if (res.contentType.match(/^application\/.*\bjson\b/g)) {
        try {
          if (result instanceof Buffer) {
            result = Buffer.from(result).toString(utf8);
          }
          if (!(result instanceof Object)) {
            result = JSON.parse(result.toString());
          }
        } catch (err) {
          error = err;
        }
      } else if (!error) {
        // Convert to string otherwise
        result = asString(result);
      }
    } else {
      try {
        result = Buffer.from(result ?? '').toString('binary');
      } catch (err) {
        error = err;
      }
    }
    if (!error) {
      response = { ok: true, value: result };
    } else {
      response = { ok: false, error: error as TError };
    }
    return response;
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    try {
      const res = await this.rawRequest(
        method,
        path,
        queryParams,
        body,
        authenticator,
        options
      );
      return await this.parseResponse<TSuccess, TError>(res);
    } catch (e: any) {
      const error: ISDKError = {
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
        type: 'sdk_error',
      };
      return { error, ok: false };
    }
  }

  /**
   * Http method dispatcher from general-purpose request properties
   * @param props
   * @returns {request.Request}
   */
  protected requestor(props: RequestOptions): Request {
    const method = props.method?.toString().toUpperCase() as HttpMethod;
    switch (method) {
      case 'GET':
        return rq.get(props);
      case 'PUT':
        return rq.put(props);
      case 'POST':
        return rq.post(props);
      case 'PATCH':
        return rq.patch(props);
      case 'DELETE':
        return rq.put(props);
      case 'HEAD':
        return rq.head(props);
      default:
        return rq.get(props);
    }
  }

  async stream<TSuccess>(
    callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    const stream = new PassThrough();
    const returnPromise = callback(stream);
    const init = await this.initRequest(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options
    );

    const streamPromise = new Promise<void>((resolve, reject) => {
      trace(`[stream] beginning stream via download url`, init);
      let hasResolved = false;
      const req = this.requestor(init);

      req
        .on('error', (err) => {
          if (hasResolved && (err as any).code === 'ECONNRESET') {
            trace(
              'ignoring ECONNRESET that occurred after streaming finished',
              init
            );
          } else {
            trace('streaming error', err);
            reject(err);
          }
        })
        .on('finish', () => {
          trace(`[stream] streaming via download url finished`, init);
        })
        .on('socket', (socket) => {
          trace(`[stream] setting keepalive on socket`, init);
          socket.setKeepAlive(true);
        })
        .on('abort', () => {
          trace(`[stream] streaming via download url aborted`, init);
        })
        .on('response', () => {
          trace(`[stream] got response from download url`, init);
        })
        .on('close', () => {
          trace(`[stream] request stream closed`, init);
        })
        .pipe(stream)
        .on('error', (err) => {
          trace(`[stream] PassThrough stream error`, err);
          reject(err);
        })
        .on('finish', () => {
          trace(`[stream] PassThrough stream finished`, init);
          resolve();
          hasResolved = true;
        })
        .on('close', () => {
          trace(`[stream] PassThrough stream closed`, init);
        });
    });

    const results = await Promise.all([returnPromise, streamPromise]);
    return results[0];
  }

  /**
   * should the request verify SSL?
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {boolean} true if the request should require full SSL verification
   */
  verifySsl(options?: Partial<ITransportSettings>) {
    if (!options) options = this.options;
    return 'verify_ssl' in options ? options.verify_ssl : true;
  }

  /**
   * Request timeout in seconds
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {number | undefined}
   */
  timeout(options?: Partial<ITransportSettings>): number {
    if (!options) options = this.options;
    if ('timeout' in options && options.timeout) return options.timeout;
    return defaultTimeout;
  }

  private async initRequest(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    options = options ? { ...this.options, ...options } : this.options;
    if (!options.agentTag) {
      options.agentTag = agentPrefix;
    }
    const headers: IRequestHeaders = {
      [LookerAppId]: options.agentTag,
      ...options.headers,
    };

    const requestPath = this.makeUrl(path, options, queryParams);
    let init: RequestOptions = {
      body: body || undefined,
      encoding: null,
      headers: headers,
      json: body && typeof body !== 'string',
      // null = requests are returned as binary so `Content-Type` dictates response format
      method,

      rejectUnauthorized: this.verifySsl(options),

      // If body is a string, pass as is
      resolveWithFullResponse: true,

      timeout: this.timeout(options) * 1000,
      url: requestPath,
    };
    if ('encoding' in options) init.encoding = options.encoding;

    if (authenticator) {
      // Automatic authentication process for the request
      init = await authenticator(init);
    }
    return init;
  }

  // /**
  //  * A streaming helper for the "json" data format. It handles automatically parsing
  //  * the JSON in a streaming fashion. You just need to implement a function that will
  //  * be called for each row.
  //  *
  //  * ```ts
  //  * await request.streamJson((row) => {
  //  *   // This will be called for each row of data
  //  * })
  //  * ```
  //  *
  //  * @returns A promise that will be resolved when streaming is complete.
  //  * @param onRow A function that will be called for each streamed row, with the row as the first argument.
  //  */
  // async streamJson(onRow: (row: { [fieldName: string]: any }) => void) {
  //   return new Promise<void>((resolve, reject) => {
  //     let rows = 0
  //     this.stream(async (readable) => {
  //       oboe(readable)
  //         .node("![*]", this.safeOboe(readable, reject, (row) => {
  //           rows++
  //           onRow(row)
  //         }))
  //         .done(() => {
  //           winston.info(`[streamJson] oboe reports done`, {...this.logInfo, rows})
  //         })
  //     }).then(() => {
  //       winston.info(`[streamJson] complete`, {...this.logInfo, rows})
  //       resolve()
  //     }).catch((error) => {
  //       // This error should not be logged as it could come from an action
  //       // which might decide to include user information in the error message
  //       winston.info(`[streamJson] reported an error`, {...this.logInfo, rows})
  //       reject(error)
  //     })
  //   })
  // }
  //
  // /**
  //  * A streaming helper for the "json_detail" data format. It handles automatically parsing
  //  * the JSON in a streaming fashion. You can implement an `onFields` callback to get
  //  * the field metadata, and an `onRow` callback for each row of data.
  //  *
  //  * ```ts
  //  * await request.streamJsonDetail({
  //  *   onFields: (fields) => {
  //  *     // This will be called when fields are available
  //  *   },
  //  *   onRow: (row) => {
  //  *     // This will be called for each row of data
  //  *   },
  //  * })
  //  * ```
  //  *
  //  * @returns A promise that will be resolved when streaming is complete.
  //  * @param callbacks An object consisting of several callbacks that will be called
  //  * when various parts of the data are parsed.
  //  */
  // async streamJsonDetail(callbacks: {
  //   onRow: (row: JsonDetailRow) => void,
  //   onFields?: (fields: Fieldset) => void,
  //   onRanAt?: (iso8601string: string) => void,
  // }) {
  //   return new Promise<void>((resolve, reject) => {
  //     let rows = 0
  //     this.stream(async (readable) => {
  //       oboe(readable)
  //         .node("data.*", this.safeOboe(readable, reject, (row) => {
  //           rows++
  //           callbacks.onRow(row)
  //         }))
  //         .node("!.fields", this.safeOboe(readable, reject, (fields) => {
  //           if (callbacks.onFields) {
  //             callbacks.onFields(fields)
  //           }
  //         }))
  //         .node("!.ran_at", this.safeOboe(readable, reject, (ranAt) => {
  //           if (callbacks.onRanAt) {
  //             callbacks.onRanAt(ranAt)
  //           }
  //         }))
  //         .done(() => {
  //           winston.info(`[streamJsonDetail] oboe reports done`, {...this.logInfo, rows})
  //         })
  //     }).then(() => {
  //       winston.info(`[streamJsonDetail] complete`, {...this.logInfo, rows})
  //       resolve()
  //     }).catch((error) => {
  //       // This error should not be logged as it could come from an action
  //       // which might decide to include user information in the error message
  //       winston.info(`[streamJsonDetail] reported an error`, {...this.logInfo, rows})
  //       reject(error)
  //     })
  //   })
  // }
}
