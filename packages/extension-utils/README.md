# @looker/extension-utils

## "Dual mode" Looker browser applications

This package provides interfaces and classes that support building a Looker application that can be both hosted as
a Looker extension and as a browser application while using exactly the same source code. Looker's [API Explorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/api-explorer)
is the original version of an application that can run just in the browser, or hosted in Looker as an extension.

## Installation

Either

```shell
yarn add @looker/extension-utils
```

or

```shell
npm install @looker/extension-utils
```

## Using extension adaptors

All source code for the application except for the launch page can be the same. For the launch page, either `ExtensionAdaptor` or `BrowserAdaptor` will be used.

### BrowserAdaptor

See [StandAloneApiExplorer.tsx](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/api-explorer/src/StandAloneApiExplorer.tsx) for a reference implementation.

### ExtensionAdaptor

See [ExtensionApiExplorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-api-explorer/src/ExtensionApiExplorer.tsx) for a reference implementation.
