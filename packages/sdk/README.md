# Looker SDK

The Looker SDK for Typescript/Javascript works with Node and browser run-times. The SDK provides a convenient way to communicate with a Looker server's APIs.

The SDK uses a plug-in architecture (also known as dependency injection) for initializing that supports run-time specific transports (like `NodeTransport` and `BrowserTransport`) and different approaches for managing API authentication (like `NodeSession`, `BrowserSession`, `ProxySession`, and `CorsSession`).

**DISCLAIMER**: This is a _beta_ version of the Looker SDK, using a completely new code generator developed by Looker. Implementations are still subject to change, but we expect most SDK method calls to work correctly. If you run into problems with the SDK, please feel free to [report an issue](https://github.com/looker-open-source/sdk-codegen/issues), and please indicate which language SDK you're using in the report.

## Getting started

The Looker SDK can be used in a node application in 3 steps:

* install
* configure
* use

### Install the Looker SDK into your node application

Using `npm`:

```bash
npm install @looker/sdk
```

Using `yarn`:

```bash
yarn add @looker/sdk
```

### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. See this note on [Securing your SDK Credentials](https://github.com/looker-open-source/sdk-codegen/blob/master/README.md#securing-your-sdk-credentials) for warnings about using `.ini` files that contain your API credentials in a source code repository or production environment.

Create a `looker.ini` file with your server URL and API credentials assigned as shown in this example.

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
**ignore** the `looker.ini` file so the API credentials aren't unintentionally published.

### Use the SDK in your code

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used.

Verify authentication works and that API calls will succeed with code similar to the following:

```typescript
import { LookerNodeSDK } from '@looker/sdk/lib/node'
(async () => {
  // create a Node SDK object for API 3.1
  const sdk = LookerNodeSDK.init31()
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

### Developing with multiple API versions ###

Starting with Looker release 7.2, the experimental version of API 4.0 is available. To support iterative migration to API 4.0 from API 3.1, the single Looker SDK package now supports multiple API versions for the generated SDK classes. Both API 3.1 and API 4.0 are supported for Node and browser-based use.

In the `looker.ini` used by the code generator, multiple api versions can be indicated with:

```ini
# default values API versions to generate
api_versions=3.1,4.0
```

for example, which will generate files to

```bash
/sdk
  /3.1
    models.ts
    methods.ts
    streams.ts
  /4.0
    models.ts
    methods.ts
    streams.ts
```

`LookerNodeSDK.init31()` `LookerBrowserSDK.init31()` and `Looker31SDK()` all initialize the API 3.1 implementation of the SDK.

`LookerNodeSDK.init40()` `LookerBrowserSDK.init40()` and `Looker40SDK()` all initalize the API 4.1 implementation of the SDK.

Code similar to the following can be used to develop with both the 3.1 and 4.0 SDKs in the same source file:

```typescript
import { Looker40SDK, Looker31SDK, NodeSession, NodeSettingsIniFile } from '@looker/sdk/lib/node'

const settings = new NodeSettingsIniFile()
const session = new NodeSession(settings)
const sdk = new Looker40SDK(session)
const sdk31 = new Looker31SDK(session)

const me40 = await sdk.ok(sdk.me())
const me31 = await sdk.ok(sdk31.me()) // or sdk31.ok(sdk31.me())
```

## Using NodeSession for automatic authentication

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `NodeSession`, we'll
call this user the **API User**.

The `settings` provided to the `NodeSession` class include the base URL for the Looker instance and the desired API version. When API requests are made, if the auth session is not yet established, `NodeSession` will automatically authenticate the **API User**. The `NodeSession` also directly supports logging in as another user, usually called `sudo as` another user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the `NodeSession.login()` method. Only one user can be impersonated at a time via `NodeSession`. When a `sudo` session is active, all SDK methods will be processed as that user.


### Sudo behavior with NodeSession

The rest of this section shows sample code for typical use cases for authentication and sudo. This code sample is extracted directly from the sdk methods Jest tests, and assumes `apiUser` is the default authenticated user record with `sudo` abilities, and `sudoA` and `sudoB` are other enabled Looker user records.

```typescript
describe('sudo', () => {
  it('login/logout', async () => {
    const sdk = new LookerSDK(session)
    const apiUser = await sdk.ok(sdk.me())
    let all = await sdk.ok(
      sdk.all_users({
        fields: 'id,is_disabled'
      })
    )

    // find users who are not the API user
    const others = all
      .filter(u => u.id !== apiUser.id && (!u.is_disabled))
      .slice(0, 2)
    expect(others.length).toEqual(2)
    if (others.length > 1) {
      // pick two other active users for `sudo` tests
      const [sudoA, sudoB] = others
      // get auth support for login()
      const auth = sdk.authSession as IAuthSession

      // login as sudoA
      await auth.login(sudoA.id.toString())
      let sudo = await sdk.ok(sdk.me()) // `me` returns `sudoA` user
      expect(sudo.id).toEqual(sudoA.id)

      // login as sudoB directly from sudoA
      await auth.login(sudoB.id)
      sudo = await sdk.ok(sdk.me()) // `me` returns `sudoB` user
      expect(sudo.id).toEqual(sudoB.id)

      // logging out sudo resets to API user
      await auth.logout()
      let user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
      expect(sdk.authSession.isAuthenticated()).toEqual(true)
      expect(user).toEqual(apiUser)

      // login as sudoA again to test plain `login()` later
      await auth.login(sudoA.id)
      sudo = await sdk.ok(sdk.me())
      expect(sudo.id).toEqual(sudoA.id)

      // login() without a sudo ID logs in the API user
      await auth.login()
      user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
      expect(sdk.authSession.isAuthenticated()).toEqual(true)
      expect(user.id).toEqual(apiUser.id)
    }
    await sdk.authSession.logout()
    expect(sdk.authSession.isAuthenticated()).toEqual(false)
  }, testTimeout)

})
```

## Environment variable configuration

[Environment variables](https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration) can be used to configure access for the **Node** version of the Looker SDK.

Once the desired environment variables are set, the following code is all that's required to initialize the Looker SDK and retrieve the API credential's `User` information.

```typescript
const sdk = LookerNodeSDK.init31(new NodeSettings())
const me = await sdk.ok(sdk.me())
```

## Using a Proxy for authentication

With the introduction of CORS support in the Looker API (coming soon to a release near you) the Looker SDK can now be used directly in the browser on a different domain than the Looker server. Because all API endpoints require authentication except for Login, a proxy server can be used to retrieve the API auth token and return it to the browser session.

`ProxySession` is the SDK class specifically designed to make creating a proxy session simple. The source code example below shows how to override the `authenticate` method for use in a CORS request scenario.

* `getProxyToken()` is the call to the proxy server's API that returns the API auth token to use
* the code in the `if (this.isAuthenticated()` branch
  * Sets CORS mode
  * Sets the auth token header
  * Identifies the Looker SDK version for the Looker server

By writing your own `getProxyToken()` visible to this class, any proxied authentication workflow is supported.

```typescript
export class EmbedSession extends ProxySession {

  constructor(public settings: IApiSettings, transport?: ITransport) {
    super(settings, transport)
  }

  async authenticate(props: any) {
    // get the auth token from the proxy server
    const token = await getProxyToken()
    if (token) {
      // Assign the token, which will track its expiration time automatically
      this.activeToken.setToken(token)
    }

    if (this.isAuthenticated()) {
      // Session is authenticated
      // set CORS mode (in this scenario)
      props.mode = 'cors'

      // remove any credentials attribute that may have been set
      // because the BrowserTransport defaults to having `same-origin` for credentials
      delete props['credentials']

      // replace the headers argument with required values
      // Note: using new Headers() to construct the headers breaks CORS for the Looker API. Don't know why yet
      props.headers = {
        'Authorization': `Bearer ${token.access_token}`,
        'x-looker-appid': agentTag
      }
    }
    return props
  }

}
```

### More examples

Looker's open source repository of [SDK Examples](https://github.com/looker-open-source/sdk-examples/tree/master/typescript) has more example scripts and applications that show how to use the Looker SDK.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](https://github.com/looker-open-source/sdk-codegen#securing-your-sdk-credentials).

