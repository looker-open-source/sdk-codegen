/*

 Copyright 2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import * as http from 'http';
import * as https from 'https';
import type { AddressInfo } from 'net';
import * as zlib from 'zlib';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import forge from 'node-forge';
import type { IRequestProps, ITransportSettings } from '@looker/sdk-rtl';
import { NodeTransport } from './nodeTransport';

const generateSelfSignedCert = () => {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 60_000);
  cert.validity.notAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const attrs = [{ name: 'commonName', value: '127.0.0.1' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
      ],
    },
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  return {
    key: forge.pki.privateKeyToPem(keys.privateKey),
    cert: forge.pki.certificateToPem(cert),
  };
};

describe('NodeTransport TLS verification isolation', () => {
  let savedRejectUnauthorized: string | undefined;
  let httpsServer: https.Server;
  let httpServer: http.Server;
  let httpsBaseUrl: string;
  let httpBaseUrl: string;
  let certPem: string;
  let lastRequestHeaders: http.IncomingHttpHeaders = {};
  let lastRequestBody = '';

  beforeAll(async () => {
    const tls = generateSelfSignedCert();
    certPem = tls.cert;

    const handler: http.RequestListener = (req, res) => {
      lastRequestHeaders = req.headers;
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        lastRequestBody = Buffer.concat(chunks).toString('utf8');
        const url = req.url ?? '/';

        if (url === '/ping') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, method: req.method }));
          return;
        }
        if (url === '/echo') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              method: req.method,
              body: lastRequestBody,
              contentLength: req.headers['content-length'],
              authorization: req.headers.authorization ?? null,
            })
          );
          return;
        }
        if (url === '/no-content') {
          res.writeHead(204);
          res.end();
          return;
        }
        if (url === '/empty-gzip') {
          res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Encoding': 'gzip',
          });
          res.end();
          return;
        }
        if (url === '/gzip') {
          const payload = zlib.gzipSync(
            Buffer.from(JSON.stringify({ compressed: 'gzip' }), 'utf8')
          );
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
          });
          res.end(payload);
          return;
        }
        if (url === '/deflate-raw') {
          const payload = zlib.deflateRawSync(
            Buffer.from(JSON.stringify({ compressed: 'deflate-raw' }), 'utf8')
          );
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Encoding': 'deflate',
          });
          res.end(payload);
          return;
        }
        if (url === '/brotli') {
          const payload = zlib.brotliCompressSync(
            Buffer.from(JSON.stringify({ compressed: 'br' }), 'utf8')
          );
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Encoding': 'br',
          });
          res.end(payload);
          return;
        }
        if (url === '/corrupt-gzip') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
          });
          res.end(Buffer.from('not-a-valid-gzip-payload', 'utf8'));
          return;
        }
        if (url === '/redirect-post') {
          res.writeHead(302, { Location: `${httpsBaseUrl}/echo` });
          res.end();
          return;
        }
        if (url === '/redirect-cross-origin') {
          res.writeHead(302, { Location: `${httpBaseUrl}/echo` });
          res.end();
          return;
        }
        if (url === '/stream') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.write('chunk-1:');
          res.end('chunk-2');
          return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      });
    };

    httpsServer = https.createServer(tls, handler);
    httpServer = http.createServer(handler);

    await new Promise<void>(resolve =>
      httpsServer.listen(0, '127.0.0.1', resolve)
    );
    await new Promise<void>(resolve =>
      httpServer.listen(0, '127.0.0.1', resolve)
    );

    const httpsPort = (httpsServer.address() as AddressInfo).port;
    const httpPort = (httpServer.address() as AddressInfo).port;
    httpsBaseUrl = `https://127.0.0.1:${httpsPort}`;
    httpBaseUrl = `http://127.0.0.1:${httpPort}`;
  });

  afterAll(async () => {
    await new Promise<void>(resolve => httpsServer.close(() => resolve()));
    await new Promise<void>(resolve => httpServer.close(() => resolve()));
  });

  beforeEach(() => {
    savedRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    lastRequestHeaders = {};
    lastRequestBody = '';
  });

  afterEach(() => {
    if (savedRejectUnauthorized === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = savedRejectUnauthorized;
    }
  });

  it('allows self-signed certs when verify_ssl is false without disabling TLS globally', async () => {
    const insecureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);
    const secureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: true,
    } as ITransportSettings);

    const insecureRes = await insecureTransport.request<
      { ok: boolean; method: string },
      Error
    >('GET', '/ping');
    expect(insecureRes.ok).toBe(true);
    if (insecureRes.ok) {
      expect(insecureRes.value).toEqual({ ok: true, method: 'GET' });
    }

    // Global env var must remain untouched
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();

    // Another NodeTransport with verify_ssl: true must still reject self-signed certs
    const secureRes = await secureTransport.rawRequest('GET', '/ping');
    expect(secureRes.ok).toBe(false);

    // Unrelated global fetch and https.get in the same process must still reject self-signed certs
    await expect(fetch(`${httpsBaseUrl}/ping`)).rejects.toThrow();
    await expect(
      new Promise((resolve, reject) => {
        const req = https.get(`${httpsBaseUrl}/ping`, resolve);
        req.on('error', reject);
      })
    ).rejects.toThrow(/self[- ]signed certificate/i);
  });

  it('supports per-request verify_ssl overrides in both directions', async () => {
    const secureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: true,
    } as ITransportSettings);
    const insecureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);

    // Override secure transport with verify_ssl: false for a single call
    const overrideInsecure = await secureTransport.request<
      { ok: boolean },
      Error
    >('GET', '/ping', undefined, undefined, undefined, { verify_ssl: false });
    expect(overrideInsecure.ok).toBe(true);
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();

    // Subsequent call on secureTransport without override still enforces TLS
    const defaultSecure = await secureTransport.rawRequest('GET', '/ping');
    expect(defaultSecure.ok).toBe(false);

    // Override insecure transport with verify_ssl: true for a single call
    const overrideSecure = await insecureTransport.rawRequest(
      'GET',
      '/ping',
      undefined,
      undefined,
      undefined,
      { verify_ssl: true }
    );
    expect(overrideSecure.ok).toBe(false);
  });

  it('isolates verify_ssl in stream() including per-request options', async () => {
    const insecureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);
    const secureTransport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: true,
    } as ITransportSettings);

    const streamed = await insecureTransport.stream(
      res => res.text(),
      'GET',
      '/stream'
    );
    expect(streamed).toBe('chunk-1:chunk-2');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();

    await expect(
      secureTransport.stream(res => res.text(), 'GET', '/stream')
    ).rejects.toThrow();

    const streamedOverride = await secureTransport.stream(
      res => res.text(),
      'GET',
      '/stream',
      undefined,
      undefined,
      undefined,
      { verify_ssl: false }
    );
    expect(streamedOverride).toBe('chunk-1:chunk-2');
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();
  });

  it('handles plain http:// URLs when verify_ssl is false', async () => {
    const transport = new NodeTransport({
      base_url: httpBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);

    const res = await transport.request<{ ok: boolean }, Error>('GET', '/ping');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.ok).toBe(true);
    }
  });

  it('handles POST bodies, bodiless POST Content-Length, 204 No Content, and compressed responses', async () => {
    const transport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);

    const postJson = await transport.request<
      { method: string; body: string; contentLength: string },
      Error
    >('POST', '/echo', undefined, { hello: 'world' });
    expect(postJson.ok).toBe(true);
    if (postJson.ok) {
      expect(postJson.value.method).toBe('POST');
      expect(JSON.parse(postJson.value.body)).toEqual({ hello: 'world' });
      expect(Number(postJson.value.contentLength)).toBeGreaterThan(0);
    }

    const emptyPost = await transport.request<
      { method: string; body: string; contentLength: string },
      Error
    >('POST', '/echo');
    expect(emptyPost.ok).toBe(true);
    if (emptyPost.ok) {
      expect(emptyPost.value.method).toBe('POST');
      expect(emptyPost.value.body).toBe('');
      expect(emptyPost.value.contentLength).toBe('0');
    }

    const noContent = await transport.rawRequest('DELETE', '/no-content');
    expect(noContent.ok).toBe(true);
    expect(noContent.statusCode).toBe(204);

    const emptyGzip = await transport.request<string, Error>(
      'GET',
      '/empty-gzip'
    );
    expect(emptyGzip.ok).toBe(true);
    if (emptyGzip.ok) {
      expect(emptyGzip.value).toBe('');
    }

    const gzipRes = await transport.request<{ compressed: string }, Error>(
      'GET',
      '/gzip'
    );
    expect(gzipRes).toEqual({ ok: true, value: { compressed: 'gzip' } });

    const deflateRawRes = await transport.request<
      { compressed: string },
      Error
    >('GET', '/deflate-raw');
    expect(deflateRawRes).toEqual({
      ok: true,
      value: { compressed: 'deflate-raw' },
    });

    const brotliRes = await transport.request<{ compressed: string }, Error>(
      'GET',
      '/brotli'
    );
    expect(brotliRes).toEqual({ ok: true, value: { compressed: 'br' } });
  });

  it('follows redirects and strips Authorization across origins', async () => {
    const transport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);

    const postRedirect = await transport.request<
      { method: string; body: string; authorization: string | null },
      Error
    >(
      'POST',
      '/redirect-post',
      undefined,
      { secret: 1 },
      (props: IRequestProps) => {
        props.headers.Authorization = 'Bearer same-origin-token';
        return props;
      }
    );
    expect(postRedirect.ok).toBe(true);
    if (postRedirect.ok) {
      expect(postRedirect.value.method).toBe('GET');
      expect(postRedirect.value.body).toBe('');
      expect(postRedirect.value.authorization).toBe('Bearer same-origin-token');
    }

    const crossOriginRedirect = await transport.request<
      { method: string; authorization: string | null },
      Error
    >(
      'GET',
      '/redirect-cross-origin',
      undefined,
      undefined,
      (props: IRequestProps) => {
        props.headers.Authorization = 'Bearer cross-origin-token';
        return props;
      }
    );
    expect(crossOriginRedirect.ok).toBe(true);
    if (crossOriginRedirect.ok) {
      expect(crossOriginRedirect.value.method).toBe('GET');
      expect(crossOriginRedirect.value.authorization).toBeNull();
      expect(lastRequestHeaders.authorization).toBeUndefined();
    }
  });

  it('supports a custom https.Agent via transport settings, per-request options, or authenticator', async () => {
    const customAgent = new https.Agent({ ca: certPem });
    try {
      // 1. Configured via constructor ITransportSettings
      const settingsTransport = new NodeTransport({
        base_url: httpsBaseUrl,
        verify_ssl: true,
        agent: customAgent,
      } as unknown as ITransportSettings);
      const settingsRes = await settingsTransport.request<
        { ok: boolean },
        Error
      >('GET', '/ping');
      expect(settingsRes.ok).toBe(true);

      // 2. Configured via per-request options
      const perReqTransport = new NodeTransport({
        base_url: httpsBaseUrl,
        verify_ssl: true,
      } as ITransportSettings);
      const perReqRes = await perReqTransport.request<{ ok: boolean }, Error>(
        'GET',
        '/ping',
        undefined,
        undefined,
        undefined,
        { agent: customAgent }
      );
      expect(perReqRes.ok).toBe(true);

      // 3. Configured via authenticator callback
      const authRes = await perReqTransport.request<{ ok: boolean }, Error>(
        'GET',
        '/ping',
        undefined,
        undefined,
        (props: IRequestProps) => {
          props.agent = customAgent;
          return props;
        }
      );
      expect(authRes.ok).toBe(true);
    } finally {
      customAgent.destroy();
    }
  });

  it('propagates decompression errors on corrupted compressed streams and honors AbortSignal', async () => {
    const transport = new NodeTransport({
      base_url: httpsBaseUrl,
      verify_ssl: false,
    } as ITransportSettings);

    const corruptRes = await transport.request<unknown, Error>(
      'GET',
      '/corrupt-gzip'
    );
    expect(corruptRes.ok).toBe(false);

    await expect(
      transport.stream(res => res.text(), 'GET', '/corrupt-gzip')
    ).rejects.toThrow();

    const controller = new AbortController();
    controller.abort();
    const abortedRes = await transport.rawRequest(
      'GET',
      '/ping',
      undefined,
      undefined,
      undefined,
      { signal: controller.signal }
    );
    expect(abortedRes.ok).toBe(false);
  });
});
