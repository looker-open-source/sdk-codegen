# @looker/extension-utils

Easier browser-based TypeScript authentication via OAuth, and support for building React applications that can run both inside and outside of [Looker's Extension Framework](https://docs.looker.com/data-modeling/extension-framework/extension-framework-intro) hosting environment.

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

## Using environment adaptors

All source code for the application except for the launch page can be the same. For the launch page, either `ExtensionAdaptor` or `BrowserAdaptor` will be used.

### BrowserAdaptor

See [StandAloneApiExplorer.tsx](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/api-explorer/src/StandAloneApiExplorer.tsx) for a reference implementation.

### ExtensionAdaptor

See [ExtensionApiExplorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-api-explorer/src/ExtensionApiExplorer.tsx) for a reference implementation.

### Configuring the extension provider

The following code, extracted from the [Hackathon application's index.tsx](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/hackathon/src/index.tsx),
configures the extension provider so the extension SDK and extension adaptor can be used in the [`<Hackathon />`](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/hackathon/src/Hackathon.tsx) React component.

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ExtensionProvider } from '@looker/extension-sdk-react';
import { Provider } from 'react-redux';
import { Hackathon } from './Hackathon';
import store from './data/store';

window.addEventListener('DOMContentLoaded', (_) => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  ReactDOM.render(
    <ExtensionProvider requiredLookerVersion=">=21.3.0">
      <Provider store={store}>
        <Hackathon />
      </Provider>
    </ExtensionProvider>,
    root
  );
});
```

Inside `<Hackathon />`, this is the code that sets up the theming and "browser API" services like opening links:

```tsx
const extSdk = getExtensionSDK();
const adaptor = new ExtensionAdaptor(extSdk);
const themeOverrides = adaptor.themeOverrides();

// ...

return (
  <ComponentsProvider
    loadGoogleFonts={themeOverrides.loadGoogleFonts}
    themeCustomizations={themeOverrides.themeCustomizations}
  >
    // ...
  </ComponentsProvider>
);
```
