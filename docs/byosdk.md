# Build Your Own SDK

_How to build a new Language SDK with Looker's SDK codegen project_

## Overview

The high-level steps for building a new Language SDK include:

1. Create the language/platform [run-time library](#run-time-library) (RTL)

1. Create the Language SDK [code generator](#code-generator) by descending from
   [codeGen.ts](../packages/sdk-codegen/src/codeGen.ts) or perhaps the
   [TypeScript generator](../packages/sdk-codegen/src/typescript.gen.ts) or [Python generator](../packages/sdk-codegen/src/python.gen.ts)

1. Create [unit](#unit-tests) and [functional](#functional-or-integration-tests) tests

1. Complete the configuration of items for [CI/CD](#cicd) (where applicable)

When implementing the syntax and features for the new language SDK, keep in mind the principles described in the
[Codegen rationale](rationale.md) documentation:

- [consistency](rationale.md#consistency),
- [discoverability](rationale.md#discoverability), and
- [correctness](rationale.md#correctness).

Most examples in this document will use the TypeScript SDK, which is typically our lead language SDK the other SDKs
follow. The other language SDK implementations found in this repository will have similarly named or designed classes.

## Run-time Library

The Run-Time Library (RTL) is most of the work when building a new SDK. When an SDK has a general-purpose runtime
that's designed to handle authenticated REST API requests automatically, the methods and models that implement a particular
API become very concise, which simplifies the code generator.

An important feature of these SDKs is the support for [multiple API versions in the same SDK](/README.md#multi-api-support-with-looker-72-and-later).
This feature greatly aids iterative client-side code migration from an older SDK version to a new SDK version.
Only the files generated from a versioned OpenApi specification will indicate which version of the API they consume, and
all generated files must use exactly the same RTL code.

### Configuration support

Any method of secure retrieval of API credentials and server locations can be supported by adopting the configuration
provider pattern used by the reference SDKs. To support quickly getting started with an SDK, the existing SDKs support
`.ini` file style configuration both for [configuring the code generator](../README.md#configuring-lookerini) and as a
default configuration file.

All SDKs implement something like a `readConfig() -> [String: String]` method that can be overridden to customize how
to determine configuration values. See [securing your SDK credentials](../README.md#securing-your-sdk-credentials) for more information
on this topic, including links to `readConfig()` examples.

The TypeScript SDK configuration support is in [`apiSettings.ts`](../packages/sdk-rtl/src/apiSettings.ts).

Once the RTL can read the configuration values for `base_url` and API credentials, the HTTP request processor and
`AuthSession` implementation work can begin.

If the Language SDK supports environment variable, configuration values can also be set via
[environment variables](../README.md#environment-variable-configuration).
[Precedence rules](../README.md#configuration-variable-precedence) should also be implemented.

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

**Note**: The latest version of these interfaces can always be found in [transport.ts](../packages/sdk-rtl/src/transport.ts)

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

  - If the path is a full url, the request path does not change.
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
  `verify_ssl` to `false`) for a specific request.
  - `agentTag` is a string that identifies the SDK language and SDK version. Pass the tag with the `x-looker-appid` header.

The value for AgentTag is assigned in TypeScript with the following:

```ts
export const agentPrefix = 'TS-SDK'
export const LookerAppId = 'x-looker-appid'
...
this.authSession.settings.agentTag = `${agentPrefix} ${lookerVersion}.${this.apiVersion}`
```

Where `lookerVersion` is the version of Looker (like 23.18) and `apiVersion` is (currently) `4.0` ([Note: API 3.x has been removed](https://cloud.google.com/looker/docs/api-3x-deprecation)).

This results in the agentTag appearing like `TS-SDK 22.6.4.0`.

Additional attributes can be added to the agent tag by separating them with semicolons. (`;`)

#### Processing requests

The `rawRequest()` implementation:

- constructs an HTTP request based on the properties passed into it, and returns the result of the response
without any type conversion or error handling
- sets the `ok` property to `true` if successful or `false` if the request fails.

The `request()` implementation:

- sets the error status and data of the SDKResponse structure if an error occurs
- sets the success status and data of an SDKResponse structure if the request succeeds
- for successful requests, the response body is deserialized into the type indicated for the success value

The `stream()` implementation:

- throws an error if a request error occurs
- passes the streamable HTTP response to the stream parameter of the method
- for successful requests, the response body is deserialized into the type indicated for the success value

Here's a TypeScript code sample for streaming the download of a query's CSV result:

```ts
  const request: IRequestRunInlineQuery = {
    body: {
      client_id: q.client_id || undefined,
      column_limit: q.column_limit || undefined,
      dynamic_fields: q.dynamic_fields || undefined,
      fields: q.fields || undefined,
      fill_fields: q.fill_fields || [],
      filter_config: q.filter_config || undefined,
      filter_expression: q.filter_expression || undefined,
      filters: q.filters,
      limit: limit.toString(10),
      model: q.model!,
      pivots: q.pivots || undefined,
      query_timezone: q.query_timezone || undefined,
      row_total: q.row_total || undefined,
      sorts: q.sorts || [],
      subtotals: q.subtotals || undefined,
      total: typeof q.total !== 'undefined' ? q.total : false,
      view: q.view!,
      vis_config: q.vis_config || undefined,
      visible_ui_sections: q.visible_ui_sections || undefined,
    },
    result_format: 'csv',
  }
  const csvFile = './query.csv'
  const writer = fs.createWriteStream(csvFile)
  await sdk.stream.run_inline_query(async (readable: Readable) => {
    return new Promise<any>((resolve, reject) => {
      readable
        .pipe(writer)
        .on('error', reject)
        .on('finish', resolve)
    })
  }, request)
```

#### Request parameter encoding

This section discusses how parameters should be processed by the run-time **before** submitting the HTTP request to the endpoint.

#### Path parameters

- include all path parameters
- url-encode the values for a path containing variables e.g., `/users/{user_id}`

#### Query parameters

- url-encode all values
- date values should be formatted in UTC time format like "2020-03-15T13:16:34.692-07:00"
- skip `null` or `undefined` values

#### Body object

- include all required properties (this is typically enforced by the declared method's interface)
- skip properties that are optional and `null` or `undefined`

### AuthSession implementations

When the codegen project began, there was one method of authenticating for Looker API requests, which was providing the
API credentials `client_id` and `client_secret` to the API. `AuthSession` is commonly the name of this class.
Due to the complexities of Node vs. Browser implementations and authentication methods, the reference
implementation for the TypeScript SDK is called [`NodeSession`](../packages/sdk-rtl/src/nodeSession.ts) but for this
document we'll pretend it's called `AuthSession`.

Recent (Looker 7.6 and above) API implementations additionally offer an OAuth authentication flow for API calls. Both
API3 credentials and OAuth2 authentication methods should be supported by `AuthSession` implementations. There will be
additional authentication methods in future Looker releases, but they should follow very similar patterns to these methods.

What all `AuthSession` implementations have in common is:

- the use of an authorization token (typically added into a request's properties by the `authentication` callback) to
  authenticate the API user's request
- the session tracks authorization token expiration. If it is expired, the session automatically re-authenticates the
  API user by reading the necessary credential information from `readConfig()` then logs the user back in, discards
  those retrieved credentials, and saves the new authorization token for subsequent API requests.

**NOTE**: The token expiration tracking should be set for 10 - 15 seconds before the indicated token expiration period
to ensure the token for any API request is always active.

#### Automatic authentication

The first time an SDK method makes an API request, the SDK's `AuthSession` automatically logs in for the API user and
adds the authorization token will be added to the HTTP request, then the SDK completes the method request.

Similarly, the SDK also automatically refreshes tokens when they are about to expire if an SDK request is near
the expiration period.

#### Important AuthSession methods

The `authenticate()` method must be implemented, because that adds the authorization information (token) into an API request.

The `getToken()` method must be implemented, because that is the crux of authorizing API usage. There are many ways to
create or retrieve an API authorization token, but typically the `Authorization` header of the request should use this
value as a `Bearer` token.

The `login([sudoUserId])` and `logout()` methods may not be required for a given SDK run-time scenario.
e.g., for several Browser-based implementations of the TypeScript SDK such as same origin requests or as a Looker
extension, the run-time environment can provide API authentication support without requiring `login()` and `logout()`.

When an SDK supports significantly different runtime behavior, use a different `AuthSession` implementation.
For example, the TypeScript SDK has:

- [`CSRFSession`](../packages/sdk-rtl/src/CSRFSession.ts) for browser-based same-origin usage
- [`BrowserSession`](../packages/sdk-rtl/src/browserSession.ts) for browser-based CORS usage
- [`NodeSession`](../packages/sdk-rtl/src/nodeSession.ts) for node-based usage
- [`OAuthSession`](../packages/sdk-rtl/src/oauthSession.ts) for OAuth2-based usage
- [`ProxySession`](../packages/sdk-rtl/src/proxySession.ts) for proxy-based usage

## Code generator

The code generator "template" is written in TypeScript. The `ICodegen` interface (currently found at the bottom of [`sdkModels.ts`](../packages/sdk-codegen/src/sdkModels.ts))
describes the properties and methods used to generate an API language binding for an SDK.

[`codeGen.ts`](../packages/sdk-codegen/src/codeGen.ts) is the base implementation of all code generators, and is partially
abstract. Specific generators must override these abstract methods.

### Prologues and Epilogues

Source code files typically have imports and source code comments at the start of a file, and some type of closure or
clean-up code at the end.

The various **Prologue** properties are for the standard SDK methods, streaming, and model (type/structure/class) files.

### Strong typing

We strongly prefer strong typing for language SDKs, as mentioned in [correctness](rationale.md#correctness).

Some languages may not support strong typing or generics. In that case, we recommend using name/value pairs and
verifying the names against the endpoint's specification at run-time before submitting the HTTP request to the endpoint.

### Methods

The `IMethod` interface in [`sdkModels.ts`](../packages/sdk-codegen/src/sdkModels.ts) describes the properties and methods
to use for generating a method declaration.

REST API endpoints return responses that vary in type. There is always at least one _success_ and one _error_ response type.
Many endpoints can return multiple _success_ and _error_ response types.

For languages that have union types, method declarations should use union types. The `IMethod.responses` is available for iteration.

Many languages do not have union types. In that circumstance, the `IMethod.primaryResponse` is the _success_ return type.

`IMethod.errorResponses` is an array of all _error_ responses for that method.

`IMethod.responseModes` is a set of response types ('binary', 'string', 'unknown'). Use this property to generate the
comment indicating whether the method returns a binary response. When a method returns a binary response, the run-time
request processor **must not** convert the response to `UTF8`.

`IMethod.allParams` returns the parameters for the function in declaration order, with required parameters followed
by optional parameters.

If the language doesn't have "named parameter" support the generator supports generation of
[request structures](rationale.md#request-structures). TypeScript is a language without named parameter support, so a
request interface is created for methods with complex arguments. The code generator's `needRequestTypes` property should
be set to `true` in this circumstance. In the [TypeScript generator](../packages/sdk-codegen/src/typescript.gen.ts),
the `methodHeaderDeclaration` function has this line:

```ts
const requestType = this.requestTypeName(method)
```

If the method requires a request type and `needRequestTypes` is `true`, the [`codeGen.ts`](../packages/sdk-codegen/src/codeGen.ts)
implementation of `requestTypeName()` will get or create the existing request type and return its name as the result of
the function. Refer to the TypeScript generator for more information if your language needs a request type.

See the TypeScript SDK [`methods.ts`](../packages/sdk/src/sdk/4.0/methods.ts) for method declaration examples.

### Models

The `IType` interface in [`sdkModels.ts`](../packages/sdk-codegen/src/sdkModels.ts) describes the properties and methods
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
          // TODO figure out this bizarre string template error either in IntelliJ or TypeScript
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

See the TypeScript SDK [`models.ts`](../packages/sdk/src/sdk/4.0/models.ts) for type/structure declaration examples.

### Streams

Streaming declarations are basically the same as [Methods](#methods), but with a parameter for a streaming callback.

See the TypeScript SDK [`streams.ts`](../packages/sdk/src/sdk/4.0/streams.ts) for streaming method examples.

### API version tracking

The `constants` file (e.g. [`constants.ts`](../packages/sdk-rtl/src/constants.ts)) for an SDK has the Looker API version and Looker release version as variables. The update mechanism
for these variables is in [`reformatter.ts`](../packages/sdk-codegen-scripts/src/reformatter.ts).

#### Code reformatting

Some languages have command-line code reformatters readily available. If your SDK language has a code reformatter,
define it in [`reformatter.ts`](../packages/sdk-codegen-scripts/src/reformatter.ts) and the generated source code will automatically
be reformatted when the code generation is finishing up.

## Tests

A minimum testing threshold must be met before a Language SDK can be accepted. This section describes the tests to
implement for a Language SDK.

Files that support testing scenarios can be found in the [`test`](../test) folder.

- [`data.yml`](../test/data.yml) contains test data that can be used to create functional tests.
- [`data.yml.json`](../test/data.yml) is automatically translated from `data.yml`.
- [`openApiRef.json`](../test/openApiRef.json) is a sample OpenAPI 3.x json-formatted Looker API specification
- [`swaggerRef.json`](../test/swaggerRef.json) is a sample OpenAPI 2.x (Swagger) json-formatted Looker API specification

### Unit tests

Unit tests are tests that do not require a running API server.

#### run-time library tests

- SDK configuration values

  - reading `.ini` sections by name
  - parsing `true` and `false` values, e.g.

```kotlin
/**
 * strip quotes from the value if the same "quote" character is the start and end of the string
 */
fun unQuote(value: String?): String {
    if (value === null) return ""
    if (value.isBlank()) return ""
    val quote = value.substring(0, 1)
    if ("\"`'".contains(quote)) {
        if (value.endsWith(quote)) {
            // Strip matching characters
            return value.substring(1, value.length - 1)
        }
    }
    return value
}

fun isTrue(value: String?): Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "true" || low == "1" || low == "t" || low == "y" || low == "yes"
}

fun isFalse(value: String?): Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "false" || low == "0" || low == "f" || low == "n" || low == "no"
}

fun asBoolean(value: String?): Boolean? {
    if (isTrue(value)) return true
    if (isFalse(value)) return false
    return null
}
```

- `readConfig()` overrides

- [HTTP parameter encoding](#request-parameter-encoding)

- [HTTP request processing](#request-processing)

#### generator tests

- method declaration

- stream declaration

- type declaration

- required parameters

- optional parameters

See [`sdkModels.spec.ts`](../packages/sdk-codegen/src/sdkModels.spec.ts) and
[`python.gen.spec.ts`](../packages/sdk-codegen/src/python.gen.spec.ts) for examples.

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

See [`methods.spec.ts`](../packages/sdk/src/test/methods.spec.ts) and
[`test_methods.py`](/python/tests/integration/api40/test_methods.py) examples.

## CI/CD

Detailed plans for Continuous Integration/Continuous Deployment (CI/CD) are still being established but CI will likely
use Travis for this repository.

Both CI and CD have prerequisites that are described below.

### Release requirements

The following items must succeed for an SDK update to be ready for release:

- `yarn wipe && yarn gen`
- `bin/smoke`

The monthly release of Looker always has API changes. Updates for the supported SDKs must pass the two steps above before
publishing to their respective package managers.

### Smoke testing

When the Language SDK test suite is complete, add all or some parts of the tests to the [`smoke`](../bin/smoke) test script.
This way, tests for the Language SDK will be part of the entire SDK Codegen test suite.

The smoke tests require the test/reference instance of Looker configured in `looker.ini` to be up and running.

### Packaging

Most language platforms include a scriptable way to use their package manager. Many language platforms also have
multiple package managers. Choose the package manager that is best supported, most broadly used, and supports the
latest versions of the language.

If a "standard" package manager exists for the platform/language, deployment to that package manager must be supported
before the Language SDK can be placed into _open beta_. For example, the TypeScript SDK is available via the
[Node Package Manager](https://www.npmjs.com/package/@looker/sdk) and
the Python SDK is on [PyPi](https://pypi.org/project/looker-sdk/).

A script or command to deploy to the relevant package manager must be provided for the Language SDK.

### Package configuration

The package versioning information must contain the Looker Release version.

The package needs a `README` that:

- introduces the SDK
- describes how to get started
- links to the SDK-Codegen repository
- indicate an MIT or Apache license. Package managers often derive licensing information automatically by examining the
  origin of the package. (SDK-Codegen has an MIT license.)

- Earn bonus points by linking to additional SDK examples.

Packages must use [semantic versioning](https://docs.npmjs.com/about-semantic-versioning). `Alpha` and `beta` tags can be used in versioning.

### Deployment scripts

Credential stores for deployment may vary so this document doesn't recommend a pattern, but each package manager's
credentials must be secured and **never** checked in to this repository.

Deployment scripts should be able to retrieve the secured credentials and automate publication of a package. This script
is a prerequisite for Continuous Deployment.

An SDK must pass the [release requirements](#release-requirements) before it can be released.

## Continuous Deployment

CD needs more planning.
