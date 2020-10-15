# Access Token Server

The access token gets google oauth access tokens using a service account. The returned access token can then be used to access google apis.

## Setup for running locally

1. Clone this repo.
2. Run `yarn install`
3. [Create a Google oauth2 service account](https://developers.google.com/identity/protocols/oauth2/service-account)
4. Grant access to the required api (Google console API & Services Library page for the project created or updated in step 1)
5. Create a .env file and add contents as shown below.
6. Encode the json generated when the service account was created by running `yarn encode-credentials`. The script expects the json created in step 1 to be in a file called service_account.json in this directory. It prints a base64 encoded string to the console. Copy this string to the .env file.
7. Start up the server
8. Run tests `yarn test`. Note that yarn test will create a status.json if one does not exist. If a status.json file exists, it will be left alone.

## Environment variables

The server will read an update environment variables from a .env file in this directory. The format the of .env file is as follows

### Required

```
SERVER_PORT=
LOOKERSDK_BASE_URL=
LOOKERSDK_VERIFY_SSL=
GOOGLE_APPLICATION_CREDENTIAL_ENCODED=
```

### Optional - only for running tests

```
LOOKER_CLIENT_ID=
LOOKER_CLIENT_SECRET=
```

### Explanation

- SERVER_PORT is the port the access token server will listen on.
- LOOKERSDK_BASE_URL is the Looker server to validate credentials against
- LOOKERSDK_VERIFY_SSL true to validate the SSL certificate. Set to false if using a test certificate.
- LOOKER_CLIENT_ID Looker server API3 client id (Looker user admin page). Only used for tests.
- LOOKER_CLIENT_SECRET Looker server API3 client secret (Looker user admin page). Only used for tests.
- GOOGLE_APPLICATION_CREDENTIAL_ENCODED base64 encoded string containing service account json file (see above for how to generate).

## Using in a Looker extension

1. The client id and client secret should be added as user attributes for the extension. See the [kitchen sink readme](https://github.com/looker-open-source/extension-template-kitchensink/blob/master/README.md) for details.
2. Use the extension sdk serverProxy api to get the access token. The credentials should be embedded in the request body using secret key tags. See the [kitchen sink readme](https://github.com/looker-open-source/extension-template-kitchensink/blob/master/README.md) for details. Note the access token and an expiry date is returned. Note that the expiry date is 5 minutes less than the expiry date actually returned by google. Any use of the access token should take this into account. Before using the access token, check if it has and request a new one. If it has expired, a new token is guaranteed to be returned.
3. The extension SDK fetch api maybe used with the access token. It does not need to use the extension SDK server proxy to all the Google APIs. Note that the token can be used in the following ways:
   - Query string parameter - `https://www.googleapis.com/drive/v2/files?access_token=access_token`
   - Request header - `Authorization: Bearer access_token`
4. Ensure this servers endpoint is defined as an entitlement for the extension.

## Docker container instructions

1. Build the image locally: ./docker-build.sh
2. Start a container from the image in #1 and tail the logs: ./docker-run.sh
3. Stop the container: ./docker-stop.sh (not enough to just Ctrl-c from #2)

Assumptions:

1. prod running docker container will listen on 8081
2. devops deployment will add the status.json file
3. devops deployemnt will not have a .env file - env will come from AWS secret manager

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

The access token can then be used to call the Google API endpoint (use of the extension SDK fetch API method is recommended).
