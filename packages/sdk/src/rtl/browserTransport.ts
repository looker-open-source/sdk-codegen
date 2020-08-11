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

import { PassThrough, Readable } from 'readable-stream'
import {
  ISDKError,
  SDKResponse,
  ITransportSettings,
  HttpMethod,
  Authenticator,
  trace,
  IRequestProps,
  IRequestHeaders,
  LookerAppId,
  agentPrefix,
  Values,
  IRawResponse,
  responseMode,
  ResponseMode,
  safeBase64,
} from './transport'
import { BaseTransport } from './baseTransport'
import { lookerVersion } from './constants'
import { ICryptoHash } from './cryptoHash'

/** Does this browser have the necessary performance APIs? */
const performs =
  performance &&
  performance.mark !== undefined &&
  performance.measure !== undefined

const startMark = 'A'
const endMark = 'B'

/**
 * Create a performance mark
 * @param name to use as prefix of mark. Use `markName()` to determine the name
 * @param tag tag to use to distinguish mark
 */
const mark = (name: string, tag: string) => {
  if (performs) {
    performance.mark(`${name}-${tag}`)
  }
}

/**
 * Create a unique name for the performance metric of the url based on its start time
 * @param url metric to find
 *
 * Uses the last entry of the matching metric to create the name for the tracker so
 * post processing can use it to merge into the main resource tracker
 *
 */
const markName = (url: string) => {
  if (!performs) return url

  const entries = performance.getEntriesByName(url, 'resource')
  if (entries.length > 0) {
    const last = entries[entries.length - 1]
    return `${url}-${last.startTime}`
  }
  return url
}

/**
 * Mark the start of a performance measure
 * @param name to use as prefix of mark. Use `markName()` to determine the name
 */
const markStart = (name: string) => {
  mark(name, startMark)
}

/**
 * Remove entry if it exists
 * @param name to remove
 * @param type to match
 */
const removePerf = (name: string, type: string) => {
  if (performance.getEntriesByName(name, type).length !== 0) {
    // prevent duplicate measures
    performance.clearMarks(name)
  }
}

/**
 * Mark the end of a performance measure
 * @param url to find starting mark which doesn't have a resource entry yet
 * @param name to use as prefix of mark. Use `markName()` to determine the name
 *
 * Also creates the start/end performance measure
 */
const markEnd = (url: string, name: string) => {
  if (performs) {
    const end = `${name}-${endMark}`
    removePerf(end, 'mark')
    mark(name, endMark)
    let start = `${name}-${startMark}`
    if (performance.getEntriesByName(start, 'mark').length === 0) {
      start = `${url}-${startMark}`
    }
    removePerf(name, 'measure')
    performance.measure(`${name}`, start, end)
  }
}

/**
 * Process the response based on content type
 * @param res response to process
 * @param markName name of mark to track
 */
async function parseResponse(res: IRawResponse, markName: string) {
  if (res.contentType.match(/application\/json/g)) {
    try {
      const result = JSON.parse(await res.body)
      markEnd(res.url, markName)
      return result
    } catch (error) {
      markEnd(res.url, markName)
      return Promise.reject(error)
    }
  } else if (
    res.contentType === 'text' ||
    res.contentType.startsWith('text/')
  ) {
    const result = res.body.toString()
    markEnd(res.url, markName)
    return result
  } else {
    try {
      markEnd(res.url, markName)
      return res.body
    } catch (error) {
      markEnd(res.url, markName)
      return Promise.reject(error)
    }
  }
}

export class BrowserCryptoHash implements ICryptoHash {
  arrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  fromBase64(str: string) {
    return atob(str)
      .split('')
      .map(function(c) {
        return c.charCodeAt(0)
      })
  }

  secureRandom(byteCount: number): string {
    const bytes = new Uint8Array(byteCount)
    window.crypto.getRandomValues(bytes)
    return this.arrayToHex(bytes)
  }

  async sha256Hash(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8)
    return safeBase64(new Uint8Array(hashBuffer))
  }
}

