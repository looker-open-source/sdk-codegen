# TypeScript Examples for the Looker API

The examples in this folder use `yarn`. If you don't have `yarn` installed already, you'll need to [install](https://yarnpkg.com/en/docs/install) it.

## Using yarn

Use

```bash
yarn {command} [other command-line options]
```

to run a TypeScript SDK example file.

## Setup and run the typescript examples

These examples assume that a `looker.ini` has been created in the root of the repository (two directories up from this directory).

1. Change directory into this directory (`examples/typescript`).
2. Run `yarn` to install the dependencies.
3. Run the examples - `yarn {command} [other command-line options]`
   - `yarn run-dual` - runs multiple apis example.
   - `yarn run-tiny-dual` - runs the compact multiple apis example
   - `yarn run-config` - runs custom config reader example.
   - `yarn run-sudo` - runs sudo as user example.
   - `yarn run-tile` - runs download dashboard tile example.
   - `yarn run-dashboard` - runs download dashboard example.

An important note on dependencies. The Looker typescript SDK consists of the following packages:

1. `@looker/sdk` - contains the Looker API methods.
2. `@looker/sdk-rtl` - contains a run time library needed to invoke the Looker API methods. Referencing the `@looker/sdk` as a dependency should automatically pull this package in.
3. `@looker/sdk-node` - contains dependencies needed to run the Looker SDK in a node environment. Do NOT include this package if you are using the Looker SDK in a browser.

## Example list

Very brief descriptions of the examples, and the link to the main example/project file are provided here. For more information on an example, look at the source file.

### General examples

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;   | Discussion                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [multiple APIs](dual.ts)                     | A simple example that shows how to use multiple versions of the API in the same file. The goal is to make iterative migration from an older API to a newer API in existing SDK code easier.                                                                                                       |
| [custom configReader](customConfigReader.ts) | Shows how to implement a custom method of reading your configuration settings, including API credentials                                                                                                                                                                                          |
| [SDK utilities](utils.ts)                    | This file has some SDK utility methods tasks like:<ul><li>finding a dashboard by name</li> <li>listing dashboards and ids</li> <li>finding a tile on a dashboard</li> <li>listing queryable tiles for a dashboard</li><li>a general-purpose `waitForRender` routine with progress ticks</li></ul> |

### User management

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion                                                                                                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sudo as user](sudoAsUser.ts)              | Uses several User management SDK methods and shows how to `sudo` as a different user than the default API credentials user. Once the auth session is set to that user, subsequent SDK requests will be "as user `<x>`" when submitted to the API. |

### Downloading

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;           | Discussion                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [download a dashboard tile by name](downloadTile.ts) | Find the requested dashboard by name, then the requested tile by name. If either name matches, the list of all available items is display. Supported output formats are PNG, JPG, CSV, JSON, and anything else supported by the `run_query` endpoint. This sample shows progress during a render task, and also how to use the SDK's streaming support. |
| [download a dashboard by name](downloadDashboard.ts) | Find the requested dashboard by name, then render it in the requested format. Default render format is PDF. PDF or PNG are the recommended output formats, but JPG is also supported.                                                                                                                                                                   |
