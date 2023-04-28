# Looker Extension SDK

An SDK that may be used by Looker extensions to make API calls or otherwise interact with their host context.

A Looker extension is JavaScript code that code that runs inside of the Looker UI and exposes an interface for custom functionality. (In this setup, the extension itself can be thought of as a client, while Looker can be thought of as a host.) Via this Extension SDK, the extension may request that the Looker host perform various tasks to enhance your extension. This allows the host to take care of complex functionality, including API authentication, so your extension does not need to perform any setup and does not need to deal with any credentials.

Extensions are implemented as a sandboxed `<iframe>` and communication with Looker is accomplished through this SDK. Internally, the SDK will translate function calls into messages passed safely across the iframe boundary. The specific format of those messages is considered private, and this SDK is the only supported interface for interacting with the host from an extension.

[React bindings for extensions](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-sdk-react) are also available, as well as [examples to help you get started](https://github.com/looker-open-source/extension-examples). The [create looker extension utility](https://docs.looker.com/data-modeling/extension-framework/installing-extension#generating_the_extension_template_files) is also available to help you get started quickly.

## Installation

Add dependency to your project using yarn or npm

```sh
yarn add @looker/extension-sdk
```

or

```sh
npm install @looker/extension-sdk
```

## Usage

### Establish connection

The Extension SDK must establish a connection with its host before further functionality will be available.

```ts
import {
  connectExtensionHost,
  LookerExtensionSDK40,
} from '@looker/extension-sdk'

;(async () => {
  // This `extensionSDK` can perform extension-specific actions
  const extensionSdk = await connectExtensionHost()
  // This `coreSDK` is an automatically credentialed variant of the standard Looker Core SDK for performing API calls
  const coreSDK = LookerExtensionSDK40.createClient(extensionSdk)
  const result = await sdk40.me()
  const name = result.ok ? result.value.display_name : 'Unknown'

  // DO OTHER THINGS
})()
```

The following create methods are also available

- `LookerExtensionSDK.createClient(extensionSDK)` creates a Looker40SDK instance.
- `LookerExtensionSDK.create31Client(extensionSDK)` creates a Looker31SDK instance, which is deprecated.

#### Connection configuration

`connectExtensionHost()` can also accept a configuration object as an argument.

- `initializedCallback` - (optional) an initialization callback that is called after communicating with the looker host. The callback routine accepts an error message argument that will be populated should an error occur during initialization (for example a looker version issue).
- setInitialRoute - (optional) a callback to set the initial route. The initial route is also available in the `ExtensionSDK lookerHostData` property and as such this callback is likely to be removed in a future release.
- requiredLookerVersion - (optional) specify the required version of the Looker host. If the Looker host does not meet the required version an error message will be passed to the initializedCallback function.

#### Looker host data

Looker host data is made available once the host connection has been established

- `extensionId` - id of the extension.
- `lookerVersion` - host Looker version. Test this value if the extension depends on a particular version of Looker.
- `route` - if routes are tracked, route is the last active route tracked by the host. On initialization the extension may set its route to this value.
- `routeState`- if routes are tracked, [push state](https://developer.mozilla.org/en-US/docs/Web/API/History/state) associated with the route
- `hostOrigin` - [origin](https://developer.mozilla.org/en-US/docs/Web/API/Location/origin) of the Looker host. **Looker >=21.8**.
- `hostType` - Looker host type. `standard`|`embed`|`spartan`. **Looker >=21.8**.
- `mountType` - Extension mount type. `fullscreen`. **Looker >=21.8**.

#### Context data

An extension can have shareable context data associated with it. All users of the extension get access to the data, both read and write. Care should be taken when writing the data as there is no locking and the last write wins. Context data should be used for data that changes infrequently. A good example of usage is for extension configuration data.

```ts
// Read context data
const context = extensionSDK.getContextData()

// Write context data
try {
  const currentContext = await extensionSDK.saveContextData(configurationData)
  // Do stuff
  . . .
} catch (error) {
  // error handling
  . . .
}

// Refresh context data
try {
  const lastestContext = await extensionSDK.refreshContextData()
  // Do stuff
  . . .
} catch (error) {
  // error handling
  . . .
}
```

### Use the Looker Core API

When your extension is run inside Looker, and the connection process is completed, you can use `coreSDK` to make API calls.

```ts
async function runLook(coreSDK) {
  var result = await coreSDK.run_look({
    look_id: look_id,
    result_format: 'json',
  })
  if (result.ok) {
    // do something with result
  } else {
    console.error('Something went wrong:', result.error)
  }
}
```

### Update browser window title

```ts
extensionSDK.updateTitle('Change the window title')
```

### Navigation and Links

To navigate the host context to a new page:

```ts
extensionSDK.updateLocation('/dashboards/37')
```

Or to open a new tab:

```ts
extensionSDK.openBrowserWindow('/dashboards/37', '_blank')
```

### Close host popovers

The Looker host may overlay the extension with it's popovers. These will not automatically
close when the extension is active. The extension may request that the Looker host close
any open popovers.

```ts
extensionSDK.closeHostPopovers()
```

### Local storage

Extensions may read/write data from/to the Looker host local storage. Note that the storage is
namespaced to the extension. The extension may not read/write data from other extensions or
the Looker host. Note that the extension localstorage API is asynchronous which is different
from the regular browser localstorage API which is synchronous.

```ts
// Save to localstorage
await extensionSDK.localStorageSetItem('data', JSON.stringify(myDataObj))

// Read from localstorage
const value = await extensionSDK.localStorageGetItem('data')
const myDataObj = JSON.parse(value)

// Remove from localstorage
await extensionSDK.localStorageRemoveItem('data')
```

### Clipboard

** Looker >=21.8 **. Extensions may write to the system clipboard. For security reasons, the extension
is not given read access to the clipboard.

```ts
extensionSDK.clipboardWrite('Hello Clipboard')
```

### User Attributes

Extensions can read Looker provided user attributes, and can define, read and modify their own user attributes. For extension scoped user attributes the key should be namespaced as follows:

`{modified extension id}::{key name}`

A `modified extension id` means replacing the `::` with an underscore, `_`. For example,
extension `kitchensink::kitchensink`, key name `my_attribute` becomes `kitchensink_kitchensink_my_attribute`. An extension scoped user attribute can be defined as any user attribute type.

```ts
// Read from system user attribute
const locale = await extensionSDK.userAttributeGetItem('locale')

// Save to scoped user attribute
await extensionSDK.userAttributeSetItem('my_attribute', 'value')

// Read from scoped user attribute
const value = await extensionSDK.userAttributeGetItem('my_attribute')
```

### External API

#### OAUTH2 Authentication

The extension framework supports the OAUTH2 implicit and PKCE authentication flows. The OAUTH2 flow opens a separate window above the extension where the user goes through the authentication flow with the OAUTH2 provider. Upon completion, the OAUTH2 provider's response is made available to the extension OR an error is returned should the user fail to authenticate.

##### Implicit flow

```ts
try {
  const response = await extensionSDK.oauth2Authenticate(
    'https://accounts.google.com/o/oauth2/v2/auth',
    {
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      response_type: 'token',
    }
  )
  const { access_token, expires_in } = response
  // The user is authenticated, it does not mean the user is authorized.
  // There may be further work for the extension to do.
} catch (error) {
  // The user failed to authenticate
}
```

##### Authorization code flow with secret key

The Authorization code flow secret key mechanism requires that the code exchange be proxied through the Looker server. The code flow with secret key mechanism also requires that a secret key be defined. This secret key MUST NOT be exposed in code in the exension either at runtime OR compile time. The extension framework proxy running in the Looker server has the capability of replacing secret key tags identified in the request with actual secret key values stored securely in the Looker server. The secret key is name spaced to the Looker extension. The createSecretKeyTag will format the secret key name such that the proxy can replace it with the correct value. See the section on secret keys for more information.

The following is an example of the secret key mechanism.

```ts
try {
  const response = await extensionSDK.oauth2Authenticate(
    'https://github.com/login/oauth/authorize',
    {
      client_id: GITHUB_CLIENT_ID,
      response_type: 'code',
    },
    'GET'
  )
  const { access_token } = await extensionSDK.oauth2ExchangeCodeForToken(
    'https://github.com/login/oauth/access_token',
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: extensionSDK.createSecretKeyTag('github_secret_key'),
      code: response.code,
    }
  )
  // The user is authenticated, it does not mean the user is authorized.
  // There may be further work for the extension to do.
} catch (error) {
  // The user failed to authenticate
}
```

##### Authorization code with code challenge mechanism (PKCE)

The Authorization code flow with code challenge mechanism is currently mutually exclusive with the secret key mechanism. When using the code challenge the Looker UI will call the endpoint directly. The code is similar to the secret key mechanism with the exception that the code_challenge_method is set to 'S256' on the initial request and the secret key is NOT added to the exchange request. Note that the code challenge verifier is automatically added to the exchange request by the Looker UI.

The following is an example of the code challenge mechanism.

```ts
try {
  // Note the code_challenge_method: 'S256' parameter
  const response = await extensionSDK.oauth2Authenticate(
    `${AUTH0_BASE_URL}/authorize`,
    {
      client_id: AUTH0_CLIENT_ID,
      response_type: 'code',
      code_challenge_method: 'S256',
      scope: AUTH0_SCOPES,
    },
    'GET'
  )
  // Note, no secret key
  const { access_token } = await extensionSDK.oauth2ExchangeCodeForToken(
    'https://github.com/login/oauth/access_token',
    {
      grant_type: 'authorization_code',
      client_id: AUTH0_CLIENT_ID,
      code: response.code,
    }
  )
  // The user is authenticated, it does not mean the user is authorized.
  // There may be further work for the extension to do.
} catch (error) {
  // The user failed to authenticate
}
```

**Note on entitlements:** OAUTH2 authentication urls must be defined in the extensions entitlements (see the `Entitlements` section for more details).

#### Fetch proxy

The external API allows the extension to call third party API in the context of the Looker
host. Note that entitlements must be defined for the Extension in order to use the external
API feature. The Extension SDK fetchProxy method is a proxy to the Looker host window fetch API.

```ts
    // Get
    const response: any = await extensionSDK.fetchProxy(`${postsServer}/posts`)
    if (response.ok) {
      // Do something with response.body
    } else {
      // error handling
    }

    // Post
    const response = await extensionSDK.fetchProxy(
      `${postsServer}/posts`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(myDataObj)
      if (response.ok) {
        // Continue
      } else {
        // Error handling
      }

```

A fetch proxy object can also be created with a base URL and a pre initialized init object. In the example below `{ credentials: 'include' }` will be used as the init object or merged with the init object if provided.

```ts
    const dataServerFetchProxy = extensionSDK.createFetchProxy(postsServer, { credentials: 'include' })

    // Get
    const response: any = await dataServerFetchProxy.fetchProxy('/posts')
    if (response.ok) {
      // Do something with response.body
    } else {
      // error handling
    }

    // Post
    const response = await dataServerFetchProxy.fetchProxy(
      '/posts',
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(myDataObj)
      if (response.ok) {
        // Continue
      } else {
        // Error handling
      }
```

**Note on cookies returned by the external API:** The `credentials` property of the `init` argument needs to be set to `include`
in order for any cookies associated with the external API server to be sent with the request. Use the `createFetchProxy` to populate the credentials value for all requests.

#### Server proxy

A server proxy mechanism has been provided purely to allow secret keys to be stored safely and securely in the Looker server. The server proxy should only be used to get ephemeral access tokens. The OAUTH2 PKCE flow uses the server proxy to get an access token but the implementation is flexible enough to support non OAUTH2 flows. For instance, an external API endpoint could be created that given a secret key and some kind of identification of the extension user, it will return an access token. That access token could be a JWT token and can subsequently be used with the fetchProxy functionality. Note that it is down to the external APIs to enforce and verify that the access tokens are valid.

```ts
    const response = await extensionSDK.serverProxy(
      `${postsServer}/authorize`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          extension_secret_key: extensionSDK.createSecretKeyTag("extension_secret_key"),
          extension_userid: extensionSDK.createSecretKeyTag("extension_userid"),
        })
      if (response.ok) {
        // Continue - at this point the response should contain the access token
      } else {
        // Error handling
      }

```

#### Secret keys

The extension framework server proxy has the capability to recognize and replace special tags in a request with values stored in user attributes in the Looker server. The `createSecretKeyTag` method will format the tag such that it will be recognized by the proxy (it will handle the name spacing and attaching of special characters to indicate that it is to be replaced). The tags can be placed any where in the header or body of the request. An object property can contain multiple secret key tags.

Secret keys should be defined in the Looker as user attributes. The key should name spaced as follows
`{modified extension id}::{key name}`
A `modified extension id` means replacing the `::` with an underscore, `_`. Example:
Extension `kitchensink::kitchensink` secret key name `github_secret_key` becomes `kitchensink_kitchensink_github_secret_key`.

The user attribute value should be hidden and the domain whitelist should include the url used in the server proxy call.

**Note on entitlements:** External API urls must be defined in the extensions entitlements (see the `Entitlements` section for more details).

## Entitlements

If an extension is installed from the marketplace entitlements are required in order to use some of the APIs.
Eventually, entitlements will be required for all extensions.

- `local_storage` - required to access local storage apis.
- `navigation` - required to access navigation and link apis.
- `new_window` - required to open a new window.
- `use_form_submit` - required if extension uses html form submission. Note that some `@looker/componenents` use html forms underneath the covers. Note that a message similar to the following will be displayed on the browser console if a form is used without the allow forms entitlement: `Blocked form submission to '' because the form's frame is sandboxed and the 'allow-forms' permission is not set.`
- `use_embeds` - required if the extension uses the `@looker/embed-sdk`. Note that a message similar to the following will be displayed on the browser console if the emded sdk used without the allow same origin entitlement: `Access to script at ... from origin 'null' has been blocked by CORS policy ...`.
- `core_api_methods` - list of Looker api methods used by the extension.
- `external_api_urls` - list of external apis used by the extension. Only the protocol, domain and top level domain need be defined. A wild card of `*.` may be used for sub domains. External api urls must be defined for both fetch proxy and server proxy calls.
- `oauth2_urls` - list of OAUTH2 authentication URLs used by the extension. Note that these are URLs that do the authentication and code exchange..
- `system_user_attributes` - list of Looker provided user attributes that the extension can read.
- `scoped_user_attributes` - list of extension defined user attributes that the extension can read and modify.

## Spartan Mode

An extension can be viewed in full screen mode (no Looker chrome) at /spartan/{extension_project::application_id}. If a Looker user is assigned to the group "Extensions Only" the only parts of Looker the user can access are extensions under the /spartan/ path. As there is no Looker chrome in this mode, the extension should provide a Logout mechanism.

**Note:** this call only works when the extension is running in /spartan mode.

```ts
extensionSDK.spartanLogout()
```

## Related Projects

- [Looker extension examples](https://github.com/looker-open-source/extension-examples).
- [Looker SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/sdk).
