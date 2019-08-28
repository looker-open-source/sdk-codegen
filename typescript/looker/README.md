# Looker SDK

The Looker SDK for Typescript/Javascript provides a convenient way to communicate with the Looker API available on your 
Looker server. The SDK is written in Typescript and uses the Node [request](https://www.npmjs.com/package/request) and 
[request promise native](https://www.npmjs.com/package/request-promise-native) modules for processing HTTP requests.

**DISCLAIMER**: This is an _experimental_ version of the Looker SDK, using a new code generator developed by Looker. 
You should expect some things to just not work, and foresee drastic changes to the SDK source code until an official
beta begins. 
 
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
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
```

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to 
**ignore** the `looker.ini` file so the API credentials aren't unintentionally published.

### Use the SDK in your code

When the SDK is installed and the server API credentials are configured, it's ready to be used.

#### Initialize the SDK

Initialize the Looker SDK in Typescript with code similar to the following:

```typescript
// Retrieve the configuration settings from the `looker.ini` file
const settings = new ApiSettingsIniFile('looker.ini')
const session = new AuthSession(settings)
```

#### Make SDK method requests

Verify authentication works and that API calls will succeed with code similar to the following:

```typescript
import { SDK } from '@looker/sdk'
(async () => {
  const sdk = SDK.createClient()
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

## Using AuthSession for automatic authentication

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint 
is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the 
user whose API3 credentials are provided is considered the active user. For this discussion of `AuthSession`, we'll
call this user the **API User**. 

The `settings` provided to the `AuthSession` class include the base URL for the Looker instance, and the API3 credentials.
When API requests are made, if the auth session is not yet established, `AuthSession` will automatically authenticate
the **API User**. The `AuthSession` also directly support logging in as another user, usually called `sudo as` another
user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the 
`AuthSession.login()` method. Only one user can be impersonated at a time via `AuthSession`. When a `sudo` session is 
active, all SDK methods will be processed as that user.
  
### Sudo behavior with AuthSession

The rest of this section shows sample code for typical use cases for authentication and sudo. This code sample is extracted
directly from the sdk methods Jest tests, and assumes `apiUser` is the default authenticated user record with `sudo` abilities, 
and `sudoA` and `sudoB` are other enabled Looker user records.

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
    .slice(0,2)
  expect(others.length).toEqual(2)
  if (others.length > 1) {
    // pick two other active users for `sudo` tests
    const [ sudoA, sudoB ] = others

    // login as sudoA
    await sdk.authSession.login(sudoA.id.toString())
    let sudo = await sdk.ok(sdk.me()) // `me` returns `sudoA` user
    expect(sudo.id).toEqual(sudoA.id)

    // login as sudoB directly from sudoA
    await sdk.authSession.login(sudoB.id)
    sudo = await sdk.ok(sdk.me()) // `me` returns `sudoB` user
    expect(sudo.id).toEqual(sudoB.id)

    // logging out sudo resets to API user
    await sdk.authSession.logout()
    let user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
    expect(sdk.authSession.isAuthenticated()).toEqual(true)
    expect(user).toEqual(apiUser)

    // login as sudoA again to test plain `login()` later
    await sdk.authSession.login(sudoA.id)
    sudo = await sdk.ok(sdk.me())
    expect(sudo.id).toEqual(sudoA.id)

    // login() without a sudo ID logs in the API user
    await sdk.authSession.login()
    user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
    expect(sdk.authSession.isAuthenticated()).toEqual(true)
    expect(user.id).toEqual(apiUser.id)
  }
  await sdk.authSession.logout()
  expect(sdk.authSession.isAuthenticated()).toEqual(false)
}, testTimeout)

})
```


 
