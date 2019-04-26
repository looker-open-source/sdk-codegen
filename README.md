# SDK Codegen

This Looker Open Source repository is released under the MIT license. By using this repository, you agree to the terms of that license, and acknowledge that you are doing so at your own risk.

While Looker has developed and tested these scripts internally, we cannot guarantee that the open-source tools used by the scripts in this repository have not been modified with malicious code.

Our goal is to lower barriers to entry for customers who want use Looker as a platform, largely by providing pre-built client SDKs in the most popular languages, and curating consistency across all languages and platforms.

The Looker API is defined with the [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification), formerly known as "swagger." This specification is used to produce both Looker's interactive API Explorer, and the Looker API language bindings via a JSON file that describes the Looker REST API.

With the [`prepare.sh`](prepare.sh) script in this repository, the Looker API bindings for a specific programmin language are generated with [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator).

## The parts of the Looker SDK

The Looker SDK has several parts:

* **Looker API** OpenAPI specification (e.g., found at
  `https://<your-looker-endpoint>:19999/api/3.1/swagger.json`)

* The **Looker API Explorer**, generated in the Looker web app directly from our version-specific OpenAPI specification provided with each Looker server instance.

* **API bindings**, generated for each language from the versioned OpenAPI specification via [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator). This process converts the API specification to language-specific code. Most of these template-based generators are written by different language enthusiasts, so the pattern and quality of the generated code varies widely, even though most generated code tends to work acceptably.

* **Language SDKs**, "smarter" client language classes and methods to improve usability of the API binding. (These are not yet available.)

## Generating an API language binding

[Generating Client SDKs for the Looker API](https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185) describes the manual steps for generating an API language binding.

By using the yarn/node app included in this project, you now have three steps to generate language bindings:

* configure a `looker.ini` file so the specification can be retrieved from your server

* specify the client language(s) you want to generate in either [`targetLanguages.ts`](targetLanguages.ts) (for Node) or [`target_languages.txt`](target_languages.txt) for bash.

* run the generator

The deprecated bash scripts are still provided if you're unable to use npm or yarn in your environment, but future enhancements will only be made to the yarn application.

## Configuring `looker.ini`

The API configuration values should be stored in a file called `looker.ini`. By default, the configuration file needs to be in the same folder as generation script.

To create `looker.ini`, copy [`looker-sample.ini`](looker-sample.ini) to `looker.ini` and fill in the required values. You can find `client_id` and `client_secret` by following the instructions in [Generating Client SDKs for the Looker API](https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185).

For your own source code repositories, be sure to configure your version control system to ignore your configuration `.ini` file so it doesn't accidentally get checked in somewhere unauthorized people can see it.

To simplify configuration tasks (and to help ensure you *never* commit your credentials into a source code repository) future SDKs provided by Looker will use an `.ini` format to save/retrieve their API configuration settings.

### Using the yarn/node-based generator

