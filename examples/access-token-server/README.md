# Access Token Server

The access token gets google oauth access tokens using a service account. The returned access token can then be used to access google apis.

## Setup for running locally

1. [Create a Google oauth2 service account](https://developers.google.com/identity/protocols/oauth2/service-account)
2. Grant access to the required api (Google console API & Services Library page for the project created or updated in step 1)
3. Create a .env file and add contents as shown below.
4. Encode the json generated when the service account was created by running `yarn encode-credentials`. The script expects the json created in step 1 to be in a file called service_account.json in this directory. It prints a base64 encoded string to the console. Copy this string to the .env file.
5. Start up the server

## Required environment variables

The server will read an update environment variables from a .env file in this directory. The format the of .env file is as follows

```
SERVER_PORT=
LOOKER_SERVER_URL=
LOOKER_SERVER_VERIFY_SSL=
LOOKER_CLIENT_ID=
LOOKER_CLIENT_SECRET=
SERVICE_ACCOUNT_CREDENTIALS=
```

- SERVER_PORT is the port the access token server will listen on.
- LOOKER_SERVER_URL is the Looker server to validate credentials against
- LOOKER_SERVER_VERIFY_SSL true to validate the SSL certificate. Set to false if using a test certificate.
- LOOKER_CLIENT_ID Looker server API3 client id (Looker user admin page)
- LOOKER_CLIENT_SECRET Looker server API3 client secret (Looker user admin page)
- SERVICE_ACCOUNT_CREDENTIALS base64 encoded string containing service account json file (see above for how to generate).

## Using in a Looker extension

1. The client id and client secret should be added as user attributes for the extension. See the [kitchen sink readme](https://github.com/looker-open-source/extension-template-kitchensink/blob/master/README.md) for details.
2. Use the extension sdk serverProxy api to get the access token. The credentials should be embedded in the request body using secret key tags. See the [kitchen sink readme](https://github.com/looker-open-source/extension-template-kitchensink/blob/master/README.md) for details. Note the access token and an expiry date is returned. The token is cached in the server for up to 55 minutes _(TODO: return the expiry time this server will refresh the token, not Googles expiry time)_. The extension should have some mechanism to refresh the access token.
3. Ensure this servers endpoint is defined as an entitlement for the extension.

## Endpoint details

```
    const requestBody = {
      client_id: extensionSDK.createSecretKeyTag('my_client_id'),
      client_secret: extensionSDK.createSecretKeyTag('my_client_secret'),
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    try {
      const response = await extensionSDK.serverProxy(
        `${ACCESS_SERVER_URL}/access_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      )
      const { access_token, expiry_date } = response.body
      . . .
    } catch (error) {
      console.error(error)
      // Error handling
      . . .
    }
```

The access token can then be used to call the Google API endpoint.
