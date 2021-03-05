# OpenAPI Explorer
test

Use this **OpenAPI Explorer** to read any [OpenAPI](https://www.openapis.org/) specification and explore its **methods** and **types**.
Fast and powerful searching is also supported.

This is an Open Source project that builds on the specification processing created in the Looker
[SDK Codegen project](https://github.com/looker-open-source/sdk-codegen).

## Getting started

This package uses Yarn. See the [Yarn installation](https://classic.yarnpkg.com/en/docs/install/) instructions if you need to install it.

To install dependencies, run:

```sh
yarn install
```

followed by:

NOTE: For API-explorer to build all other packages must have been built at least once. Use `yarn build` to do a complete build.

```sh
yarn workspace @looker/api-explorer develop
```

will start the development server and monitor for changes.

To see the other scripts supported by the package, do

```sh
yarn workspace @looker/api-explorer run
```