If you don't have `yarn` installed already, you'll need to [install](https://yarnpkg.com/en/docs/install) it.

After yarn is installed, just run `yarn` from your terminal window/command line, and it will download or update all the packages required to run the code generator. You can look at [package.json](package.json) to see what resources are required to run the code generator.

Run the generator with the command:

```bash
yarn generate
```

The generator will:

* read the Looker API configuration(s) from the `looker.ini` file.

  * **Note**: There should be at most 2 entries in `looker.ini`: one for API version 3.1. and one for 3.0. Because 3.1 is a superset of 3.0, you really only need 3.1

* download (if the file is not already present) the Looker API specification file(s) from the configured Looker server(s)

* convert (if the converted file is not already present) the downloaded Swagger 2 specification file(s) to OpenAPI 3.x

* lint check the OpenAPI 3.x file(s)

* call the OpenAPI code generator for each active language configured in [`targetLanguages.ts`](targetLanguages.ts)

  * Comment out any language you don't want to generate, or uncomment or add the languages you do want to generate.

When the generator completes successfully, the output will be similar to:

```plain-text
api (created by the generator. This and its subfolders can be recreated with the script on demand.)
  3.1 (api version in the configuration file)
    csharp
    kotlin
    python
    r
```

If you have the OpenAPI 3.x file available locally, you can use Speccy from the command line to search and explore the specification file. For example:

```bash
yarn speccy serve Looker.3.1.oas.json
```

will start a web server on `http://localhost:5000` that allows you do browse and search the local specification file for API 3.1.

**Tip**: search for `query` in the UI and see what you get!

**Note:** If you're unable to download the API specification file because you're using an instance of Looker that is not secured and errors are being thrown, you can explicitly turn off TLS verification in Node with a command like:

```bash
NODE_TLS_REJECT_UNAUTHORIZED="0" yarn generate
```

### Using the bash script generators

**Note:** The yarn/node version of the generator is the recommended and more reliable option.

In this repository, [`prepare.sh`](prepare.sh) automates these steps for the OpenAPI generator. For people who still wish to use the deprecated swagger-based code generator, [`swagger.sh`](swagger.sh) is also provided.

If the language you use isn't provided in this repository, you can modify the [`target_languages.txt`](target_languages.txt) file to add it as a generation target, or follow the manual steps in [Generating Client SDKs for the Looker API](https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185).

## The API source code generation process

Both [`prepare.sh`](prepare.sh) and [`swagger.sh`](swagger.sh) follow the same general steps:

* download the Looker API specification from the Looker server using the settings in the `.ini` configuration file (if it is not present)

* `git` the required source code generator for the script (either OpenAPI or swagger)

* build the downloaded code generator (this is one of the places malware could affect your machine)

* invoke the source code generator for each active language in [`target_languages.txt`](target_languages.txt) (another area malware could affect your machine)

### Generation script parameters

**Note**: Because [`swagger.sh`](swagger.sh) is deprecated, the remainder of this document will focus on [`prepare.sh`](prepare.sh).

You can invoke [`prepare.sh`](prepare.sh) with:

```bash
sh prepare.sh [option]
```

where `option` is:

* `clean`: remove generated `api/*` folders
* `wipe`: `clean`, and also remove the `openapi-generator` and `oas-kit` folders (if oas-kit is used)
* `file`: configuration file name to use instead of `looker.ini`

Example:

```bash
sh prepare.sh ~/myconfig.ini
```

Will read API configuration values from `~/myconfig.ini` rather than `looker.ini`

### Automated script processing

[`prepare.sh`](prepare.sh) is a bash shell script that:

1. Retrieves the Looker API specification file from the Looker server if it's missing. The location and version of the API is defined in the configuration file usually named `looker.ini`.

1. If the code generator isn't found in the current path, `git` clones the code generator and builds it

1. Reads [`target_languages.txt`](target_languages.txt) to determine which languages to process, including special generation flags for those languages. (Please refer to the [Swagger Code-gen](https://github.com/swagger-api/swagger-codegen) homepage for the list of supported languages.)

1. Generates each active language binding defined in [`target_languages.txt`](target_languages.txt) into `api/[language_path]`.

When [`prepare.sh`](prepare.sh) completes successfully, the directory structure will look similar to:

```plain-text
api (created by `prepare.sh`. This and its subfolders can be recreated with the script on demand.)
  csharp
  java
  python
  r
openapi-generator (git cloned by [`prepare.sh`](prepare.sh))
oas-kit (git cloned by [`prepare.sh`](prepare.sh) if enabled)
```

## API Troubleshooting

See the official documentation for [API Troubleshooting](https://docs.looker.com/reference/api-and-integration/api-troubleshooting) suggestions.

## Notes

The original version of the [`prepare.sh`](prepare.sh) script upgraded Looker's [Swagger 2.0 API specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) to [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) after fetching the [OAS Kit](https://github.com/Mermade/oas-kit). After upgrading, the `*.v3.json` specification is lint checked. If there are no errors, client language code generation as defined in [`target_languages.txt`](target_languages.txt) continues. The OAS Kit has been unreliable, so the current version of `prepare.sh` has the sections that reference it commented out.

When it becomes reliable again, we plan to re-enable it. The 3.0 version of the specification has better tooling and community support. This [visual guide](https://blog.readme.io/an-example-filled-guide-to-swagger-3-2/) shows why OpenAPI 3.x is preferred to Swagger 2.x.
