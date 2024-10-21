# Looker SDK for Node

The Looker SDK for TypeScript/JavaScript works with Node and browser run-times. The SDK provides a convenient way to communicate with a Looker server's APIs.

This package is specifically for using the Looker TypeScript SDK with Node. It depends on the [@looker/sdk](https://www.npmjs.com/package/@looker/sdk) package and [@looker/sdk-rtl](https://www.npmjs.com/package/@looker/sdk-rtl).

The SDK uses a plug-in architecture (also known as dependency injection) for initializing that supports run-time specific transports (like `NodeTransport` and `BrowserTransport`) and different approaches for managing API authentication (like `NodeSession`, `BrowserSession`, `ProxySession`, and `OauthSession`).

Please [report any issues](https://github.com/looker-open-source/sdk-codegen/issues) encountered, and indicate the SDK language in the report.

## Getting started

The Looker SDK can be used in a node application in 3 steps:

- install
- configure
- use

### Install the Looker SDK into your node application

Using `yarn`:

```bash
yarn add @looker/sdk @looker/sdk-rtl @looker/sdk-node
```

Using `npm`:

```bash
npm install @looker/sdk @looker/sdk-rtl @looker/sdk-node
```

**Note**: If you are only intending to use the SDK in a browser, omit `@looker/sdk-node`.

Some other dependencies may be required for your project to build and run correctly.

### TypeScript SDK packages

The Looker TypeScript SDK has different packages to prevent node dependencies being linked into browser usage of the SDK (the node dependencies are not available in the browser and can cause compilation errors). There are three packages for the Typescript SDK available on npm:

1. `@looker/sdk-rtl` - contains a run time library needed to invoke the Looker API methods. Referencing the `@looker/sdk` as a dependency should automatically pull this package in.
2. `@looker/sdk` - contains the Looker API methods.
3. `@looker/sdk-node` - contains the dependencies needed to run the Looker SDK in a node environment. Do NOT include this package if you are using the Looker SDK in a browser. You MUST include this package if you are using `node` or `ts-node`.

### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. [Environment variables](#environment-variable-configuration) can also be used to configure the SDK.

Create a `looker.ini` file with your server URL and API credentials assigned as shown below:

```ini
[Looker]
# Base URL for API. Do not include /api/* in the url
base_url=https://<your-looker-server>:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
```

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to
**ignore** the `looker.ini` file to avoid publishing your API credentials.

**Note**: The Browser SDK does _not_ use a `looker.ini` or environment variables.

### Use the SDK in your code

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used.

Verify authentication works and that API calls will succeed with code similar to the following:

```typescript
import { LookerNodeSDK } from '@looker/sdk-node'
(async () => {
  // create a Node SDK object for API 4.0
  const sdk = LookerNodeSDK.init40()
  // retrieve your user account to verify correct credentials
  const me = await sdk.ok(sdk.me(
    "id, first_name, last_name, display_name, email, personal_space_id, home_space_id, group_ids, role_ids"))
  console.log({me})
  // make any other calls to the Looker SDK
  const dashboards = await sdk.ok(
    sdk.search_dashboards({title: 'My SDK dashboard'})
  )
  if (dashboards.length === 0) {
    console.log('Dashboard not found')
  }
  const [ dashboard ] = dashboards
  // do stuff with dashboard

  ...

  await sdk.authSession.logout()
  if (!sdk.authSession.isAuthenticated()) {
    console.log('Logout successful')
  }
})()
```

**NOTE**: By default, `LookerNodeSDK.init40()` will check for environment variables. Environment variables can be ignored by passing an empty string to the NodeSettings constructor.

```typescript
// Ignore any SDK environment variables for the node runtime
const settings = new NodeSettingsIniFile('');
const sdk = LookerNodeSDK.init40(settings);
```

### Developing with multiple API versions

Starting with Looker release 23.18, API 3.1 and 3.0 have been removed. Please use the stable and current version API 4.0 as shown below.

`LookerNodeSDK.init40()` `LookerBrowserSDK.init40()` and `Looker40SDK()` all initialize the API 4.0 implementation of the SDK.

## Using NodeSession for automatic authentication

Almost all requests to Looker's API require an access token. Typically, this token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the provided API3 credentials are used to look up the active **API user**.

The `settings` provided to the `NodeSession` class include the base URL for the Looker instance, and the desired API version. When API requests are made, if the auth session is not yet established, `NodeSession` will automatically authenticate the **API User**.

### Sudo behavior with NodeSession

`NodeSession` also directly supports logging in as another user, which is usually called `sudo as` another user in the Looker browser application.

An API user with appropriate permissions can `sudo` as another user by passing a different user ID to the `NodeSession.login()` method. Only one user can be impersonated at a time via `NodeSession`. When a `sudo` session is active, all SDK requests are processed as that user.

The test below shows use cases for authentication and sudo. This code sample is extracted directly from the sdk methods functionla tests, and assumes `apiUser` is the default authenticated user record with `sudo` abilities, and `sudoA` and `sudoB` are other enabled Looker user accounts.

```typescript
describe('sudo', () => {
  it(
    'login/logout',
    async () => {
      const sdk = new LookerSDK(session);
      const apiUser = await sdk.ok(sdk.me());
      let all = await sdk.ok(
        sdk.all_users({
          fields: 'id,is_disabled',
        })
      );

      // find users who are not the API user
      const others = all
        .filter(u => u.id !== apiUser.id && !u.is_disabled)
        .slice(0, 2);
      expect(others.length).toEqual(2);
      if (others.length > 1) {
        // pick two other active users for `sudo` tests
        const [sudoA, sudoB] = others;
        // get auth support for login()
        const auth = sdk.authSession as IAuthSession;

        // login as sudoA
        await auth.login(sudoA.id.toString());
        let sudo = await sdk.ok(sdk.me()); // `me` returns `sudoA` user
        expect(sudo.id).toEqual(sudoA.id);

        // login as sudoB directly from sudoA
        await auth.login(sudoB.id);
        sudo = await sdk.ok(sdk.me()); // `me` returns `sudoB` user
        expect(sudo.id).toEqual(sudoB.id);

        // logging out sudo resets to API user
        await auth.logout();
        let user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
        expect(sdk.authSession.isAuthenticated()).toEqual(true);
        expect(user).toEqual(apiUser);

        // login as sudoA again to test plain `login()` later
        await auth.login(sudoA.id);
        sudo = await sdk.ok(sdk.me());
        expect(sudo.id).toEqual(sudoA.id);

        // login() without a sudo ID logs in the API user
        await auth.login();
        user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
        expect(sdk.authSession.isAuthenticated()).toEqual(true);
        expect(user.id).toEqual(apiUser.id);
      }
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toEqual(false);
    },
    testTimeout
  );
});
```

## Environment variable configuration

[Environment variables](https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration) can be used to configure access for the **Node** version of the Looker SDK.

Once the desired environment variables are set, the following code is all that's required to initialize the Looker SDK and retrieve the API credential's `User` information.

```typescript
const sdk = LookerNodeSDK.init40(new NodeSettings());
const me = await sdk.ok(sdk.me());
```

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

### More examples

See the [SDK Examples](/examples/typescript) folder for additional TypeScript SDK examples.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](https://github.com/looker-open-source/sdk-codegen#securing-your-sdk-credentials).
