# Looker SDK Runtime Library

The Looker TypeScript/JavaScript SDK depends on the runtime code in this package.

The source code in this package is almost all completely generic REST request/response processing code.

The `@looker/sdk` and `@looker/sdk-node` packages are updated with every Looker release. This package has a much longer update/release cycle.

## HTTP request behavior options

The Browser and Node transport layers can be configured with both SDK-wide settings and request-specific optional properties that modify the
behavior of a request. These properties are documented in [`ITransportSettings`](src/transport.ts).

When initializing the SDK, these values configure the default behavior for every HTTP request.
The behavior of any specific request can be modified by passing different values in the `options` property of the request method.
Some of these request configuration properties are further explained below.

### timeout

If not explicitly configured, the HTTP request `timeout` period is 120 seconds, which is supported in both Node and Browser transport layers via an
[`AbortSignal.timeout()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) instance created for each HTTP request.

To override the timeout period for a long-running HTTP request, pass a `timeout` override value in the `options` parameter for a request.

```ts
const xp = new BrowserTransport({ maxTries: 1 } as ITransportSettings);
const response = await xp.request(
  'GET',
  'https://my.slow.page',
  undefined,
  undefined,
  undefined,
  {
    timeout: 15 * 60, // 15 minute timeout
  }
);
```

### signal

The `signal` property is an optional [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) argument to pass to a transport's request method. This property
can be used to cancel a request via programmatic or UI control. The following example is adapted from [browserTransport.spec.ts](src/browserTransport.spec.ts):

```ts
// times out request in 250 ms via AbortSignal "cancellation"
const xp = new BrowserTransport({ maxTries: 1 } as ITransportSettings);
const signal = AbortSignal.timeout(250);
await expect(
  xp.request(
    'GET',
    'https://timeout.in?ms=2000',
    undefined,
    undefined,
    undefined,
    {
      signal,
    }
  )
).rejects.toThrowError('The operation was aborted.');
```

### maxTries

To enable automatic retries on request methods, set `maxTries` to a number > 1.

If `maxTries` is > 1 and the HTTP response is a `202`, `429`, or `503`, an [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
will be used until a success response is received or `maxTries` is exceeded.

The waiting period before the retry will use the number of seconds provided in a [`Retry-After header`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) if found.

**NOTE**: Automatic retry on `202` varies from the suggestion made in Microsoft's [long-running operations](https://github.com/microsoft/api-guidelines/blob/vNext/graph/patterns/long-running-operations.md)
design pattern, where `202` is not considered a retryable response.

### waitHandler

The `waitHandler` property is a [`Waitable`](src/transport.ts) callback that can be used to provide custom messaging and handling of the waiting period between automatic retries. This currently has
an alpha status, meaning it is subject to change or removal without notice.

```ts
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
```

### verify_ssl

Setting `verify_ssl` to `false` will disable SSL certificate verification. **THIS IS NOT RECOMMENDED** and should only be used in development scenarios where self-signed certificates are used locally.
The default value for`verify_ssl` is `true`.
