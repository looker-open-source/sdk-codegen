# API Explorer file server

API Explorer (aka APIX) uses some JSON-formatted "index" files to augment the information provided in a specification.

To use this server, clone this repository and:

```sh
yarn && yarn build
yarn mine
cd apix-files
yarn serve
```

This will start the API Explorer file server at `http://localhost:30000`

## Mining the source code

`yarn mine` runs two specific miners:

- `yarn mine:examples`
- `yarn mine:declarations`

which are briefly explained below

### Example mining

The source code in this repository is mined to find examples of using the Looker SDKs.

```sh
yarn mine:examples
```

produces [examplesIndex.json](/examplesIndex.json), which is checked in.

### Declaration mining

```sh
yarn mine:declarations
```

produces [declarationsIndex.json](/declarationsIndex.json), which is not checked in (so it will be missing unless you've modified the declaration miner configuration to find your spec implementation).
This file is used internally by Looker to provide direct links from API Explorer to the source code that defines our endpoints and API types.
