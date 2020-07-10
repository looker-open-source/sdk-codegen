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
} from './transport'
import { BaseTransport } from './baseTransport'
import { lookerVersion } from './constants'
import { ICryptoHash } from './cryptoHash'

async function parseResponse(res: IRawResponse) {
  if (res.contentType.match(/application\/json/g)) {
    try {
      return JSON.parse(await res.body)
    } catch (error) {
      return Promise.reject(error)
    }
  } else if (
    res.contentType === 'text' ||
    res.contentType.startsWith('text/')
  ) {
    return res.body.toString()
  } else {
    try {
      return res.body
    } catch (error) {
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

  secureRandom(byteCount: number): string {
    const bytes = new Uint8Array(byteCount)
    window.crypto.getRandomValues(bytes)
    return this.arrayToHex(bytes)
  }

  async sha256Hash(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8)
    return this.arrayToHex(new Uint8Array(hashBuffer))
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
    const contentType = String(res.headers.get('content-type'))
    const mode = responseMode(contentType)
    return {
      body: mode === ResponseMode.binary ? await res.blob() : await res.text(),
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
      const parsed = await parseResponse(res)
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
      Object.keys(options.headers).forEach((key) => {
        headers[key] = options!.headers![key]
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
