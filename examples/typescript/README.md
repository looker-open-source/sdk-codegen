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
   - `yarn run-config` - runs custom config reader example.
   - `yarn run-sudo` - runs sudo as user example.
   - `yarn run-tile` - runs download dashboard tile example.
   - `yarn run-dashboard` - runs download dashboard example.
   - `yarn run-bulk-disable-schedules` - runs bulk disable schedules example.
   - `yarn run-bulk-reassign-schedules` - runs bulk reassign schedules example.
   - `yarn run-validate-branch` - runs validate branch example.
   - `yarn run-generate-api-credentials` - runs bulk generate api credentials example.
   - `yarn run-test-connections` - runs test connections example.
   - `yarn run-pdt-mapping` - runs pdt mapping example.

Some other dependencies may be required for the projects to build and run correctly on your local clone.

## TypeScript SDK packages

The Looker TypeScript SDK has different packages to prevent node dependencies being linked into browser usage of the SDK (the node dependencies are not available in the browser and can cause compilation errors). There are three packages for the Typescript SDK available on npm:

1. `@looker/sdk-rtl` - contains a run time library needed to invoke the Looker API methods. Referencing the `@looker/sdk` as a dependency should automatically pull this package in.
2. `@looker/sdk` - contains the Looker API methods.
3. `@looker/sdk-node` - contains the dependencies needed to run the Looker SDK in a node environment. Do NOT include this package if you are using the Looker SDK in a browser. You MUST include this package if you are using `node` or `ts-node`.

## Example list

A very brief descriptions of the examples, and the link to the main example/project file are provided here. For more information on an example, look at the source file.

### General examples

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;   | Discussion                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                                              |
| [custom configReader](customConfigReader.ts) | Shows how to implement a custom method of reading your configuration settings, including API credentials                                                                                                                                                                                          |
| [SDK utilities](utils.ts)                    | This file has some SDK utility methods tasks like:<ul><li>finding a dashboard by name</li> <li>listing dashboards and ids</li> <li>finding a tile on a dashboard</li> <li>listing queryable tiles for a dashboard</li><li>a general-purpose `waitForRender` routine with progress ticks</li></ul> |

### User management

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;                 | Discussion                                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sudo as user](sudoAsUser.ts)                              | Uses several User management SDK methods and shows how to `sudo` as a different user than the default API credentials user. Once the auth session is set to that user, subsequent SDK requests will be "as user `<x>`" when submitted to the API. |
| [bulk generate api credentials](generateApiCredentials.ts) | Allows an admin to generate api credentials in bulk given a Looker role ID as input (Ex: generate api credentials for all users with the "Developer" role).                                                                                       |

### Schedules

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;          | Discussion                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [bulk disable schedules](bulkDisableSchedules.ts)   | This script allows an admin user to disable all user schedules OR just the schedules of a specific user.                        |
| [bulk reassign schedules](bulkReassignSchedules.ts) | This script allows allows an admin user to either reassign all user schedules OR a single user's schedules to a specified user. |

### Git / LookML Project Validation

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion                                                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| [validate branch](validateBranch.ts)       | Allows you to validate a given branch of a specific project in development mode, returning any validation errors that are surfaced. |

### Connection / PDT

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [test connections](testDBConnections.ts)   | Allows an admin user to run connection tests in bulk outputting a results object with the results of the test for each db connection in Looker. |
| [pdt mapping](dependencyGraph.ts)          | This file allows you to map out your pdt dependencies for a given model in an output svg file.                                                  |

### Downloading

| &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp;           | Discussion                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [download a dashboard tile by name](downloadTile.ts) | Find the requested dashboard by name, then the requested tile by name. If either name matches, the list of all available items is display. Supported output formats are PNG, JPG, CSV, JSON, and anything else supported by the `run_query` endpoint. This sample shows progress during a render task, and also how to use the SDK's streaming support. |
| [download a dashboard by name](downloadDashboard.ts) | Find the requested dashboard by name, then render it in the requested format. Default render format is PDF. PDF or PNG are the recommended output formats, but JPG is also supported.                                                                                                                                                                   |