export class BrowserTransport extends BaseTransport {
  constructor(protected readonly options: ITransportSettings) {
    super(options)
  }

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    options = { ...this.options, ...options }
    const requestPath = this.makeUrl(path, options, queryParams)
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      options
    )
    const req = fetch(
      props.url,
      props // Weird package issues with unresolved imports for RequestInit :(
    )

    const res = await req

    // Start tracking the time it takes to convert the response
    markStart(markName(requestPath))
    const contentType = String(res.headers.get('content-type'))
    const mode = responseMode(contentType)
    const responseBody =
      mode === ResponseMode.binary ? await res.blob() : await res.text()
    markEnd(requestPath, markName(requestPath))
    return {
      url: requestPath,
      body: responseBody,
      contentType,
      ok: true,
      statusCode: res.status,
      statusMessage: res.statusText,
    }
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
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
      )
      const parsed = await parseResponse(res, markName(res.url))
      if (this.ok(res)) {
        return { ok: true, value: parsed }
      } else {
        return { error: parsed, ok: false }
      }
    } catch (e) {
      const error: ISDKError = {
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
        type: 'sdk_error',
      }
      return { error, ok: false }
    }
  }

  private async initRequest(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    const agentTag = options?.agentTag || `${agentPrefix} ${lookerVersion}`
    options = options ? { ...this.options, ...options } : this.options
    const headers: IRequestHeaders = { [LookerAppId]: agentTag }
    if (options && options.headers) {
      Object.entries(options.headers).forEach(([key, val]) => {
        headers[key] = val
      })
    }

    // Make sure an empty body is undefined
    if (!body) {
      body = undefined
    } else {
      if (typeof body !== 'string') {
        body = JSON.stringify(body)
        headers['Content-Type'] = 'application/json'
      }
    }
    let props: IRequestProps = {
      body,
      credentials: 'same-origin',
      headers,
      method,
      url: path,
    }

    if (authenticator) {
      // Add authentication information to the request
      props = await authenticator(props)
    }

    return props
  }

  // TODO finish this method
  async stream<TSuccess>(
    callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    options = options ? { ...this.options, ...options } : this.options
    const stream = new PassThrough()
    const returnPromise = callback(stream)
    const requestPath = this.makeUrl(path, options, queryParams)
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      options
    )
    trace(`[stream] attempting to stream via download url`, props)

    return Promise.reject<TSuccess>(
      // Silly error message to prevent linter from complaining about unused variables
      Error(
        `Streaming for${returnPromise ? 'callback' : ''} ${props.method} ${
          props.requestPath
        } is not implemented`
      )
    )

    /*
    TODO complete this for the browser implementation
    const streamPromise = new Promise<void>((resolve, reject) => {
      trace(`[stream] beginning stream via download url`, props)
      reject(Error('Not implemented yet!'))
      // let hasResolved = false
      // const req = this.requestor(props)
      //
      // req
      //   .on("error", (err) => {
      //     if (hasResolved && (err as any).code === "ECONNRESET") {
      //       trace('ignoring ECONNRESET that occurred after streaming finished', props)
      //     } else {
      //       trace('streaming error', err)
      //       reject(err)
      //     }
      //   })
      //   .on("finish", () => {
      //     trace(`[stream] streaming via download url finished`, props)
      //   })
      //   .on("socket", (socket) => {
      //     trace(`[stream] setting keepalive on socket`, props)
      //     socket.setKeepAlive(true)
      //   })
      //   .on("abort", () => {
      //     trace(`[stream] streaming via download url aborted`, props)
      //   })
      //   .on("response", () => {
      //     trace(`[stream] got response from download url`, props)
      //   })
      //   .on("close", () => {
      //     trace(`[stream] request stream closed`, props)
      //   })
      //   .pipe(stream)
      //   .on("error", (err) => {
      //     trace(`[stream] PassThrough stream error`, err)
      //     reject(err)
      //   })
      //   .on("finish", () => {
      //     trace(`[stream] PassThrough stream finished`, props)
      //     resolve()
      //     hasResolved = true
      //   })
      //   .on("close", () => {
      //     trace(`[stream] PassThrough stream closed`, props)
      //   })
    })

    const results = await Promise.all([returnPromise, streamPromise])
    return results[0]
    */
  }
}
