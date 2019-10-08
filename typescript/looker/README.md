# Looker SDK

The Looker SDK for Typescript/Javascript provides a convenient way to communicate with the Looker API available on your Looker server. The SDK is written in Typescript and uses the Node [request](https://www.npmjs.com/package/request) and [request promise native](https://www.npmjs.com/package/request-promise-native) modules for processing HTTP requests.

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
# API version is required. 3.1 and 3.0 are currently supported. 3.1 is highly recommended.
api_version=3.1
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
import { LookerNodeSDK } from '@looker/sdk'
(async () => {
  const sdk = LookerNodeSDK.createClient()
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

## Using NodeSession for automatic authentication

**NOTE**: As we secure the design of the Looker SDK's authentication practices, the authentication behavior described in this section will likely change.

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `NodeSession`, we'll
call this user the **API User**.

The `settings` provided to the `NodeSession` class include the base URL for the Looker instance, and the API3 credentials. When API requests are made, if the auth session is not yet established, `NodeSession` will automatically authenticate the **API User**. The `NodeSession` also directly support logging in as another user, usually called `sudo as` another user in the Looker browser application.

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
