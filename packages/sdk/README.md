# Looker SDK

The Looker SDK for TypeScript/JavaScript works with Node and browser run-times. The SDK provides a convenient way to communicate with a Looker server's APIs.

This package supports using the Looker SDK in the browser. The [@looker/sdk-node](https://www.npmjs.com/package/@looker/sdk-node) package depends on this package (@looker/sdk) and [@looker/sdk-rtl](https://www.npmjs.com/package/@looker/sdk-rtl).

The SDK uses a plug-in architecture for initializing and supports run-time specific transports (like `NodeTransport` and `BrowserTransport`) and different approaches for managing API authentication (like `NodeSession`, `BrowserSession`, `ProxySession`, and `CorsSession`).

Please [report any issues](https://github.com/looker-open-source/sdk-codegen/issues) encountered, and indicate the SDK language in the report.

## Getting started

The Looker Browser SDK can be used in a browser application in 3 steps:

- install
- authenticate
- use

### Install the Looker SDK into your application

Using `yarn`:

```bash
yarn add @looker/sdk @looker/sdk-rtl
```

Using `npm`:

```bash
npm install @looker/sdk @looker/sdk-rtl
```
Some other dependencies may be required for your project to build and run correctly.

### TypeScript SDK packages

The Looker TypeScript SDK has different packages to prevent node dependencies being linked into browser usage of the SDK (the node dependencies are not available in the browser and can cause compilation errors). There are three packages for the Typescript SDK available on npm:

1. `@looker/sdk-rtl` - contains a run time library needed to invoke the Looker API methods. Referencing the `@looker/sdk` as a dependency should automatically pull this package in.
1. `@looker/sdk` - contains the Looker API methods.
1. `@looker/sdk-node` - contains the dependencies needed to run the Looker SDK in a node environment. Do NOT include this package if you are using the Looker SDK in a browser. This SDK is for use with `node` or `ts-node`.

### Authenticate your API calls

All requests to the Looker API server require an access token. For browser implementations, authentication is typically achieved via OAuth as [described in `cors.md`](../../docs/cors.md) or a [Proxy Server](#using-a-proxy-for-authentication).

### Use the SDK in your browser application

Authenticating for the browser takes more setup than authenticating for use with a Node application.

The stand-alone version of the [Looker API Explorer](../api-explorer) uses OAuth and the `BrowserSDK` to get an authentication token for Looker API requests.

- [RunItSDK](../run-it/src/utils/RunItSDK.ts) shows how to override `readConfig()` to get SDK configuration values.

- [RunItSDK tests](../run-it/src/utils/RunItSDK.spec.ts) support debugging the flow of `RunItSDK`.

- The [OAuthScene](../run-it/src/scenes/OAuthScene/OAuthScene.tsx) React component receives the OAuth response from the Looker server and logs the user in to retrieve the API authentication token.

Looker's OAuth support makes it possible to build a Looker SDK application that only requires the browser. If a browser application can use a proxy server instead, or already uses an existing backend server, it may be simpler to [use a proxy for authentication](#using-a-proxy-for-authentication)/

The `looker.ini` configuration file and environment variables are _never_ used in the Browser runtime.

### Developing with multiple API versions

Only API 4.0 is currently available. API 3.1 has been removed in Looker v23.18+.

`LookerBrowserSDK.init40()` and `Looker40SDK()` initialize the API 4.0 implementation of the SDK.

## Customizing HTTP request handling

With the complete removal of the [deprecated request package](https://www.npmjs.com/package/request) the HTTP transport layer has been refactored to have feature parity between Node and the Browser SDK.

The following properties can be specified as part of the `options` parameter, which is the last parameter of every SDK method:
- `timeout` to set a per-request timeout (in seconds)
- `signal` to cancel cancelling requests by passing an `AbortSignal` or `AbortController` signal to an SDK request
- automatically retryable HTTP requests
  - enable with `maxTries` > 1
  - optionally define a `Waitable` callback for custom retry wait period handling

## Streaming with the SDK

The [deprecated NodeJS `request` package](https://www.npmjs.com/package/request) dependency has been removed from all Looker TypeScript packages. This removal prompted a **BREAKING** interface change for the streaming SDK.
The streaming method callback signature changed from `(readable: Readable) => Promise<x>` to `(response: Response) => Promise<x>`. Using `Response` as the parameter to the callback greatly
increases the flexibility of streaming implementations and provides other valuable information like `Content-Type` and other headers to the streaming callback.

For the Browser SDK (`@looker/sdk`), the standard `fetch` function is still used. For the Node SDK (`@looker/sdk-node`), the global [`fetch`](https://nodejs.org/api/globals.html#fetch) function from NodeJS is used, which was marked **stable** in version 22.

This means the Looker Node SDK now requires Node 20 or above.

The streaming version of the SDK methods should be initialized using the same `AuthSession` as the main SDK to reduce authentication thrashing.

Construction of the streaming SDK can use code similar to the following, which is taken from the [downloadTile.ts example](/examples/typescript/downloadTile.ts#L129:L157):

```ts
/**
 * Use the streaming SDK to download a tile's query
 * @param sdk to use
 * @param tile to download
 * @param format to download
 * @returns name of downloaded file (undefined on failure)
 */
const downloadTileAs = async (
  sdk: LookerSDK,
  tile: IDashboardElement,
  format: string
) => {
  const fileName = `${tile.title}.${format}`;

  const writer = createWritableStream(fs.createWriteStream(fileName));
  const request: IRequestRunQuery = {
    result_format: format,
    query_id: tile.query_id!,
    // apply_formatting: true,
    // apply_vis: true
  };
  const sdkStream = new Looker40SDKStream(sdk.authSession);
  await sdkStream.run_query(async (response: Response) => {
    await response.body.pipeTo(writer);
    return 'streamed';
  }, request);

  return fileName;
};
```

## Using a Proxy for authentication

CORS support allows the Looker API to be used directly in the browser application running on a different domain than the Looker server. Because all API endpoints require authentication except for `Login`, a proxy server can be used to retrieve the API authentication token and provide it to the browser session.

`ProxySession` is the SDK class specifically designed to streamline proxy session creation. The source code example below shows how to override the `authenticate` method for use in a CORS request scenario.

- `getProxyToken()` is the call to the proxy server's API that returns the API auth token to use
- the code in the `if (this.isAuthenticated()` branch
  - Sets CORS mode
  - Sets the auth token header
  - Identifies the Looker SDK version for the Looker server

By writing your own `getProxyToken()` visible to this class, any proxied authentication workflow is supported.

```typescript
export class EmbedSession extends ProxySession {
  constructor(public settings: IApiSettings, transport?: ITransport) {
    super(settings, transport);
  }

  async authenticate(props: any) {
    // get the auth token from the proxy server
    const token = await getProxyToken();
    if (token) {
      // Assign the token, which will track its expiration time automatically
      this.activeToken.setToken(token);
    }

    if (this.isAuthenticated()) {
      // Session is authenticated
      // set CORS mode (in this scenario)
      props.mode = 'cors';

      // remove any credentials attribute that may have been set
      // because the BrowserTransport defaults to having `same-origin` for credentials
      delete props['credentials'];

      // replace the headers argument with required values
      // Note: using new Headers() to construct the headers breaks CORS for the Looker API. Don't know why yet
      props.headers = {
        Authorization: `Bearer ${token.access_token}`,
        'x-looker-appid': agentTag,
      };
    }
    return props;
  }
}
```

## More examples

Looker's open source repository of [SDK Examples](https://github.com/looker-open-source/sdk-codegen/tree/main/examples/typescript) has more example scripts and applications that show how to use the various Looker language SDKs.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](https://github.com/looker-open-source/sdk-codegen#securing-your-sdk-credentials).
