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
  ISDKError,
  SDKResponse,
  ITransportSettings,
  HttpMethod, Authenticator, trace,
  IRequestProps,
  IRequestHeaders, LookerAppId, agentPrefix,
} from './transport'
import { PassThrough, Readable } from 'readable-stream'
import { BaseTransport } from './baseTransport'
import { lookerVersion } from './constants'

export class BrowserTransport extends BaseTransport {

  constructor(protected readonly options: ITransportSettings) {
    super(options)
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
    agentTag: string = `${agentPrefix} ${lookerVersion}`
  ): Promise<SDKResponse<TSuccess, TError>> {
    options = { ... this.options, ...options}
    const requestPath = this.makeUrl(path, options, queryParams, authenticator)
    const props = await this.initRequest(agentTag, method, requestPath, body, authenticator, options)
    const req = fetch(
      props.url,
      // @ts-ignore
      props, // Weird package issues with unresolved imports for RequestInit :(
    )

    try {
      const res = await req
      const contentType = String(res.headers.get('content-type'))
      const parsed = await parseResponse(contentType, res)
      if (res.ok) {
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

  private async initRequest(
    agentTag: string,
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ) {
    options = options ? {...this.options, ...options} : this.options
    let headers: IRequestHeaders = {[LookerAppId]: agentTag }
    if (options && options.headers) {
      Object.keys(options.headers).forEach(key => {
        headers[key] = options!.headers![key]
      })
    }

    let props: IRequestProps = {
      url: path,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      headers: headers,
      credentials: 'same-origin',
      method,
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
    options?: Partial<ITransportSettings>,
    agentTag: string = `${agentPrefix} ${lookerVersion}`
  )
    : Promise<TSuccess> {

    options = options ? {...this.options, ...options} : this.options
    const stream = new PassThrough()
    const requestPath = this.makeUrl(path, options, queryParams, authenticator)
    const returnPromise = callback(stream)
    let props = await this.initRequest(
      agentTag,
      method,
      requestPath,
      body,
      authenticator,
      options,
    )

    // @ts-ignore resolve not being used for now
    const streamPromise = new Promise<void>((resolve, reject) => {
      trace(`[stream] beginning stream via download url`, props)
      reject('Not implemented yet!')
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
  }

}

async function parseResponse(contentType: string, res: Response) {
  if (contentType.match(/application\/json/g)) {
    try {
      return await res.json()
    } catch (error) {
      return Promise.reject(error)
    }
  } else if (contentType === 'text' || contentType.startsWith('text/')) {
    return res.text()
  } else {
    try {
      return await res.blob()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
