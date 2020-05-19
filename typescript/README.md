# Typescript Examples for the Looker API

The examples in this folder use `yarn`. If you don't have `yarn` installed already, you'll need to [install](https://yarnpkg.com/en/docs/install) it.

## Using yarn

Use

```bash
yarn ts-node {filename} [other command-line options]
```

to run a Typescript SDK example file.

## Example list

Very brief descriptions of the examples and the link to the main example/project file are provided here. For more information on an example, look at the source file.

### General examples

|  &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion |
| ------------- | ---------- |
| [multiple APIs](dual.ts) | A simple example that shows how to use multiple versions of the API in the same file. The goal is to make iterative migration from an older API to a newer API in existing SDK code easier. |
| [custom configReader](customConfigReader.ts) | Shows how to implement a custom method of reading your configuration settings, including API credentials |
| [SDK utilities](utils.ts) | This file has some SDK utility methods tasks like:<ul><li>finding a dashboard by name</li> <li>listing dashboards and ids</li> <li>finding a tile on a dashboard</li> <li>listing queryable tiles for a dashboard</li><li>a general-purpose `waitForRender` routine with progress ticks</li></ul> |

### User management

|  &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion |
| ------------- | ---------- |
| [sudo as user](sudoAsUser.ts) | Uses several User management SDK methods and shows how to `sudo` as a different user than the default API credentials user. Once the auth session is set to that user, subsequent SDK requests will be "as user `<x>`" when submitted to the API. |


### Downloading

|  &nbsp;&nbsp;Example&nbsp;Topic&nbsp;&nbsp; | Discussion |
| ------------- | ---------- |
| [download a dashboard tile by name](downloadTile.ts) | Find the requested dashboard by name, then the requested tile by name. If either name matches, the list of all available items is display. Supported output formats are PNG, JPG, CSV, JSON, and anything else supported by the `run_query` endpoint. This sample shows progress during a render task, and also how to use the SDK's streaming support. |
| [download a dashboard by name](downloadDashboard.ts) | Find the requested dashboard by name, then render it in the requested format. Default render format is PDF. PDF or PNG are the recommended output formats, but JPG is also supported. |
