# Build Your Own SDK

_How to build a new general-purpose language SDK with Looker's SDK codegen project_

1. Create the language/platform [run-time library](#run-time-library) (RTL)

1. Create the [code generator](#code-generator) by descending from [codeGen.ts](src/codeGen.ts) or one of the existing 
generators like [Typescript](src/typescript.gen.ts) or [Python](src/python.gen.ts)

1. Create unit and functional tests

1. Create deployment scripts

When implementing the syntax and features for the new language SDK, keep in mind the principles described in the 
[codegen rationale](rationale.md) documentation:
 
- [consistency](rationale.md#consistency),
- [discoverability](rationale.md#discoverability), and
- [correctness](rationale.md#correctness).

A feature of these SDKs to remember is the support for [multiple API versions in the same SDK](README.md#multi-api-support-with-looker-72-and-later).
This is a valuable feature to support for iterative client-side code migration from an older SDK version to a new SDK version.
The RTL for both API versions will be identical. It's only the SDK-specific classes that use the run-time that will
indicate which version of the API they consume.

Most examples in this document will use the Typescript SDK, which is typically our lead language SDK the other SDKs 
follow. The other SDKs in this repository will have similarly named or designed classes.

## Run-time Library

The Run-Time Library (RTL) is the vast majority of the work when building a new SDK. By making a general-purpose runtime
that's designed to handle authenticated REST API requests automatically, the methods and models that describe a particular 
specification become very short, and generation of the code for processing a specific API method is simplified.

### Configuration support

Any method of secure retrieval of API credentials and server locations can be supported by adopting the configuration 
provider pattern used by the reference SDKs. The existing SDKs provide support for `.ini` file style configuration both
for [configuring the code generator](README.md#configuring-lookerini) and as a default configuration file for getting 
started developing with an existing SDK.

All SDKs implement a `readConfig() -> [String: String]` method that can be overridden to customize how configuration 
values are retrieved. See [securing your SDK credentials](README.md#securing-your-sdk-credentials) for more information 
on this topic, including links to `readConfig()` examples

Once the `base_url` for the API server is provided to the SDK object and API credentials are available for reading on 
demand, the request processor and `AuthSession` implementation can be worked on. 

**Note**: By design, SDKs never retain API credentials in runtime memory but only use them when required to authenticate.
 
### Request processing

All SDKs implement a `transport` interface or protocol that has most if not all of the following characteristics:

 ```typescript
/**
 * Recognized HTTP methods
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'TRACE'
  | 'HEAD'

/** Interface for API transport values */
export interface ITransportSettings {
  [key:string] : any
  /** base URL of API REST web service */
  base_url: string
  /** standard headers to provide in all transport requests */
  headers?: Headers
  /** whether to verify ssl certs or not. Defaults to true */
  verify_ssl: boolean
  /** request timeout in seconds. Default to 30 */
  timeout: number
  /** encoding override */
  encoding?: string | null
  /** agent tag to use for the SDK requests */
  agentTag: string
}

/**
 * Transport plug-in interface
 */
export interface ITransport {
  /**
   * HTTP request function for atomic, fully downloaded responses
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns typed response of `TSuccess`, or `TError` result
   */
  request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>

  /**
   * HTTP request function for a streamable response
   * @param callback that receives the stream response and pipes it somewhere
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns `T` upon success
   * @throws `ISDKErrorResponse` on failure
   */
  stream<T>(
    callback: (readable: Readable) => Promise<T>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<T>

}
```

**Note**: The latest version of these interfaces can always be found in [transport.ts](typescript/looker/rtl/transport.ts)

The `ITransportSettings` interface shows the default properties for all HTTP requests and can also be used to override 
request settings for an individual HTTP request.

The `ITransport` interface describes the two primary HTTP request methods. `request<TSuccess, TError>` is for an 
atomically completed HTTP request and response, and `stream<T>` is for streaming an HTTP response result from the 
describe request.

#### Request parameters

In the `request` and `stream` methods described above:

- `method` is the HTTP method for the request. Typically, this will be GET, PUT, POST, PATCH or DELETE.
- `path` is either a fully specified url like `https://my.server.com/app/path?q=foo` or a relative path like `/users`.
 If the path is a full url, no adjustments to the request path are made. If a relative path is specified, the path may
 be modified internally to the request method based on other parameters (such as the authenticator) being passed in.
- `queryParams` is a dictionary typically of the form `[name:value]`. Nullable types are allowed by the run-time will
 automatically strip any optionally null values from the HTTP query string. The `value` is converted to a string and 
 URI encoded, so **callers to the request methods should not encode the values in the dictionary**.   
- `body` is a data structure that will be converted to JSON for the HTTP body param, unless it is a `string` type.
 For `string` values, the body will be considered `application/x-www-form-urlencoded`.
- `authenticator` is a callback or lambda function that accepts the request properties for the constructed URL as an
argument and returns a modified set of request properties that includes authorization information for the request. 
If an `authenticator` is not provided for a request, no special treatment of the HTTP url is performed. If an
`authenticator` **is** specified for a request, the HTTP url for that particular request will be:
  - `base_url` (from `ITransportSettings`) `+`
  - `api_version` (from the SDK method class) `+`
  - `path` from the request parameter
- `options` is a set of override values of `ITransportSettings` (typically, a longer timeout value or setting 
`verify_ssl` to `false`) for a specific request

### AuthSession implementations

When the codegen project began, there was one method of authenticating for Looker API requests, which was providing the 
API credentials `client_id` and `client_secret` to the API. This authentication support is typically implemented in a class
called `AuthSession`. Due to the complexities of Node vs. Browser implementations and authentication methods, the reference 
implementation for the Typescript SDK is called [`NodeSession`](typescript/looker/rtl/nodeSession.ts) but for this
document we'll pretend it's called `AuthSession`.

Recent (Looker 7.6 and above) API implementations additionally offer an OAuth authentication flow for API calls. Both of these 
authentication methods should be supported by `AuthSession` implementations. The Typescript implementation for OAuth is called 
[`OAuthSession`](typescript/looker/rtl/oauthSession.ts)

There will be additional authentication methods in future Looker releases, but they should follow very similar patterns
to the two above methods.

What all `AuthSession` implementations have in common is:

- the use of an authorization token (typically added into a request's properties by the `authentication` callback) to 
 authenticate the API user's request
- the session will track whether the authorization token is expired or not. If it is expired, the session will 
automatically re-authenticate the API user by reading the necessary credential information from `readConfig()`, "logging"
the user back in, discarding those retrieved credentials and saving the new authorization token for subsequent API requests

#### Automatic authentication

The first time an API request is made via an SDK method, if the SDK session is not currently authenticated, it will be 
automatically logged in, the authorization token will be added to the HTTP request, and the SDK method request will be 
made.

#### Important AuthSession methods

The `getToken()` method must be implemented, because that is the crux of authorizing API usage.

The `authenticate()` method must be implemented, because that adds the authorization information into an API request.

Depending on the run-time scenario for the SDK, the `login([sudoUserId])` and `logout()` methods may not be required. 
e.g., For several Browser-based implementations of the Typescript SDK like same origin requests or as a Looker extension, the
run-time environment can provide API authentication support without `login()` and `logout()` being required.

## Code generator

### Prologues and Epilogues

### Strong typing

### Methods

### Models

### Streams

### Code reformatting

## Tests

### Unit tests

### Functional tests

## Packaging

### Package configuration

### Deployment scripts

