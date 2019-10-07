/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {
  addQueryParams,
  agentTag,
  Authenticator,
  defaultTimeout,
  HttpMethod,
  ISDKError, isUtf8,
  ITransport,
  ITransportSettings,
  responseMode,
  ResponseMode,
  SDKResponse,
  StatusCode,
} from './transport'

import rq, { Response, Request } from 'request'
import rp from 'request-promise-native'
import { PassThrough, Readable } from 'readable-stream'

type RequestOptions = rq.RequiredUriUrl & rp.RequestPromiseOptions

/**
 * Set to `true` to follow streaming process
  */
const tracing = false

function trace(entry: string, info?: any) {
  if (tracing) {
    console.debug(entry)
    if (info) {
      console.debug(info)
    }
  }
}

export class NodeTransport implements ITransport {
  apiPath = ''

  constructor(private readonly options: ITransportSettings) {
    this.options = options
    this.apiPath = `${options.base_url}/api/${options.api_version}`
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    let init = await this.initRequest(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options,
    )
    const req = rp(init).promise()

    try {
      const res = await req
      const resTyped = res as rq.Response
      const contentType = String(resTyped.headers['content-type'])
      // @ts-ignore have to resolve missing properties of response promise
      const parsed = await parseResponse(contentType, res)
      if (this.ok(resTyped)) {
        return {ok: true, value: parsed}
      } else {
        return {ok: false, error: parsed}
      }
    } catch (e) {
      const error: ISDKError = {
        type: 'sdk_error',
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
      }
      return {ok: false, error}
    }
  }

  /**
   * Http method dispatcher from general-purpose options
   * @param {RequestOptions} options
   * @returns {request.Request}
   */
  requestor(options: RequestOptions): Request {
    const method = options.method!.toString().toUpperCase() as HttpMethod
    switch (method) {
      case 'GET': return rq.get(options)
      case 'PUT': return rq.put(options)
      case 'POST': return rq.post(options)
      case 'PATCH': return rq.patch(options)
      case 'DELETE': return rq.put(options)
      case 'HEAD': return rq.head(options)
      default: return rq.get(options)
    }
  }

  /** `stream` creates and manages a stream of the request data
   *
   * ```ts
   * let prom = await request.stream(async (readable) => {
   *    return myService.uploadStreaming(readable).promise()
   * })
   * ```
   *
   * Streaming generally occurs only if Looker sends the data in a streaming fashion via a push url,
   * however it will also wrap non-streaming attachment data so that actions only need a single implementation.
   *
   * @returns A promise returning the same value as the callback's return value.
   * This promise will resolve after the stream has completed and the callback's promise
   * has also resolved.
   * @param callback A function will be called with a Node.js or Browser `Readable` object.
   * The readable object represents the streaming data.
   */
  async stream<TSuccess>(
    callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  )
    : Promise<TSuccess> {

    const stream = new PassThrough()
    const returnPromise = callback(stream)
    let init = await this.initRequest(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options,
    )

    const streamPromise = new Promise<void>((resolve, reject) => {
      trace(`[stream] beginning stream via download url`, init)
      let hasResolved = false
      const req = this.requestor(init)

      req
        .on("error", (err) => {
          if (hasResolved && (err as any).code === "ECONNRESET") {
            trace('ignoring ECONNRESET that occurred after streaming finished', init)
          } else {
            trace('streaming error', err)
            reject(err)
          }
        })
        .on("finish", () => {
          trace(`[stream] streaming via download url finished`, init)
        })
        .on("socket", (socket) => {
          trace(`[stream] setting keepalive on socket`, init)
          socket.setKeepAlive(true)
        })
        .on("abort", () => {
          trace(`[stream] streaming via download url aborted`, init)
        })
        .on("response", () => {
          trace(`[stream] got response from download url`, init)
        })
        .on("close", () => {
          trace(`[stream] request stream closed`, init)
        })
        .pipe(stream)
        .on("error", (err) => {
          trace(`[stream] PassThrough stream error`, err)
          reject(err)
        })
        .on("finish", () => {
          trace(`[stream] PassThrough stream finished`, init)
          resolve()
          hasResolved = true
        })
        .on("close", () => {
          trace(`[stream] PassThrough stream closed`, init)
        })
    })

    const results = await Promise.all([returnPromise, streamPromise])
    return results[0]
  }

  /**
   * should the request verify SSL?
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {boolean} true if the request should require full SSL verification
   */
  verifySsl(options?: Partial<ITransportSettings>) {
    if (!options) options = this.options
    return 'verify_ssl' in options ? options.verify_ssl : true
  }

  /**
   * Request timeout in seconds
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {number | undefined}
   */
  timeout(options?: Partial<ITransportSettings>): number {
    if (!options) options = this.options
    if ('timeout' in options && options.timeout) return options.timeout
    return defaultTimeout
  }

  // async stream<TError>(
  //   method: HttpMethod,
  //   path: string,
  //   queryParams?: any,
  //   body?: any,
  //   authenticator?: Authenticator
  // ): Promise<SDKResponse<rq.Response, TError>> {
  //   let init = await this.initRequest(method, path, queryParams, body, authenticator)
  //   let req: rq.Request = rq.defaults(init)
  // }

  private async initRequest(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ) {
    options = options ? {...this.options, ...options} : this.options
    let headers: any = {
      'User-Agent': agentTag,
      ...options.headers,
    }
    if (body) {
      headers = {
        'User-Agent': agentTag,
        ...options.headers,
      }
    }
    // is this an API-versioned call?
    let requestPath =
      (authenticator ? this.apiPath : options.base_url) +
      addQueryParams(path, queryParams)
    let init: RequestOptions = {
      url: requestPath,
      headers: headers,
      body: body ? body : undefined,
      json: !!body,
      resolveWithFullResponse: true,
      rejectUnauthorized: this.verifySsl(options),
      timeout: this.timeout(options) * 1000,
      encoding: null, // null = requests are returned as binary so `Content-Type` dictates response format
      method,
    }
    if ('encoding' in options) init.encoding = options.encoding

    if (authenticator) {
      // Automatic authentication process for the request
      init = await authenticator(init)
    }
    return init
  }

  private ok(res: rq.Response) {
    return (
      res.statusCode >= StatusCode.OK && res.statusCode <= StatusCode.IMUsed
    )
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

async function parseResponse(contentType: string, res: Response) {
  const mode = responseMode(contentType)
  let result = await res.body
  if (mode === ResponseMode.string) {
    if (!isUtf8(contentType)) {
      // always convert to UTF-8 from whatever it was
      result = Buffer.from(result.toString(), 'utf8')
    }
    if (contentType.match(/^application\/.*\bjson\b/g)) {
      try {
        result = result instanceof Object ? result : JSON.parse(result)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    }
    return result.toString()
  } else {
    try {
      // TODO Return ArrayBuffer from buffer without any character encoding?
      // See https://stackoverflow.com/a/31394257/74137 for more info
      // return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength)
      return result.toString()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
