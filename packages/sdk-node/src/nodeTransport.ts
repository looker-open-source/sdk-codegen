/*

 Copyright 2022-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import nodeCrypto from 'crypto';
import type * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { Buffer } from 'buffer';
import { Readable, Transform } from 'stream';
import { WritableStream } from 'node:stream/web';
import * as zlib from 'zlib';

import type {
  Authenticator,
  HttpMethod,
  ICryptoHash,
  IRawRequest,
  IRawResponse,
  IRequestHeaders,
  IRequestProps,
  ISDKError,
  ITransportSettings,
  SDKResponse,
  Values,
} from '@looker/sdk-rtl';
import {
  BaseTransport,
  BrowserTransport,
  ResponseMode,
  canRetry,
  initResponse,
  pauseForRetry,
  responseMode,
  retryError,
  retryWait,
  safeBase64,
  mergeOptions,
  verifySsl,
} from '@looker/sdk-rtl';

const utf8 = 'utf8';
const maxRedirects = 20;
const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);
const nullBodyStatusCodes = new Set([101, 204, 205, 304]);

let insecureHttpsAgent: https.Agent | undefined;

const hasNativeStreamResponse = (): boolean =>
  typeof Response === 'function' &&
  typeof Response.prototype === 'object' &&
  'body' in Response.prototype;

const readStreamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.once('end', () => resolve(Buffer.concat(chunks)));
    stream.once('error', reject);
  });

const createStreamResponse = (
  bodyStream: Readable | null,
  status: number,
  statusText: string,
  headers: Headers,
  url: string
): Response => {
  if (hasNativeStreamResponse()) {
    const response = new Response(
      bodyStream
        ? (Readable.toWeb(bodyStream) as unknown as ReadableStream)
        : null,
      { status, statusText, headers }
    );
    Object.defineProperty(response, 'url', { value: url, configurable: true });
    return response;
  }

  let consumed = false;
  const consumeBuffer = async (): Promise<Buffer> => {
    if (consumed) {
      throw new TypeError('Body has already been consumed.');
    }
    consumed = true;
    if (!bodyStream) {
      return Buffer.alloc(0);
    }
    return readStreamToBuffer(bodyStream);
  };

  let webBody: ReadableStream | null | undefined;
  const fallback = {
    status,
    statusText,
    ok: status >= 200 && status <= 299,
    redirected: false,
    type: 'basic',
    url,
    headers,
    get bodyUsed() {
      return consumed;
    },
    get body() {
      if (!bodyStream) return null;
      if (!webBody) {
        consumed = true;
        webBody = Readable.toWeb(bodyStream) as unknown as ReadableStream;
      }
      return webBody;
    },
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const buf = await consumeBuffer();
      return buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength
      ) as ArrayBuffer;
    },
    blob: async (): Promise<Blob> => {
      const buf = await consumeBuffer();
      const type = headers.get('content-type') ?? '';
      return new Blob([buf], { type });
    },
    text: async (): Promise<string> => {
      const buf = await consumeBuffer();
      return buf.toString(utf8);
    },
    json: async (): Promise<any> => {
      const buf = await consumeBuffer();
      return JSON.parse(buf.toString(utf8));
    },
  };
  return fallback as unknown as Response;
};
const getInsecureHttpsAgent = (): https.Agent => {
  if (!insecureHttpsAgent) {
    insecureHttpsAgent = new https.Agent({
      keepAlive: true,
      scheduling: 'lifo',
      timeout: 5000,
      rejectUnauthorized: false,
    });
  }
  return insecureHttpsAgent;
};

const createLazyDecoder = (encoding: string): Transform | undefined => {
  const enc = encoding.trim().toLowerCase();
  if (enc !== 'gzip' && enc !== 'x-gzip' && enc !== 'deflate' && enc !== 'br') {
    return undefined;
  }
  let decoder: Transform | undefined;
  let decoderError: Error | null = null;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (chunk.length === 0) {
        callback();
        return;
      }
      if (!decoder) {
        if (enc === 'gzip' || enc === 'x-gzip') {
          decoder = zlib.createGunzip();
        } else if (enc === 'br') {
          decoder = zlib.createBrotliDecompress();
        } else {
          const isZlibHeader =
            chunk.length >= 2 &&
            (chunk[0] & 0x0f) === 0x08 &&
            chunk[0] >> 4 <= 7 &&
            ((chunk[0] << 8) | chunk[1]) % 31 === 0;
          decoder = isZlibHeader
            ? zlib.createInflate()
            : zlib.createInflateRaw();
        }
        decoder.on('data', (d: Buffer) => this.push(d));
        decoder.on('error', err => {
          decoderError = err;
        });
      }
      decoder.write(chunk, err => {
        callback(err ?? decoderError);
      });
    },
    flush(callback) {
      if (!decoder) {
        callback();
        return;
      }
      if (decoderError) {
        callback(decoderError);
        return;
      }
      decoder.once('error', err => callback(err));
      decoder.once('end', () => callback());
      decoder.end();
    },
  });
};

const normalizeRequestBody = async (
  body: any
): Promise<{ buffer?: Buffer; stream?: Readable }> => {
  if (body === undefined || body === null) {
    return {};
  }
  if (typeof body === 'string') {
    return { buffer: Buffer.from(body, utf8) };
  }
  if (body instanceof URLSearchParams) {
    return { buffer: Buffer.from(body.toString(), utf8) };
  }
  if (Buffer.isBuffer(body)) {
    return { buffer: body };
  }
  if (ArrayBuffer.isView(body)) {
    return {
      buffer: Buffer.from(body.buffer, body.byteOffset, body.byteLength),
    };
  }
  if (body instanceof ArrayBuffer) {
    return { buffer: Buffer.from(body) };
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return { buffer: Buffer.from(await body.arrayBuffer()) };
  }
  if (body instanceof Readable) {
    return { stream: body };
  }
  if (typeof body?.getReader === 'function') {
    return { stream: Readable.fromWeb(body) };
  }
  return { buffer: Buffer.from(String(body), utf8) };
};

const fetchWithAgent = async (
  initialUrl: string,
  init: IRequestProps
): Promise<Response> => {
  const signal: AbortSignal | undefined = init.signal;
  if (signal?.aborted) {
    throw (
      signal.reason ??
      new DOMException('The operation was aborted.', 'AbortError')
    );
  }

  let currentUrl = initialUrl;
  let currentMethod = (init.method || 'GET').toUpperCase();
  const reqHeaders = new Headers((init.headers ?? {}) as HeadersInit);
  const normalizedBody = await normalizeRequestBody(init.body);
  let currentBodyBuffer = normalizedBody.buffer;
  let currentBodyStream = normalizedBody.stream;
  const redirectMode: RequestRedirect = init.redirect ?? 'follow';

  for (let redirectCount = 0; ; redirectCount++) {
    const parsedUrl = new URL(currentUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const isHttp = parsedUrl.protocol === 'http:';
    if (!isHttps && !isHttp) {
      throw new TypeError(`Unsupported protocol: ${parsedUrl.protocol}`);
    }

    const headerRecord: Record<string, string> = {};
    reqHeaders.forEach((value, key) => {
      headerRecord[key] = value;
    });
    if (!reqHeaders.has('accept-encoding')) {
      headerRecord['accept-encoding'] = 'br, gzip, deflate';
    }
    if (
      !reqHeaders.has('content-length') &&
      !reqHeaders.has('transfer-encoding')
    ) {
      if (currentBodyBuffer !== undefined) {
        headerRecord['content-length'] = String(currentBodyBuffer.byteLength);
      } else if (
        !currentBodyStream &&
        (currentMethod === 'POST' ||
          currentMethod === 'PUT' ||
          currentMethod === 'PATCH')
      ) {
        headerRecord['content-length'] = '0';
      }
    }

    const agentProtocol = (init.agent as any)?.protocol;
    const hopAgent = init.agent
      ? !agentProtocol || agentProtocol === parsedUrl.protocol
        ? init.agent
        : undefined
      : undefined;

    const requestFn = isHttps ? https.request : http.request;
    const res = await new Promise<http.IncomingMessage>((resolve, reject) => {
      const req = requestFn(
        parsedUrl,
        {
          method: currentMethod,
          headers: headerRecord,
          agent: hopAgent,
          signal,
        },
        resolve
      );
      req.once('error', reject);
      if (currentBodyStream) {
        const streamToSend = currentBodyStream;
        currentBodyStream = undefined;
        streamToSend.once('error', err => req.destroy(err));
        streamToSend.pipe(req);
      } else {
        if (currentBodyBuffer !== undefined) {
          req.write(currentBodyBuffer);
        }
        req.end();
      }
    });

    const statusCode = res.statusCode ?? 200;
    const location = res.headers.location;
    if (
      redirectStatusCodes.has(statusCode) &&
      typeof location === 'string' &&
      location.length > 0
    ) {
      if (redirectMode === 'error') {
        res.resume();
        throw new TypeError(
          'URI requested responds with a redirect, redirect mode is set to error'
        );
      }
      if (redirectMode === 'follow') {
        if (redirectCount >= maxRedirects) {
          res.resume();
          throw new TypeError(`Redirect count exceeded (${maxRedirects})`);
        }
        res.resume();
        const nextUrl = new URL(location, parsedUrl);
        if (nextUrl.origin !== parsedUrl.origin) {
          reqHeaders.delete('authorization');
          reqHeaders.delete('proxy-authorization');
          reqHeaders.delete('cookie');
        }
        reqHeaders.delete('host');
        if (
          (statusCode === 303 && currentMethod !== 'HEAD') ||
          ((statusCode === 301 || statusCode === 302) &&
            currentMethod === 'POST')
        ) {
          currentMethod = 'GET';
          currentBodyBuffer = undefined;
          currentBodyStream = undefined;
          reqHeaders.delete('content-length');
          reqHeaders.delete('content-type');
          reqHeaders.delete('content-encoding');
          reqHeaders.delete('content-language');
          reqHeaders.delete('content-location');
        }
        currentUrl = nextUrl.toString();
        continue;
      }
    }

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(res.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        if (key.toLowerCase() === 'set-cookie') {
          value.forEach(cookie => responseHeaders.append(key, cookie));
        } else {
          responseHeaders.set(key, value.join(', '));
        }
      } else {
        responseHeaders.set(key, value);
      }
    }

    const isNullBody =
      currentMethod === 'HEAD' || nullBodyStatusCodes.has(statusCode);
    if (isNullBody) {
      res.resume();
      return createStreamResponse(
        null,
        statusCode,
        res.statusMessage ?? '',
        responseHeaders,
        currentUrl
      );
    }

    let bodyStream: Readable = res;
    if (signal) {
      const onAbort = () => {
        res.destroy(
          signal.reason ??
            new DOMException('The operation was aborted.', 'AbortError')
        );
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort, { once: true });
        res.once('close', () => signal.removeEventListener('abort', onAbort));
      }
    }

    const contentEncoding = res.headers['content-encoding'];
    if (typeof contentEncoding === 'string' && contentEncoding.trim() !== '') {
      const codings = contentEncoding
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
        .reverse();
      const decoders = codings.map(createLazyDecoder);
      if (decoders.length > 0 && decoders.every(Boolean)) {
        for (const decoder of decoders as Transform[]) {
          const prev = bodyStream;
          prev.once('error', err => decoder.destroy(err));
          bodyStream = prev.pipe(decoder);
        }
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');
      }
    }

    return createStreamResponse(
      bodyStream,
      statusCode,
      res.statusMessage ?? '',
      responseHeaders,
      currentUrl
    );
  }
};

const executeFetch = (url: string, props: IRequestProps): Promise<Response> => {
  if (props.agent) {
    return fetchWithAgent(url, props);
  }
  return fetch(url, props as RequestInit);
};

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
    return nodeCrypto.randomBytes(byteCount).toString('hex');
  }

  async sha256Hash(message: string): Promise<string> {
    const hash = nodeCrypto.createHash('sha256');
    hash.update(message);
    return safeBase64(new Uint8Array(hash.digest()));
  }
}

export class NodeTransport extends BaseTransport {
  constructor(protected readonly options: ITransportSettings) {
    super(options);
  }

  /**
   * Standard retry where requests will be retried based on configured
   * transport settings. If retry is not enabled, no requests will be retried
   *
   * This default retry pattern implements the "full" jitter algorithm
   * documented in https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
   *
   * @param request options for HTTP request
   */
  async retry(request: IRawRequest): Promise<IRawResponse> {
    const { method, path, queryParams, body, authenticator } = request;
    const newOpts = mergeOptions(this.options, request.options ?? {});
    const requestPath = this.makeUrl(path, newOpts, queryParams);
    const waiter = newOpts.waitHandler || retryWait;
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      newOpts
    );
    let response = initResponse(method, requestPath);
    // TODO assign to MaxTries constant when retry is opt-out instead of opt-in
    const maxTries = newOpts.maxTries ?? 1; // MaxTries
    let attempt = 1;
    while (attempt <= maxTries) {
      const req = executeFetch(props.url, props);

      const requestStarted = Date.now();
      try {
        const res = await req;
        const responseCompleted = Date.now();

        // Start tracking the time it takes to convert the response
        const started = BrowserTransport.markStart(
          BrowserTransport.markName(requestPath)
        );
        const contentType = String(res.headers.get('content-type'));
        const mode = responseMode(contentType);
        const responseBody =
          mode === ResponseMode.binary ? res.blob() : res.text();
        if (!('fromRequest' in newOpts)) {
          // Request will markEnd, so don't mark the end here
          BrowserTransport.markEnd(requestPath, started);
        }
        const headers: IRequestHeaders = {};
        res.headers.forEach((value, key) => (headers[key] = value));
        response = {
          method,
          url: requestPath,
          body: responseBody,
          contentType,
          statusCode: res.status,
          statusMessage: res.statusText,
          startMark: started,
          headers,
          requestStarted,
          responseCompleted,
          ok: true,
        };
        response.ok = this.ok(response);
        if (canRetry(response.statusCode) && attempt < maxTries) {
          const result = await pauseForRetry(
            request,
            response,
            attempt,
            waiter
          );
          if (result.response === 'cancel') {
            if (result.reason) {
              response.statusMessage = result.reason;
            }
            break;
          } else if (result.response === 'error') {
            if (result.reason) {
              response.statusMessage = result.reason;
            }
            return retryError(response);
          }
        } else {
          break;
        }
        attempt++;
      } catch (e: any) {
        response.ok = false;
        response.body = e;
        response.statusCode = e.statusCode;
        response.statusMessage = e.message;
        return response;
      }
    }
    return response;
  }

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    const response = await this.retry({
      method,
      path,
      queryParams,
      body,
      authenticator,
      options,
    });
    return this.observer ? this.observer(response) : response;
  }

  async parseResponse<TSuccess, TError>(res: IRawResponse) {
    const mode = responseMode(res.contentType);
    let response: SDKResponse<TSuccess, TError>;
    let error;
    if (!res.ok) {
      // Raw request had an error. Make sure it's a string before parsing the result
      error = await res.body;
      if (typeof error === 'string') {
        try {
          error = JSON.parse(error);
        } catch {
          error = { message: `Request failed: ${error}` };
        }
      }
      response = { ok: false, error, statusCode: res.statusCode };
      return response;
    }
    let result = await res.body;
    if (mode === ResponseMode.string) {
      if (res.contentType.match(/^application\/.*\bjson\b/g)) {
        try {
          if (result instanceof Buffer) {
            result = Buffer.from(result).toString(); // (utf8);
          }
          if (!(result instanceof Object)) {
            result = JSON.parse(result.toString());
          }
        } catch (err: any) {
          error = err;
        }
      } else if (!error) {
        // Convert to string otherwise
        result = asString(result);
      }
    } else {
      try {
        const body = await result;
        if (typeof body === 'string') {
          result = body;
        } else {
          // must be a blob?
          const bytes = await body.arrayBuffer();
          result = Buffer.from(bytes ?? '').toString('binary');
        }
      } catch (err: any) {
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

  async stream<TSuccess>(
    callback: (response: Response) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    const newOpts = mergeOptions(this.options, options ?? {});
    const requestPath = this.makeUrl(path, newOpts, queryParams);
    const init = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      newOpts
    );

    const response: Response = await executeFetch(requestPath, init);
    return await callback(response);
  }

  protected override async initRequest(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    const mergedOptions = mergeOptions(this.options, options ?? {});
    const props = await super.initRequest(
      method,
      path,
      body,
      authenticator,
      mergedOptions
    );
    // don't default to same-origin for NodeJS
    props.credentials = undefined;

    if (!verifySsl(mergedOptions) && !props.agent) {
      props.agent = getInsecureHttpsAgent();
    }

    return props;
  }
}

/**
 * Turn a NodeJS WriteStream into a WritableStream for compatibility with browser standards
 * @param writer usually created by fs.createWriteStream()
 */
export const createWritableStream = (
  writer: ReturnType<typeof fs.createWriteStream>
) => {
  return new WritableStream({
    write: (chunk: any) => {
      writer.write(chunk);
    },
  });
};
