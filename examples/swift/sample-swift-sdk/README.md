# Sample iOS Swift SDK Example

## Setting the Looker SDK configuration

There are a couple different ways to configure the SDK for a Looker server.
This example sets them as environment variables.
To set the environment vars go to `Product`>`Scheme`>`Edit Scheme...`
and add

- `LOOKERSDK_BASE_URL` for the Looker API server URL, like `https://foo.looker.com:19999`
- `LOOKER_API_VERSION` as `4.0`
- `LOOKERSDK_CLIENT_ID` for the API Client ID
- `LOOKERSDK_CLIENT_SECRET` for the API Client Secret
