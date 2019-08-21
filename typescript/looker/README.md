# Looker SDK

The Looker SDK for Typescript/Javascript provides a convenient way to communicate with the Looker API available on your 
Looker server. The SDK is written in Typescript and uses the Node [request](https://www.npmjs.com/package/request) and 
[request promise native](https://www.npmjs.com/package/request-promise-native) modules for processing HTTP requests.

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

Create a `looker.ini` file with your server location and API credentials assigned as shown in this example.

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
import { ApiSettingsIniFile } from '../rtl/apiSettings'
import { UserSession } from '../rtl/userSession'
import { LookerSDK } from '../sdk/methods'

...

// Retrieve the configuration settings from the `looker.ini` file
const settings = new ApiSettingsIniFile('looker.ini')
// UserSession handles authentication automatically
const userSession = new UserSession(settings)
```


#### Make SDK method requests

Verify authentication works and that API calls will succeed with code similar to the following:

```typescript
// Create an SDK instance for the configured userSession
const sdk = new LookerSDK(userSession)
// retrieve your user record to verify correct credentials
const me = await sdk.ok(sdk.me()) 
// make any other calls to the Looker SDK
```
