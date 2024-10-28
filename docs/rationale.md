# Rationale for the SDK code generator

With the number of Open-Source Swagger and [OpenAPI](https://github.com/OAI/OpenAPI-Specification) code generators already available for a wide variety of languages, a reasonable question to ask is, "Why is Looker creating yet another code generator?"

This document will attempt to answer that question by providing Looker's goals and perspectives on providing rich language-specific [SDKs](https://en.wikipedia.org/wiki/Software_development_kit) (Software Development Kit) that are a pleasure to work with, and easy to support.

## Support for multiple SDK languages

The Looker API is used with a wide variety of languages. Data scientists may like using `R` or `Python` while other customers may want to use `TypeScript`, `JavaScript`, `Java`, or `C#`.

At the time of this writing, the SDK code generator only supports `Python` and `TypeScript` so the examples used will be based on those languages.

When looking at the languages supported by the existing code generators, we found the patterns and quality of the generated code varied widely. As Looker increases the number of supported client-language SDKs, these differences would become unsupportable.

The three primary goals for the SDKs Looker provides are: **consistency**, **discoverability**, and **correctness**.

When determining our code generation pattern, we observed that most programming languages have common characteristics:

- classes can be extended
- methods take arguments
- arguments
  - can be optional or undefined
  - can have default values
- structures and/or interfaces

Combining these observations with the clear constraints of RESTful APIs makes a clean solution to generating code for multiple target languages possible.

### Consistency

Providing a consistent implementation pattern across all supported languages helps us iterate on the [principle of least astonishment](https://softwareengineering.stackexchange.com/questions/187457/what-is-the-principle-of-least-astonishment). Additionally, a reference implementation in one supported language can help a developer quickly port that implementation to their preferred languages because the idioms and code will be as similar as possible.

Looker's API methods don't have any method-specific header or cookie values, so only `path`, `body`, and `query` parameters are created by this tool. (If these values are required by another specification, there is only one place in each language generator that requires modification.)

The SDK method signatures declare the parameters for the methods in a consistent order, with the set of all required parameters coming before the optional parameters. This means that parameters will be declared in the following order for each method, if that type of parameter exists:

- required
  - path
  - body
  - query
- optional
  - path
  - body
  - query

Prioritizing the parameter declarations minimizes the number of arguments needing to be passed to the method since optional arguments can be omitted or assigned default values by the method (where appropriate).

The Looker API specification provides a consistent naming scheme for the methods. For example, functional categories of methods are prefixed with `all`, `delete`, `create`, `update`, or `search`.

Method names are preserved from the specification's `operationId`. No conversion to `CamelCase` or `snake_case` is made by the generator. Even though TypeScript does not usually have `snake_case` conventions, no conversion is made, so SDK method names remain identical across languages. Furthermore, every endpoint in the specification has a unique operationId, so the method name is also unique across the entire SDK.

The Python code:

```python
me = sdk.me("id, first_name, last_name")
```

Is nearly identical to the TypeScript code:

```typescript
me = await sdk.me('id, first_name, last_name');
```

and that's a good thing.

The generated SDK methods are written to a file called `methods.<ext>`. For Python, this file is called `methods.py` and for TypeScript it's `methods.ts`.

The API structures are written to a file called `models.<ext>`. For Python, this file is called `models.py` and for TypeScript it's `models.ts`.

Whenever support is added for another language, code consistency is re-evaluated, which encourages simplicity and elegance in the generated code implementation.

#### Diverging while remaining consistent

One discovery made during the development of the code generator is that some languages (like Python) support "default named parameters" while some others (like TypeScript) do not. This means that in Python, the following code works fine:

```python
looks = sdk.search_looks(fields="id, title, description")
```

and the first iteration of the TypeScript implementation looked like this:

```typescript
looks = await sdk.search_looks(
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  'id, title, description'
);
```

Clearly, this would not be a pleasant way to make SDK calls.

To make TypeScript coding more enjoyable, methods that have more than one optional parameter (or two, if the body parameter is also present but optional), a `Request` structure is created that supports the sparse assignment of arguments. Thanks to the `IRequestSearchLooks` interface generated for TypeScript, `search_looks` can be called like this:

```typescript
looks = await sdk.search_looks({ fields: 'id,title,description' });
```

Which is **just about** as convenient as the Python pattern.

For any other future supported language that doesn't support default named parameters, this on-demand `Request` structure generation will be used.

Wherever feasible, a consistent design across languages will be retained.

### Discoverability

Code editors have grown a rich and similar feature set since the time since Delphi introduced [Code Completion](http://docwiki.embarcadero.com/RADStudio/Rio/en/Code_Completion) and Visual Studio provided [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense). Other modern code editors provide similar code assistance features, and the language patterns adopted by the SDK generator take full advantage of modern editors.

The generated SDK declares all SDK methods in a single, flattened set of methods in one class. This way, with a variable called `sdk` representing an initialized LookerSDK object, typing `sdk.` in an editor should result in seeing all of the available SDK methods. Typically, as you type in additional characters, the list of available methods will be filtered to those that match what has been typed.

Descriptions in the API specification are embedded into the generated method and models source code, making it self-documenting.

### Correctness

Strong types and generics are used for any language that supports them. This improves the coding experience by supporting the discoverability described above. Additionally, it helps prevent errors in the code that would previously have only been discovered at run-time, because compile-time (and coding-time) type checking is applied to the code as it's being written.

The Looker SDK for Python requires Python 3.7, due to the language features adopted for the code generator. A quick perusal of `methods.py` from the Python SDK package will show how types and generics are used in the Python SDK.

The Looker SDK for JavaScript is implemented in TypeScript to take advantage of strong typing to encourage correctness. Interfaces are used to describe the API method structures, so property names and requirements are verified while editing or compiling any SDK code.

## RESTful API support

The Looker API uses [RESTful](https://restfulapi.net/rest-api-design-tutorial-with-example/) principles. This greatly simplifies generating programming language source code from the API specification, due to the highly constrained runtime environment.

All methods are implemented as HTTP requests. All results are returned in HTTP responses. This means the SDK can focus on convenient and clean ways to specify the method inputs and process method outputs without having to generate complex logical constructs.

### Five core operations

Except for more esoteric REST functionality such as `HEAD` requests, all API calls are one of five HTTP methods.

- `GET` is used to retrieve a resource or resource collections.

- `PUT` is an idempotent create or update of a resource. [This comparison](https://restfulapi.net/rest-put-vs-post/) does a great job of explaining how it differs from `POST`.

- `POST` is used to create a resource. Every time you pass the same data to a `POST` method, a new resource is created.

- `PATCH` is an idempotent granular update of a resource, where only some values are being updated.

- `DELETE` is used to delete a resource.

### Five places for request data

- `Path` is for parameters that are part of the URL path for the request. e.g., for `/users/{user_id}/credentials_email`, the parameter is `user_id`. If `user_id` was 42, the request path for the API call would be `/users/42/credentials_email`.

- `Body` is for the body of the HTTP request. This is typically used for resource changes, and can contain complex structures or large amounts of data.

- `Query parameters` are the values that some after the question mark `?` on the URL. e.g., `?q=looker+sdk&lang=python` would have a query parameter called `q` with a value of `looker+sdk` and another parameter called `lang` with the value of `python`. Multiple query parameters are separated by ampersands `&`.

- `Headers` describe the HTTP request. There are [many HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers). For the Looker SDKs, the headers we are mainly interested in are `Authorization`, and chunked transfer headers.

- `Cookies` are data included in the HTTP request. [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) may also be used as an authentication method.

## Implementation patterns

We want to generate the cleanest, most concise code possible while ensuring a productive development experience. To accomplish this, the code for each SDK is divided between hand-written code that provides the general-purpose run-time functionality for the SDK (the Run-Time Library, or `RTL`), and the specification-driven generated code that uses the RTL to do all its heavy lifting.

### Hand-written run-time libraries

The RTL code provides efficient HTTP request processing, error reporting, and support for automatic request authorization via API session management.

Most of the RTL code is completely generic, but the session management/authentication code is currently specific to Looker's authentication methods. This is partly an artifact of our current efforts to migrate from Swagger 2, which didn't support authentication specifications very well, to OpenApi 3, which supports them better. As we improve our OpenAPI 3 specification for the Looker API's authentication methods, we will be able to make the authentication RTL code more specification-centric rather than Looker-centric.

The `/rtl` folder for each language SDK contains the hand-written code. The `/sdk` folder contains the code generated by this tool.

### Strong typing where possible

As mentioned in [Correctness](#correctness) above, Looker SDKs use strong types if the target programming language supports them. Sometimes this requires more recent versions of a language, as with Python 3.7. For languages that don't support type annotation, you can expect to see source comments above methods, parameters that describe the expected inputs and outputs.

### Language-powered functionality

For many languages, serialization and deserialization is directly supported. For other languages, a solution for this must be adopted or created. The generated code for the SDKs will always be designed to use these RTL methods to accomplish this to avoid bloating the generated code and obscuring its purpose. The code for an SDK method should be focused on passing the inputs and outputs of the method in and out, and nothing more. This makes the SDK easier to reason about, and easier to debug should a problem arise.

### Common, simple, securable configuration

The code generator doesn't write **any** credentials or server urls into the generated code. The RTL code contains no hard-coded credentials or server locations. Two of the supported sample patterns for providing API credentials and server location to the SDK is via an `.ini` file or environment variables. While the Looker SDK runtime **does** retain the server url and API version in memory after it's been initialized, credentials like `client_id` and `client_secret` are retrieved on demand from the plug-in based authorization method, and discarded immediately after an access token is received.

By using an `.ini` or other configuration file rather than what would typically be a source code file, it is easy and convenient to ensure that credential file is ignored by a version control system, so it will never been checked in and accidentally revealed to bad people.

Another convenience of using an `.ini` file is that every RTL provided by Looker will have sample source code to read that configuration file for authenticating the SDK.

Depending on the run-time environment for the SDK application, there may be more or less secure ways of providing credentials. That is something every implementer will need to determine for their own usage patterns. Fortunately, securing API credentials can be achieved in a variety of ways. By creating a plug-in architecture for API authentication, Looker SDKs can support any credential providing method you choose to implement.

## Using the Looker API specification

Every Looker server provides the API specification for that version of Looker. This is a JSON file, currently in Swagger 2 format. This document is used to produce the Looker SDKs.

### Specification transition

Swagger 2 has been deprecated and superceded by OpenApi 3.x. Future API tools for Looker are all based on OpenAPI 3.x. While Looker servers still produce Swagger 2.x specifications for the Looker API, an automated conversion to OpenApi 3.x is used to inform the code generation process. Until the Looker server produces OpenAPI 3.x documents directly, a third party open source tool is being used to perform the automated conversion.

This third-party tool loses some attributes during the conversion, so the SDK code generator also refers to the original Swagger 2.x specification for these few items. When Looker natively produces an OpenApi 3.x specification, this fix-up process will be retired.

## Code generation

The [Python generator](../packages/sdk-codegen/src/python.gen.ts) and [TypeScript generator](../packages/sdk-codegen/src/typescript.gen.ts) descend from a common class declared in [codeGen.ts](../packages/sdk-codegen/src/codeGen.ts). The base `CodeGen` class implements the `ICodeGen` interface, which is the contract for all the language-specific options the generator needs to support. Expect to see the internal implementation of this source change throughout the beta process as we refine the generators.

### Model declarations

The models produced by the code generator include the structures defined in the API. There are also additional structures created from the specification that are optimized for the methods to make their corresponding called to the API.

When a language SDK is generated, all references to the structures in the `models` source file are tracked, so an explicit import statement can be generated that uses the correct top-level structures in the `methods` file.

#### Standard structures from the specification

All structures in the API have source code declarations in the `models` source file. This is a direct translation of the structure into the respective language implementation.

#### Writeable structures

For methods that have a `body` parameter describing the properties for the request, if the structure in the specification has any `read-only` properties, a replacement structure that removes all `read-only` properties is defined in the `models` source file and used by the method instead. This structure is prefixed with `Write` or `IWrite` depending on the language implementation.

The API specification for `BackupConfiguration` has a read-only `can` property:

```typescript
export interface IBackupConfiguration {
  /**
   * Type of backup: looker-s3 or custom-s3
   */
  type?: string;
  /**
   * Name of bucket for custom-s3 backups
   */
  custom_s3_bucket?: string;
  /**
   * Name of region where the bucket is located
   */
  custom_s3_bucket_region?: string;
  /**
   * (Write-Only) AWS S3 key used for custom-s3 backups
   */
  custom_s3_key?: string;
  /**
   * (Write-Only) AWS S3 secret used for custom-s3 backups
   */
  custom_s3_secret?: string;
  /**
   * Link to get this item
   */
  url?: URL;
  /**
   * Operations the current user is able to perform on this object
   */
  can?: IDictionary<boolean>;
}
```

Therefore, a writeable version is created that does not have a `can` property:

```typescript
/**
 * Dynamically generated writeable type for BackupConfiguration
 */
export interface IWriteBackupConfiguration {
  /**
   * Type of backup: looker-s3 or custom-s3
   */
  type?: string;
  /**
   * Name of bucket for custom-s3 backups
   */
  custom_s3_bucket?: string;
  /**
   * Name of region where the bucket is located
   */
  custom_s3_bucket_region?: string;
  /**
   * (Write-Only) AWS S3 key used for custom-s3 backups
   */
  custom_s3_key?: string;
  /**
   * (Write-Only) AWS S3 secret used for custom-s3 backups
   */
  custom_s3_secret?: string;
}
```

#### Request structures

As mentioned in [Diverging while remaining consistent](#diverging-while-remaining-consistent) the `Request` or `IRequest` structure creation rules were described for languages that don't have support for optional named parameters. The `all_homepage_sections` endpoint has two optional parameters and no body parameter, so a request structure is created to make the optional properties individually configurable.

```typescript
/**
 * Dynamically generated request type for all_homepage_sections
 */
export interface IRequestAllHomepageSections {
  /**
   * Requested fields.
   */
  fields?: string;
  /**
   * Fields to sort by.
   */
  sorts?: string;
}
```

### Method implementations

Method signatures are produced using the parameter order described in [Consistency](#consistency) above. All API methods are generated into the same class. For the default configuration of the code generator, this class is called `LookerSDK` in TypeScript.

#### Method with standard parameters

Methods that don't cause a Request structure to be created for TypeScript end up being very similar in all languages.

These code samples are taken directly from the generated code, so they're subject to change at any time.

A generated Python method:

```python
# POST /users/{user_id}/credentials_api3 -> models.CredentialsApi3
def create_user_credentials_api3(
    self,
    # id of user
    user_id: int,
    body: Optional[models.CredentialsApi3] = None,
    # Requested fields.
    fields: Optional[str] = None
) -> models.CredentialsApi3:
    """Create API 3 Credential"""
    response = self.post(f"/users/{user_id}/credentials_api3", models.CredentialsApi3, query_params={"fields": fields}, body=body)
    assert isinstance(response, models.CredentialsApi3)
    return response
```

And the TypeScript version:

```typescript
/**
 * POST /users/{user_id}/credentials_api3 -> ICredentialsApi3}
 */
async create_user_credentials_api3(
  /**
   * @param {number} user_id id of user
   */
  user_id: number,
  /**
   * @param {Partial<ICredentialsApi3>} body
   */
  body?: Partial<ICredentialsApi3>,
  /**
   * @param {string} fields Requested fields.
   */
  fields: string = '',
  options?: Partial<ITransportSettings>,
) {
  return this.post<ICredentialsApi3, IError | IValidationError>(
    encodeURI(`/users/${user_id}/credentials_api3`),
    { fields },
    body,
    options,
  )
}
```

Each declared `TypeScript` method has one last optional parameter that can be used to override the default transport settings. Typically, the `timeout` setting is the option that will be overridden for longer-running API requests that exceed the default timeout for the SDK.

#### Method with a request object

Because Python supports default named parameter arguments, it has methods declared with simple parameter lists that use Request structures TypeScript, as shown below:

Python:

```python
# POST /query_tasks -> models.QueryTask
def create_query_task(
    self,
    body: models.WriteCreateQueryTask,
    # Row limit (may override the limit in the saved query).
    limit: Optional[int] = None,
    # Apply model-specified formatting to each result.
    apply_formatting: Optional[bool] = None,
    # Apply visualization options to results.
    apply_vis: Optional[bool] = None,
    # Get results from cache if available.
    cache: Optional[bool] = None,
    # Render width for image formats.
    image_width: Optional[int] = None,
    # Render height for image formats.
    image_height: Optional[int] = None,
    # Generate drill links (only applicable to 'json_detail' format.
    generate_drill_links: Optional[bool] = None,
    # Force use of production models even if the user is in development mode.
    force_production: Optional[bool] = None,
    # Retrieve any results from cache even if the results have expired.
    cache_only: Optional[bool] = None,
    # Prefix to use for drill links (url encoded).
    path_prefix: Optional[str] = None,
    # Rebuild PDTS used in query.
    rebuild_pdts: Optional[bool] = None,
    # Perform table calculations on query results
    server_table_calcs: Optional[bool] = None,
    # Requested fields
    fields: Optional[str] = None
) -> models.QueryTask:
    """Run Query Async"""
    response = self.post(f"/query_tasks", models.QueryTask, query_params={"limit": limit, "apply_formatting": apply_formatting, "apply_vis": apply_vis, "cache": cache, "image_width": image_width, "image_height": image_height, "generate_drill_links": generate_drill_links, "force_production": force_production, "cache_only": cache_only, "path_prefix": path_prefix, "rebuild_pdts": rebuild_pdts, "server_table_calcs": server_table_calcs, "fields": fields}, body=body)
    assert isinstance(response, models.QueryTask)
    return response
```

TypeScript:

```typescript
/**
 * POST /query_tasks -> IQueryTask
 */
async create_query_task(
  request: Partial<IRequestCreateQueryTask>,
  options?: Partial<ITransportSettings>,
) {
  return this.post<IQueryTask, IError | IValidationError>(
    '/query_tasks',
    {
      limit: request.limit,
      apply_formatting: request.apply_formatting,
      apply_vis: request.apply_vis,
      cache: request.cache,
      image_width: request.image_width,
      image_height: request.image_height,
      generate_drill_links: request.generate_drill_links,
      force_production: request.force_production,
      cache_only: request.cache_only,
      path_prefix: request.path_prefix,
      rebuild_pdts: request.rebuild_pdts,
      server_table_calcs: request.server_table_calcs,
      fields: request.fields,
    },
    request.body,
    options,
  )
}
```

The Request structure is:

```typescript
/**
 * Dynamically generated request type for create_query_task
 */
export interface IRequestCreateQueryTask {
  /**
   * body parameter for dynamically created request type
   */
  body?: Partial<IWriteCreateQueryTask>;
  /**
   * Row limit (may override the limit in the saved query).
   */
  limit?: number;
  /**
   * Apply model-specified formatting to each result.
   */
  apply_formatting?: boolean;
  /**
   * Apply visualization options to results.
   */
  apply_vis?: boolean;
  /**
   * Get results from cache if available.
   */
  cache?: boolean;
  /**
   * Render width for image formats.
   */
  image_width?: number;
  /**
   * Render height for image formats.
   */
  image_height?: number;
  /**
   * Generate drill links (only applicable to 'json_detail' format.
   */
  generate_drill_links?: boolean;
  /**
   * Force use of production models even if the user is in development mode.
   */
  force_production?: boolean;
  /**
   * Retrieve any results from cache even if the results have expired.
   */
  cache_only?: boolean;
  /**
   * Prefix to use for drill links (url encoded).
   */
  path_prefix?: string;
  /**
   * Rebuild PDTS used in query.
   */
  rebuild_pdts?: boolean;
  /**
   * Perform table calculations on query results
   */
  server_table_calcs?: boolean;
  /**
   * Requested fields
   */
  fields?: string;
}
```

#### Methods with delimited list types

As indicated in the [style values section of the OpenAPI specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#style-values), a list of values can be provided to a REST call in a variety of delimited formats. The Looker API uses "csv" formatting for some requests that receive simple lists, such as IDs.

In TypeScript, calling `toString()` on an array of numbers such as `[1,2,3]` would return `1, 2, 3`, which is fine for the Looker API methods expecting "csv-formatted" lists. However, in Python, the equivalent function returns `[1, 2, 3]` which would cause a parsing error by the Looker API endpoint.

As indicated in the OpenAPI specification style values, other delimiters such as pipe (`|`), space, or tab characters could be expected by an API endpoint.

To guarantee consistency in the serialization of "csv-formatted" array values, the code generator uses a **Delim** type for parameters that are specified as having a special delimiter. In TypeScript, this type is called `DelimArray`. In Python, it's called `DelimSequence`.
Using this type for the parameter also helps document the expected format for the list submitted to the API endpoint.

Both `DelimArray` and `DelimSequence` accept optional overrides for:

- `separator`, which defaults to a comma. This can be overridden with pipe, space, tab, tilde or whatever string separator might be required.

- `prefix`, which defaults to an empty string.

- `suffix`, which defaults to an empty string.

### Binary response handling

The popular request libraries currently used by the RTLs for both Python and the Node-based TypeScript SDK treat response content as string by default, with binary mode as an opt-in setting. By default, this results in the download of binary content like images or PDFs from SDK methods to be corrupted.

We've resolved this issue by setting up the request methods to process requests as binary by default, with the RTL using the `Content-Type` of the response to determine whether it's binary before returning the response payload to the SDK method.

#### Response can be either binary and string

A **mixed mode** response that can be either binary or string (e.g. text or json) has a note placed into the method header.

```typescript
/**
 * POST /queries/run/{result_format} -> string
 *
 * **Note**: Binary content may be returned by this method.
 */
async run_inline_query(
  request: Partial<IRequestRunInlineQuery>,
  options?: Partial<ITransportSettings>,
) {
  return this.post<string, IError>(
    encodeURI(`/queries/run/${request.result_format}`),
    {
      limit: request.limit,
      apply_formatting: request.apply_formatting,
      apply_vis: request.apply_vis,
      cache: request.cache,
      image_width: request.image_width,
      image_height: request.image_height,
      generate_drill_links: request.generate_drill_links,
      force_production: request.force_production,
      cache_only: request.cache_only,
      path_prefix: request.path_prefix,
      rebuild_pdts: request.rebuild_pdts,
      server_table_calcs: request.server_table_calcs,
    },
    request.body,
    options,
  )
}
```

#### Binary responses

A method that only has binary responses will have a note that the response is binary.

```typescript
/**
  * GET /render_tasks/{render_task_id}/results -> string}
  *
  * **Note**: Binary content is returned by this method.
  */
async render_task_results(
  /**
    * @param {string} render_task_id Id of render task
    */
  render_task_id: string,
  options?: Partial<ITransportSettings>,
) {
  return this.get<string, IError>(
    encodeURI(`/render_tasks/${render_task_id}/results`),
    null,
    null,
    options,
  )
}
```

#### String responses

A method that returns anything that's considered a string, such as `json`, `xml`, or `text` will not have a note about binary responses.

```typescript
/**
  * GET /roles/{role_id} -> IRole}
  */
async role(
  /**
    * @param {number} role_id id of role
    */
  role_id: number,
  options?: Partial<ITransportSettings>,
) {
  return this.get<IRole, IError>(
    encodeURI(`/roles/${role_id}`),
    null,
    null,
    options,
  )
}
```

### Future research

While the new SDKs are easier to use than the previous options, there are still additional improvements we are researching.

#### Streaming support

Looker intends to provide streaming (http chunking) methods for all streamable API endpoints, in addition to the current non-streaming methods.

Assigning an API response to a local variable is simple and easy, but if the response is extremely large (gigabytes of data), deserializing into client application memory will probably cause the client application to crash with an out-of-memory exception. Streaming large responses chunk by chunk can achieve constant memory use for arbitrarily large responses, at a cost of additional code complexity.

## API Troubleshooting

See the official documentation for [API Troubleshooting](https://docs.looker.com/reference/api-and-integration/api-troubleshooting) suggestions.

## Notes

This [visual guide](https://blog.readme.io/an-example-filled-guide-to-swagger-3-2/) shows some of the reasons to switch from Swagger 2.x to OpenAPI 3.x.
