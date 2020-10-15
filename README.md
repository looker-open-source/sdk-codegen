# SDK Codegen

This Looker Open Source repository is released under the MIT license. By using this repository, you agree to the terms of that license, and acknowledge that you are doing so at your own risk.

While Looker has developed and tested this code internally, we cannot guarantee that the open-source tools used by the scripts in this repository have not been modified with malicious code.

## Overview

This repository contains:

- The [SDK code generator](packages/sdk-codegen) that generates the source code for Looker SDKs
- Source code for the [Looker SDKs](#looker-sdks) produced by the code generator
- Looker SDK source code [examples](examples)
- the [API Explorer extension](packages/extension-api-explorer) that can be installed into a Looker instance
- the stand-alone [API Explorer](packages/api-explorer)
- the [RunIt](packages/run-it) REST client tester (embedded within API Explorer, typically)
- [code generator scripts](packages/sdk-codegen-scripts) that require Node (file i/o) to read and write SDK files

## The parts of the Looker SDK

We hope to help people who want use Looker as a platform get up and running quickly, largely by providing pre-built client SDKs in the most popular languages, and implementing consistency across all languages and platforms.

An [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification) describes the Looker API. This specification is used to produce both Looker's interactive API Explorer, and the Looker API language bindings for the Looker REST API.

A Looker SDK has several parts:

- **Looker API** OpenAPI specification (e.g., found at
  `https://<your-looker-endpoint>:19999/api/3.1/swagger.json`, although this is still the Swagger 2.x representation)

- The **Looker API Docs viewer**, provided in the Looker web app directly from our version-specific OpenAPI specification, available on each Looker server instance.

- **Language SDKs**, "smarter" client language classes and methods to improve the experience of calling the Looker API in various popular coding languages.

## Multi-API support with Looker 7.2 and later

Looker 7.2 introduced an **Experimental** version of API 4.0. Since that release, the SDKs now support multiple API versions in the same SDK package.

For all SDKs but Swift, API-specific SDKs are now created and put in the same SDK package, and share the same run-time code.

At the time of this writing, API 3.1 and API 4.0 are included in most SDK packages. For an SDK that supports multiple API versions, there will be a `methods.*` and `models.*` generated for each API version.

The class names representing these API versions are distinct, with version-named factories for creating initialized SDK objects.

These API-specific files still use all the same Run-Time Library (RTL) code in the SDK package to minimize code duplication.

### Looker SDKs

Please review the following table for a breakdown of the options to initialize the desired SDK object.

| SDK                        | API 3.1                                                                   | API 4.0                                                                  | Notes                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Python](python)           | `looker_sdk.init31()`                                                     | `looker_sdk.init40()`                                                    | Both API 3.1 and 4.0 are supported, and can be initialized with the functions shown                                                                                                                   |
| [Typescript](packages/sdk) | `Looker31SDK()`, `LookerNodeSDK.init31()`, or `LookerBrowserSDK.init31()` | `Looker40SDK()`, `LookerNodeSDK.init40()` or `LookerBrowserSDK.init40()` | Both API 3.1 and 4.0 are supported and can be initialized with the functions shown                                                                                                                    |
| [Kotlin](kotlin)           | Do not use                                                                | `LookerSDK()`                                                            | API 4.0 was specifically created to correct the endpoint payloads for strongly-typed languages like Kotlin and Swift. Because Kotlin really requires API 4.0, API 4.0 is the default namespace for it |
| [Swift](swift/looker)      | Not applicable                                                            | `Looker40SDK()`                                                          | Swift only has SDK definitions for API 4.0                                                                                                                                                            |  |
| [Look#](csharp)            | `Looker31SDK()`                                                           | `Looker40SDK()`                                                          | Community-supported C# SDK for Looker                                                                                                                                                                 |  |
| [GoLook](go)               | `v3.NewLookerSDK()`                                                       | `v4.NewLookerSDK()`                                                      | Community-supported GO SDK for Looker                                                                                                                                                                 |  |

By supporting both API versions in the same SDK package, we hope the migration path to the latest API is simplified. Both SDK versions can be used at the same time, in the same source file, which should allow for iterative work to move to the new API version.

For example:

```typescript
import {
  Looker40SDK,
  Looker31SDK,
  NodeSession,
  NodeSettingsIniFile,
} from '@looker/sdk'

const settings = new NodeSettingsIniFile()
const session = new NodeSession(settings)
const sdk = new Looker40SDK(session)
const sdk31 = new Looker31SDK(session)

const me40 = await sdk.ok(sdk.me())
const me31 = await sdk.ok(sdk31.me()) // or sdk31.ok(sdk31.me())
```

## Automatic URL encoding for input values

TL;DR: don't URL encode your inputs because the SDKs will automatically handle it.

All SDKs URL encode (also known as [percent encoding](https://en.wikipedia.org/wiki/Percent-encoding)) input values for passing to the API endpoints automatically. Furthermore, except for Swift, which has problematic URL decoding support, the other SDKs will avoid double-encoding inputs that may already be encoded.

## Using existing, pre-generated SDKs

When a specific language SDK has been developed, Looker makes that SDK available using the standard package manager for by that platform. Currently, the [Python SDK](python) and the [Typescript SDK](packages/sdk) can be installed from their respective package managers by following the instructions in their readmes.

For the other SDKs in this repository, you can copy and paste the source code into a module for your own project. Every SDK will eventually have a deployed package version.

If you want to use the generation options for an SDK, read on.

## Generating an API language binding

There are three steps for generating an SDK with this project:

- configure a `looker.ini` file so the Looker API specification can be retrieved from your Looker server.

  - **Note**: previous versions of the `looker.ini` file had an `api_version` entry. This is no longer required. The code generator project will read an `api_versions` value if that is found, but the SDKs ignore this value. If `api_versions` is not found in the `ini` file, it defaults to "3.1,4.0" for the generator to produce the definitions for the supported API versions.

- install the code generator project dependencies by running:

```sh
yarn install
yarn build
```

The resources required to run the code generator are in [package.json](package.json).

**Note**: If `yarn` is not installed, use [these instructions to install](https://yarnpkg.com/lang/en/docs/install/) it.

- run the SDK generator with `yarn sdk [language]`

- **Note**: [Generating Client SDKs for the Looker API](https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185) describes the legacy, manual steps for generating an API language binding. This project replaces these manual steps, and uses an improved code generator.

## Configuring `looker.ini`

The code generator reads a configuration file called `looker.ini` to fetch the API specification from a server. This configuration file needs to be in the same folder as the code generator.

To create `looker.ini`, copy [`looker-sample.ini`](looker-sample.ini) to `looker.ini` and fill in the required values. The values for `client_id` and `client_secret` can be retrieved by navigating to `https://<your_looker_endpoint>/admin/users`, editing your user, editing API3 keys, and clicking the "reveal" button to view your `client_id` and `client_secret`. If there are currently no API3 credentials, they can be generated by clicking “New API3 Key.”

For your own source code repositories, be sure to configure your version control system to ignore the SDK configuration `.ini` file so it doesn't accidentally get published somewhere unauthorized people can see it.

Unlike some other OpenAPI code generators, the Looker SDK code generator **never** writes access information into SDK source code. All SDKs provided by Looker are designed to receive the credentials required to call API methods via a `readConfig()` method that returns a key/value collection, where `client_id` and `client_secret` are retrieved, and used only for the time it takes to complete a login for authentication token retrieval, then they are immediately discarded from memory.

Invoke the SDK code generator with the command:

```sh
yarn sdk
```

To always use the latest Looker API specification for SDK generation, use:

```sh
yarn wipe && yarn sdk
```

The code generator will:

- read the Looker API configuration(s) from the `looker.ini` file.

  - **Note**: Normally there should only be one (1) entry in `looker.ini`. This first ini section is what is used for the SDKs by default, and also by the code generator.

- download (if the API specification file is not already present) the Looker API specification file(s) from the configured Looker server(s)

- convert (if the converted file is not already present) the downloaded Swagger 2 specification file(s) to OpenAPI 3.x

- validate the OpenAPI 3.x file(s)

- by default, call the code generator for each active language configured in [`codeGenerators.ts`](packages/sdk-codegen/src/codeGenerators.ts)

  - If you want to generate for one specific language, use `yarn sdk {language}`. Currently, supported `{language}` values are `kotlin`, `python`, `swift` and `typescript`

When the generator completes successfully, the output will be similar to:

```plain-text
python
  looker
    rtl
      (run-time library hand-written files here)
    sdk
      methods.py (automatically generated)
      models.py (automatically generated)
```

**Note:** If you're unable to download the API specification file because you're using an instance of Looker that is self-signed and errors are thrown, you can explicitly turn off SSL verification by putting `verify_ssl=false` in the `looker.ini` file configuration section.

### Using the Legacy generator

To generate a language currently not supported by Looker's SDK code generator with the OpenAPI generator:

- configure the desired language in [`codeGenerators.ts`](packages/sdk-codegen/src/codeGenerators.ts). Currently, only Go and C# have legacy language generation configured, and we now have a prototype Look# SDK that can be used instead of the legacy C# generator.

- the legacy generator defaults to using the API 4.0 specification, which is more accurate for strongly typed languages. To use API 3.1, put `api_version=3.1` in the `Looker` section of your `looker.ini`

- use `yarn legacy` to call the OpenAPI generator. This will use the OpenAPI generator to output files to the `./api/*` path

### Additional scripts

Use

```sh
yarn run
```

to see the list of all scripts that can be run by the code generator.

## SDK Examples

The open source repository <https://github.com/looker-open-source/sdk-examples> contains code snippets and projects written using the Looker language SDKs. You may find useful code in that repository. and are also welcome to contribute additional examples.

## API Troubleshooting

See the official documentation for [API Troubleshooting](https://docs.looker.com/reference/api-and-integration/api-troubleshooting) suggestions.

## Notes

In addition to swagger being deprecated, this [visual guide](https://blog.readme.io/an-example-filled-guide-to-swagger-3-2/) shows why OpenAPI 3.x is preferred to Swagger 2.x.

## Securing your SDK credentials

Looker improves on the security of the generated code for SDKs by **never** storing your server location or API credentials in the source code generated by the Looker code generator. The SDKs also provide some customizable support for providing API configuration values like server location and credentials to the SDK. In every Looker SDK, there is an overrideable method called `readConfig()` that can be customized to retrieve and return SDK configuration values from your preferred secure storage location.

Each Looker SDK has existing `readConfig()` examples that read from `.ini` files or environment variables. These are intended to support a quick start when developing with a Looker SDK. If a production environment prohibits secure use of `.ini` files or environment variables, another method of retrieving API configuration values is required. The API configuration retrieval function `readConfig()` can be overridden to support alternate storage scenarios.

Typically, `client_id` and `client_secret` are the only key values that will need to be dynamically retrieved from the `readConfig()` override method because the other configuration values are saved in memory by the initialized SDK client. In the near future, there will be additional authentication flows (such as OAuth) supported by Looker SDKs. The dynamic result that is returned by `readConfig()` can also be useful in those additional scenarios.

A short [Typescript SDK example](https://github.com/looker-open-source/sdk-examples/blob/6f7b42891923a7430e0bb8341c7b5c567a2e1269/typescript/customConfigReader.ts#L15:L28) that customizes `readConfig()` is available in the SDK Examples repository.

There is also a Kotlin SDK unit test in this repository with a short example:

```kotlin
class MockSettings(contents: String) : ApiSettings(contents) {
    override fun readConfig(): Map<String, String> {
        return mapOf(
                "base_url" to baseUrl,
                "verify_ssl" to verifySSL.toString(),
                "timeout" to timeout.toString(),
                "headers" to headers.toString(),
                "client_id" to mockId,
                "client_secret" to mockSecret
        )
    }
}
```

Please consult with the security professionals in your organization to determine the best way to secure your credentials for your own Looker SDK usage.

### Warnings for using `.ini` files to configure the SDK

To streamline getting started with the Looker SDKs, support for reading SDK credentials from an `.ini` file is included as a simple method for providing access information (server url and API credentials) to the SDK. If the source code to your Looker SDK application is shared in a version control system, the `.ini` file should be ignored so it never gets inadvertently published.

If the SDK application using an `.ini` file is available publicly, download or viewing of this `.ini` file should also be prohibited by the server hosting the application.

### Warnings for using Environment variables to configure the SDK

If the host environment for a Looker SDK supports environment variables, the SDK can also read environment variables to retrieve the server url and API credentials. Environment variables could also be visible to intrusive malware that may penetrate your application, so this option for providing credentials should also be used with caution.

## Environment variable configuration

Environment variables can be used for any SDK runtime that supports reading environment variables. Environment variables can be used in the:

- **Node** version of the Typescript/Javascript Looker SDK
- Python SDK
- Swift SDK
- Kotlin SDK

The following table describes the environment variables. By default, the SDK "namespace" is "LookerSDK" which is converted to UPPERCASE when used for naming environment variables.

| Variable name           | Description                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LOOKERSDK_BASE_URL      | A URL like `https://my.looker.com:19999`. No default value.                                                                                                           |
| LOOKERSDK_API_VERSION   | Version of the Looker API to use. Use `3.1` for now, which is the default and used to produce this SDK.                                                               |
| LOOKERSDK_VERIFY_SSL    | `true`, `t`, `yes`, `y`, or `1` (case insensitive) to enable SSL verification. Any other value is treated as `false`. Defaults to `true` if not set.                  |
| LOOKERSDK_TIMEOUT       | Request timeout in seconds. Defaults to `120` for most platforms.                                                                                                     |
| LOOKERSDK_CLIENT_ID     | API3 credentials `client_id`. This and `client_secret` must be provided in some fashion to the Node SDK, or no calls to the API will be authorized. No default value. |
| LOOKERSDK_CLIENT_SECRET | API3 credentials `client_secret`. No default value.                                                                                                                   |

### Configuration variable precedence

Configuration variables should be processed as follows:

- if the default configuration `.ini` file exists, apply the values
- if an environment variable exists, apply the value
- if a configuration value is explicitly in code, apply that value
- if a command-line switch is supported, apply that value
