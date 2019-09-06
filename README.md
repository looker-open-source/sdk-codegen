# SDK Codegen

This Looker Open Source repository is released under the MIT license. By using this repository, you agree to the terms of that license, and acknowledge that you are doing so at your own risk.

While Looker has developed and tested this code internally, we cannot guarantee that the open-source tools used by the scripts in this repository have not been modified with malicious code.

Our goal is to help people who want use Looker as a platform to get up and running quickly, largely by providing pre-built client SDKs in the most popular languages, and implementing consistency across all languages and platforms.

The Looker API is defined with the [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification), formerly known as "swagger." This specification is used to produce both Looker's interactive API Explorer,and the Looker API language bindings that describes the Looker REST API.

## The parts of the Looker SDK

A Looker SDK has several parts:

* **Looker API** OpenAPI specification (e.g., found at
  `https://<your-looker-endpoint>:19999/api/3.1/swagger.json`)

* The **Looker API Explorer**, provided in the Looker web app directly from our version-specific OpenAPI specification, avaiable in each Looker server instance.

* **Language SDKs**, "smarter" client language classes and methods to improve the experience of calling the Looker API in various popular coding languages. Looker has created a code generator for specific languages in this repository, which is used by the command `yarn sdk`'

* **API bindings** using the legacy [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) can also be product. This process converts the API specification to language-specific code. Most of these template-based generators are written by different language enthusiasts, so the pattern and quality of the generated code varies widely, even though most generated code tends to work acceptably.

## Using existing, pre-generated SDKs

When a specific language SDK has been developed, Looker will make that SDK available using the standard package manager used by that platform. Currently, there are two client language SDKs Looker has deployed to package managers.

### Installing the Python SDK

Information on using the Looker SDK for Python is available at <https://pypi.org/project/looker-sdk>.

### Installing the Typescript/Javascript SDK

Information on using the Looker SDK for Typescript/Javascript is available at <https://www.npmjs.com/package/@looker/sdk>.

## Generating an API language binding

By using the yarn/node app included in this project, you now have three steps to legacy language bindings:

* configure a `looker.ini` file so the Looker API specification can be retrieved from your Looker server

* run the specification converter to convert from Swagger 2.x to OpenApi 3.x with `yarn convert`

* run the SDK generator with `yarn sdk`

* **Note**: [Generating Client SDKs for the Looker API](https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185) describes the manual steps for generating an API language binding. This project automates these manual steps and uses an improved code generator.

## Configuring `looker.ini`

The code generator reads a configuration file `looker.ini` to fetch the API specification from a server. This configuration file needs to be in the same folder as the code generator.

To create `looker.ini`, copy [`looker-sample.ini`](looker-sample.ini) to `looker.ini` and fill in the required values. The values for `client_id` and `client_secret` by viewing editing the User information in the Looker Admin panel and "editing" the API3 keys..

For your own source code repositories, be sure to configure your version control system to ignore your configuration `.ini` file so it doesn't accidentally get published somewhere unauthorized people can see it.

Unlike some other OpenAPI code generators, the Looker SDK code generator **never** writes access information into SDK source code.
All SDKs provided by Looker are designed to receive the credentials required to call API methods.

### Using the yarn/node-based generator

If you don't have `yarn` installed already, you'll need to [install](https://yarnpkg.com/en/docs/install) it.

After yarn is installed, just run `yarn` from your terminal window/command line, and it will download or update all the packages required to run the code generator. You can see the resources required to run the code generator in [package.json](package.json).

Invoke the SDK code generator with the command:

```bash
yarn sdk
```

The generator will:

* read the Looker API configuration(s) from the `looker.ini` file.

  * **Note**: There should be at most 2 entries in `looker.ini`: one for API version 3.1. and one for 3.0. API 3.1 is a superset of 3.0, so 3.0 shouldn't be used unless there is a very specific reason for it.

* download (if the specification file is not already present) the Looker API specification file(s) from the configured Looker server(s)

* convert (if the converted file is not already present) the downloaded Swagger 2 specification file(s) to OpenAPI 3.x

* validate the OpenAPI 3.x file(s)

* by default, call the code generator for each active language configured in [`languages.ts`](src/languages.ts)

  * If you want to legacy for one specific language, use `yarn sdk {language}`. Currently, supported `{language}` values are `python` and `typescript`

When the generator completes successfully, the output will be similar to:

```plain-text
python
  looker
    rtl
      (run-time library hand-written files here)
    sdk
      methods.py (automatically generated)
      models.py (automatically generated)
typescript
  looker
    rtl
      (run-time library hand-written files here)
    sdk
      methods.ts (automatically generated)
      models.ts (automatically generated)
```

**Note:** If you're unable to download the API specification file because you're using an instance of Looker that is not secured and errors are being thrown, you can explicitly turn off TLS verification with a command like:

```bash
NODE_TLS_REJECT_UNAUTHORIZED="0" yarn sdk
```

#### View the specification interactively

When the specification conversion completes successfully, the OpenAPI 3.x specification file is available locally, so you can search and explore the api using a command similar to the following:

```bash
yarn view Looker.3.1.oas.json
```

This command will start a web server on `http://localhost:5000` that allows you to browse and search the local specification file for API 3.1.

**Tip**: search for `query` or `dashboard` in the UI and see what you get!

### Using the Legacy generator

To use a language currently not supported by Looker's SDK code generator with the OpenAPI generator:

* configure the desired language in [`languages.ts`](src/languages.ts)

* use `yarn legacy` to call the OpenAPI generator

#### Additional scripts

Use

```bash
yarn run
```

to see the list of all scripts that can be run by the code generator.

## Running Integration Tests

In order to run the integration tests you will need:

 * [docker](https://docs.docker.com/install/#support)
 * [docker-compose](https://docs.docker.com/compose/install/)

Which we use to isolate the various supporting libraries required to test the SDK in a given language.

You will also need to copy the `looker-sample.ini` to `looker.ini` and fill out
the necessary details so it can reach your running *Looker* instance.

To build a specific language integration testing image you simply execute:

```bash
docker-compose build [language]
```

Where language comes from the directories `sdk_codegen/docker/*` and we'd build the docker image to support running those tests. At this point you can run the existing tests from inside that container pointed at the instance you identified in `looker.ini` like so:

```bash
docker-compose run [language]
```

## API Troubleshooting

See the official documentation for [API Troubleshooting](https://docs.looker.com/reference/api-and-integration/api-troubleshooting) suggestions.

## Notes

In addition to swagger being deprecated, this [visual guide](https://blog.readme.io/an-example-filled-guide-to-swagger-3-2/) shows why OpenAPI 3.x is preferred to Swagger 2.x.
