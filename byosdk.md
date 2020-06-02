# Build Your Own SDK

_How to build a new language SDK with Looker's SDK codegen project_

## Overview

The high-level steps for building a new language SDK include:

1. Create the language/platform [run-time library](#run-time-library) (RTL)

1. Create the [code generator](#code-generator) by descending from [codeGen.ts](packages/sdk-codegen/src/codeGen.ts) or one of the existing
   generators like [Typescript](packages/sdk-codegen/src/typescript.gen.ts) or [Python](packages/sdk-codegen/src/python.gen.ts)

1. Create [unit](#unit-tests) and [functional](#functional-or-integration-tests) tests

1. Create package manager [deployment scripts](#deployment-scripts) (where applicable)

When implementing the syntax and features for the new language SDK, keep in mind the principles described in the
[Codegen rationale](rationale.md) documentation:

- [consistency](rationale.md#consistency),
- [discoverability](rationale.md#discoverability), and
- [correctness](rationale.md#correctness).

An important feature of these SDKs is the support for [multiple API versions in the same SDK](README.md#multi-api-support-with-looker-72-and-later).
This feature greatly aids iterative client-side code migration from an older SDK version to a new SDK version.
The RTL for both API versions will be identical. Only the files generated from a versioned OpenApi specification
will indicate which version of the API they consume, and all generated files use exactly the same RTL code.

Most examples in this document will use the Typescript SDK, which is typically our lead language SDK the other SDKs
follow. The other language SDK implementations found in this repository will have similarly named or designed classes.

## Run-time Library

The Run-Time Library (RTL) is most of the work when building a new SDK. When an SDK has a general-purpose runtime
that's designed to handle authenticated REST API requests automatically, the methods and models that implement a particular
API become very concise, which simplifies the code generator.

### Configuration support

Any method of secure retrieval of API credentials and server locations can be supported by adopting the configuration
provider pattern used by the reference SDKs. To support quickly getting started with an SDK, the existing SDKs support
`.ini` file style configuration both for [configuring the code generator](README.md#configuring-lookerini) and as a
default configuration file.

All SDKs implement something like a `readConfig() -> [String: String]` method that can be overridden to customize how
to determine configuration values. See [securing your SDK credentials](README.md#securing-your-sdk-credentials) for more information
on this topic, including links to `readConfig()` examples.

The Typescript SDK configuration support is in [`apiSettings.ts`](packages/sdk/src/rtl/apiSettings.ts).

Once the RTL can read the configuration values for `base_url` and API credentials, the HTTP request processor and
`AuthSession` implementation work can begin.

**Note**: By design, SDKs never retain API credentials in runtime memory, but only use them when required to authenticate.

### Request processing

All SDKs implement a `transport` interface or protocol that has most, if not all, of the following characteristics:

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
  [key: string]: any
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
 * Untyped basic HTTP response type for "raw" HTTP requests
 */
export interface IRawResponse {
  /** ok is `true` if the response is successful, `false` otherwise */
  ok: boolean
  /** HTTP response code */
  statusCode: number
  /** HTTP response status message text */
  statusMessage: string
  /** MIME type of the response from the HTTP response header */
  contentType: string
  /** The body of the HTTP response, without any additional processing */
  body: any
}

/**
 * Transport plug-in interface
 */
export interface ITransport {
  /**
   * HTTP request function for atomic, fully downloaded raw HTTP responses
   *
   * Note: This method returns the result of the HTTP request without any error handling
   *
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns typed response of `TSuccess`, or `TError` result
   */
  rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse>

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

**Note**: The latest version of these interfaces can always be found in [transport.ts](packages/sdk/src/rtl/transport.ts)

The `ITransportSettings` interface shows the default properties for all HTTP requests and can also be used to override
request settings for an individual HTTP request.

The `IRawResponse` interface shows the return value from lowest-level request processor `rawRequest()`. It does not handle
any errors or type conversion, but returns the necessary information for error handling and automatic type conversion of
the response.

The `ITransport` interface describes the two primary HTTP request methods. `request<TSuccess, TError>` is for an
atomically completed HTTP request and response, and `stream<T>` is for streaming an HTTP response result from the
request.

#### Request parameters

In the `ITransport` function parameters shown above:

- `method` is the HTTP method for the request. Typically, this will be `GET`, `PUT`, `POST`, `PATCH` or `DELETE`.

- `path` is either a fully specified url like `https://my.server.com/app/path?q=foo` or a relative path like `/users`.

  - If the path is a full url, the request path is not changed.
  - If the path is relative, the path may change internal to the request processor internally to the request method
    based on other parameters (such as the authenticator) being passed in.

- `queryParams: Values` is a dictionary typically of the form `[name:value]`. Nullable types are allowed. The run-time will
  automatically strip any optionally null values from the HTTP query string. The `value` is converted to a string and
  URI encoded, so **callers to the request methods should not encode the values in the dictionary**.
- `body` is a data structure typically converted to JSON for the HTTP body param, unless the provided value is a `string` type.
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
API credentials `client_id` and `client_secret` to the API. `AuthSession` is commonly the name of this class.
Due to the complexities of Node vs. Browser implementations and authentication methods, the reference
implementation for the Typescript SDK is called [`NodeSession`](packages/sdk/src/rtl/nodeSession.ts) but for this
document we'll pretend it's called `AuthSession`.

Recent (Looker 7.6 and above) API implementations additionally offer an OAuth authentication flow for API calls. Both of 
these authentication methods should be supported by `AuthSession` implementations. There will be additional authentication 
methods in future Looker releases, but they should follow very similar patterns to the two above methods.

What all `AuthSession` implementations have in common is:

- the use of an authorization token (typically added into a request's properties by the `authentication` callback) to
  authenticate the API user's request
- the session tracks authorization token expiration. If it is expired, the session automatically re-authenticates the 
  API user by reading the necessary credential information from `readConfig()` then logs the user back in, discards
  those retrieved credentials, and saves the new authorization token for subsequent API requests.

#### Automatic authentication

The first time an SDK method makes an API request, the SDK's AuthSession automatically logs in for the API user and
adds the authorization token will be added to the HTTP request, then the SDK completes the method request.

Similarly, the SDK also automatically refreshes expired tokens.

#### Important AuthSession methods

The `authenticate()` method must be implemented, because that adds the authorization information (token) into an API request.

The `getToken()` method must be implemented, because that is the crux of authorizing API usage. There are many ways to
create or retrieve an API authorization token, but typically the `Authorization` header of the request should use this
value as a `Bearer` token.

The `login([sudoUserId])` and `logout()` methods may not be required for a given SDK run-time scenario.
e.g., for several Browser-based implementations of the Typescript SDK such as same origin requests or as a Looker
extension, the run-time environment can provide API authentication support without requiring `login()` and `logout()`.

When an SDK supports significantly different runtime behavior, use a different `AuthSession` implementation.
For example, the Typescript SDK has:

- [`BrowserSession`](packages/sdk/src/rtl/browserSession.ts) for browser-based same-origin usage
- [`CorsSession`](packages/sdk/src/rtl/corsSession.ts) for browser-based CORS usage
- [`NodeSession`](packages/sdk/src/rtl/nodeSession.ts) for node-based usage
- [`OAuthSession`](packages/sdk/src/rtl/oauthSession.ts) for OAuth2-based usage
- [`ProxySession`](packages/sdk/src/rtl/proxySession.ts) for proxy-based usage

## Code generator

The code generator "template" is written in Typescript. The `ICodegen` interface (currently found at the bottom of [`sdkModels.ts`](packages/sdk-codegen/src/sdkModels.ts))
describes the properties and methods used to generate an API language binding for an SDK.

[`codeGen.ts`](packages/sdk-codegen/src/codeGen.ts) is the base implementation of all code generators, and is partially
abstract. Specific generators must override these abstract methods.

### Prologues and Epilogues

Source code files typically have imports and source code comments at the start of a file, and some type of closure or 
clean-up code at the end.

The various **Prologue** properties are for the standard SDK methods, streaming, and model (type/structure/class) files.

### Strong typing

We strongly prefer strong typing for language SDKs, as mentioned in [correctness](rationale.md#correctness).

### Methods

The `IMethod` interface in [`sdkModels.ts`](packages/sdk-codegen/src/sdkModels.ts) describes the properties and methods 
to use for generating a method declaration.
 
REST API endpoints return responses that vary in type. There is always at least one *success* and one *error* response type.
Many endpoints can return multiple *success* and *error* response types.

For languages that have union types, method declarations should use union types. The `IMethod.responses` is available for iteration.

Many languages do not have union types. In that circumstance, the `IMethod.primaryResponse` is the *success* return type.

`IMethod.errorResponses` is an array of all *error* responses for that method.

`IMethod.responseModes` is a set of response types ('binary', 'string', 'unknown'). Use this property to generate the
comment indicating whether the method returns a binary response. When a method returns a binary response, the run-time 
request processor **must not** convert the response to `UTF8`.

`IMethod.allParams` returns the parameters for the function in declaration order, with required parameters followed 
by optional parameters.

If the language doesn't have "named parameter" support the generator supports generation of 
[request structures](rationale.md#request-structures). Typescript is a language without named parameter support, so a
request interface is created for methods with complex arguments. The code generator's `needRequestTypes` property should
be set to `true` in this circumstance. In the [Typescript generator](packages/sdk-codegen/src/typescript.gen.ts), 
the `methodHeaderDeclaration` function has this line:

```ts
const requestType = this.requestTypeName(method)
```

If the method requires a request type and `needRequestTypes` is `true`, the [`codeGen.ts`](packages/sdk-codegen/src/codeGen.ts) 
implementation of `requestTypeName()` will get or create the existing request type and return its name as the result of
the function. Refer to the Typescript generator for more information if your language needs a request type.

See the Typescript SDK [`methods.ts`](packages/sdk/src/sdk/4.0/methods.ts) for method declaration examples. 

### Models

The `IType` interface in [`sdkModels.ts`](packages/sdk-codegen/src/sdkModels.ts) describes the properties and methods 
to use for generating a type declaration.

Type declarations are less complex than model declarations. Once the general template for type declarations is defined,
the `typeMap` function that implements translations of OpenAPI types into the SDK language needs to be written.

Here's an example `typeMap` for Kotlin:

```ts
  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = this.nullStr
    const ktTypes: Record<string, IMappedType> = {
      boolean: { default: mt, name: 'Boolean' },
      byte: { default: mt, name: 'binary' },
      date: { default: mt, name: 'Date' },
      datetime: { default: mt, name: 'Date' },
      double: { default: mt, name: 'Double' },
      float: { default: mt, name: 'Float' },
      int32: { default: mt, name: 'Int' },
      int64: { default: mt, name: 'Long' },
      integer: { default: mt, name: 'Int' },
      number: { default: mt, name: 'Double' },
      object: { default: mt, name: 'Any' },
      password: { default: mt, name: 'Password' },
      string: { default: mt, name: 'String' },
      uri: { default: mt, name: 'UriString' },
      url: { default: mt, name: 'UrlString' },
      void: { default: mt, name: 'Void' },
    }

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      switch (type.className) {
        case 'ArrayType':
          return { default: this.nullStr, name: `Array<${map.name}>` }
        case 'HashType':
          // TODO figure out this bizarre string template error either in IntelliJ or Typescript
          // return {name: `Map<String,${map.name}>`, default: '{}'}
          if (map.name === 'String') map.name = 'Any' // TODO fix messy hash values
          return { default: this.nullStr, name: 'Map<String' + `,${map.name}>` }
        case 'DelimArrayType':
          return { default: this.nullStr, name: `DelimArray<${map.name}>` }
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return (
        ktTypes[type.name] || { default: this.nullStr, name: `${type.name}` }
      )
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
```

See the Typescript SDK [`models.ts`](packages/sdk/src/sdk/4.0/models.ts) for type/structure declaration examples. 

### Streams

Streaming declarations are basically the same as [Methods](#methods), but with a parameter for a streaming callback. 

See the Typescript SDK [`streams.ts`](packages/sdk/src/sdk/4.0/streams.ts) for streaming method examples. 

### API version tracking

The `constants` file (e.g. [`constants.ts`](packages/sdk/src/rtl/constants.ts)) for an SDK has the Looker API version and Looker release version as variables. The update mechanism
for these variables is in [`reformatter.ts`](packages/scripts/src/reformatter.ts).

#### Code reformatting

Some languages have command-line code reformatters readily available. If your SDK language has a code reformatter,
define it in [`reformatter.ts`](packages/scripts/src/reformatter.ts) and the generated source code will automatically
be reformatted when the code generation is finishing up.

## Tests

TODO

Files that support testing scenarios can be found in the [`test`](test) folder.

- [`data.yml`](test/data.yml) contains test data that can be used to create functional tests. 
- [`data.yml.json`](test/data.yml) is automatically translated from `data.yml`.
- [`openApiRef.json`](test/openApiRef.json) is a sample OpenAPI 3.x json-formatted Looker API specification
- [`swaggerRef.json`](test/swaggerRef.json) is a sample OpenAPI 2.x (Swagger) json-formatted Looker API specification

### Unit tests

Unit tests should be written for various aspects of the language SDK.
 
#### run-time library tests

- SDK configuration values
  - reading `.ini` sections by name
  - parsing `true` and `false` values
  - `readConfig()` overrides
  
- HTTP parameter encoding

- HTTP request processing

#### generator tests

- method declaration

- stream declaration

- type declaration

- required parameters

- optional parameters

See [`sdkModels.spec.ts`](packages/sdk-codegen/src/sdkModels.spec.ts) and 
[`python.gen.spec.ts`](packages/sdk-codegen/src/python.gen.spec.ts) for examples.

### Functional or integration tests

Functional tests should include representative methods from the API. For Looker SDK tests, a `looker.ini` must be in
the root of the repository, configured for a running Looker server. 

- GET functions

- PUT functions

- POST functions

- PATCH functions

- DELETE functions

- search functions

- binary response types

- streaming (if applicable)

See [`methods.spec.ts`](packages/sdk/src/test/methods.spec.ts) and 
[`test_methods.py`](python/tests/integration/api40/test_methods.py) examples.

### Smoke testing

When your test suite is complete, add all or some parts of it to the [`smoke`](bin/smoke) test script. This way, tests
for your SDK will be part of the entire SDK Codegen test suite.

## Packaging

TODO

### Package configuration

TODO

### Deployment scripts

TODO
