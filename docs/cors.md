# OAuth and CORS with Looker

Please thoroughly read [Looker's OAuth and CORS documentation](https://docs.looker.com/reference/api-and-integration/api-cors) before reading this document.
It will answer most questions about using OAuth and CORS with Looker, and describes Looker's OAuth configuration steps.

Looker API 4.0 supports CORS requests and is used in conjunction with Looker's OAuth workflow. [`BrowserSession`](/packages/sdk-rtl/src/browserSession.ts) provides the CORS support in the SDK.
`BrowserSession` is the default Browser-based session manager for the Looker SDK for Typescript/Javascript.

The Node runtime for the Looker SDK doesn't require CORS. Only the Browser runtime requires CORS.

## Reference implementation

Included in this repository are scripts and source code that hopefully reduce the amount of effort and code required to use OAuth and CORS:

- [OAuth application registration](/packages/api-explorer/scripts/register.ts) is a Node script that can create and update an OAuth app configuration
- a sample OAuth application configuration file [`appconfig.json`](/packages/api-explorer/scripts/appconfig.json) has the configuration for the stand-alone [API Explorer](/packages/api-explorer) in this repository
- a working [`readConfig` override](/packages/run-it/src/utils/RunItSDK.ts) provides the values required by `OAuthSession`
- a working React-based [OAuth handler](/packages/run-it/src/scenes/OAuthScene) processes OAuth authentications and "logs in" the SDK

## SDK support

Because the OAuth workflow redirects the browser page to the Looker instance to authenticate, then back to your web application, the Browser's [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is used to persist some variables used by the SDK.

### readConfig override

`readConfig()` must be overridden to provide the additional configuration values `OAuthSession` needs to complete an OAuth handshake:

- `client_id` is the OAuth application ID and **must match the `client_guid` used for the OAuth application registration**.
- `looker_url` is the url of the Looker application server, typically on port `9999` and **not** the API server, typically on port `19999`.
- `redirect_uri` is the web application page that receives OAuth responses from the looker server, and **must match the `redirect_uri` used for the OAuth application registration**.

The code below is from the [RunIt readConfig() override](/packages/run-it/src/utils/RunItSDK.ts):

```ts
  readConfig(_section?: string): IApiSection {
    /**
     * Use the values that can be resolved dynamically
     */
    const url = new URL(this.base_url)
    const oauthServer = `${url.protocol}//${url.hostname}`
    return {
      ...super.readConfig(_section),
      ...{
        client_id: 'looker.api-explorer',
        looker_url: `${oauthServer}:9999`,
        redirect_uri: `${window.location.origin}/oauth`,
      },
    }
  }

```

To make this code as generic as possible, `looker_url` is based on `base_url` and redirect_uri is calculated from the running web application.

### Automatic login

As with other `AuthSession` implementations in the Looker SDKs, SDK method requests via `OAuthSession` automatically receive an active API auth token.

However, what happens with automatic `login()` is different in this scenario.

### login() flow

The Looker CORS implementation prohibits direct API calls to the `/login` endpoint. Instead, Looker's OAuth authentication provides the API token.

Therefore, `OAuthSession.login()` has three different branches:

1. if the session is already authenticated, it returns the active API authentication token
1. if `returnUrl` is not in `sessionStorage`:
   - the `returnUrl` (current web application url) is saved to `sessionStorage`
   - the `code_verifier` (used for OAuth crypto) is saved to `sessionStorage`
   - the browser session redirects to the Looker server OAuth authentication url
1. if `returnUrl` is in `sessionStorage`:

   - the return url is saved locally in `login()` and the `sessionStorage` is cleared
   - the authentication `code` sent by Looker to the `redirect_uri` is used to redeem the Looker authentication code and get an API token.
   - `OAuthSession.activeToken` is assigned this API token

### Guidelines for the code

Because the OAuth `code` is retrieved from the current browser url, the final `OAuthSession.login()` must be called directly from the `redirect_uri` page.

[OAuthScene.tsx](/packages/run-it/src/scenes/OAuthScene/OAuthScene.tsx) shows how the `returnUrl` can be captured and used to go back to the original browser location requiring authentication.

**NOTE**: `OAuthSession.activeToken` is **not** saved in `sessionStorage` so it will disappear if the browser page reloads. That's why `history.push()` is used to relocate the browser page for the React application. The `returnUrl` in `sessionStorage` is a relative URI for this same reason.
