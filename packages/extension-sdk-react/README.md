# Extension SDK For React

## Installation

Add dependency to your project using yarn or npm

```sh
yarn add @looker/extension-sdk-react
```

or

```sh
npm install @looker/extension-sdk-react
```

## Usage

The Extension SDK for react contains a provider that allows child components to access the
Extension SDK.

### Provider

Add the `ExtensionProvider40` near the root of the extension component tree. ExtensionProvider40 exposes the Looker 4.0 sdk.

```tsx
<ExtensionProvider40
  loadingComponent={<div>Loading ...</div>}
  requiredLookerVersion=">=22.0.0"
>
  <MyComponent />
</ExtensionProvider40>
```

- An optional `loadingComponent` can be passed in to display while the provider is establishing a connection with the looker host
- `requiredLookerVersion` indicates what version of Looker is required. Check `context.initializeError` to see if a version error was detected.

### Access the Extension SDK

```tsx
import React, { useContext } from "react"
import { ExtensionContext40 } from '@looker/extension-sdk-react'

export const MyComponent: React.FC<{}> = () => {
  const { extensionSDK, coreSDK, initializeError } = useContext(ExtensionContext40)

```

### React Router

The Extension SDK for React supports React Router. Due to security restrictions
of the sandboxed IFRAME only MemoryRouter is supported. The ExtensionProvider creates
the router so you can add `Switch` and `Route` components as childrem. The Looker host is notified
of changes to the React routes and the child route is appended to he Looker extension
route. This means that the route can be restored on a page reload or sent as a link.

The `ExtensionProvider40` can also notify the extension of changes to the route using the
`onPathnameChange` attribute.

#### Example

```tsx
export const MyExtension: React.FC<{}> = () => {
  const [pathname, setPathname] = useState("")

  return (
      <ExtensionProvider40 onPathnameChange={setPathname}>
        <MyLayout>
          <MySidebar pathname={pathname} />
          <Switch>
            <Route path=>
              <MyRoute1 />
            </Route>
            <Route path='/route2'>
              <MyRoute2 />
            </Route>
          </Switch>
        </MyLayout>
      </ExtensionProvider40>
  )
}
```

### Looker SDK considerations

The Looker SDK can be accessed as follows:

- Through the extension context (see [Access the Extension SDK](#access-the-extension-sdk) above).
- Globally, through the getCoreXXSDK methods (see [Redux support](#redux-support) below)

The extension context exposes the following properties:

- `coreSDK` - SDK version 4.0

The following global access methods are available:

- `getCore40SDK()` - SDK version 4.0

There is no restriction on which SDK can be used within an extension, none, one or all of the above can be used interchangeably, context or global access. The one caveat is that it is recommended that the Looker version support SDK 4.0 if the 4.0 SDK is used (the results may be unpredictable otherwise).

### Redux support

The Looker SDK is available outside of the Extension provider using the `getCore40SDK` method. This means that `redux sagas` or `redux thunks` can utilize the SDK from within a `saga` or `thunk`. Note that the Looker connection MUST be established before `getCoreSDK` can be called. An error will be thrown if the method is called too soon. Note that children of the `ExtensionProvider40` will not be rendered until after the connection has been established. As such it is safe for children of the `ExtensionProvider40` to utilize `sagas` or `thunks`.

#### Example saga

```tsx
import { getCore40SDK } from '@looker/extension-sdk-react';
import { all, call, put, takeEvery, select } from 'redux-saga/effects';
import {
  Actions,
  allLooksSuccess,
  runLookSuccess,
  error,
  Action,
  State,
} from '.';

function* allLooksSaga() {
  const coreSDK = getCore40SDK();
  const result = yield call([coreSDK, coreSDK.all_looks]);
  if (result.ok) {
    // Take up to the first 10 looks
    const looks = result.value.slice(0, 9);
    yield put(allLooksSuccess(looks));
  } else {
    yield put(error(result.error.message));
  }
}

export function* sagaCallbacks() {
  yield all([takeEvery(Actions.ALL_LOOKS_REQUEST, allLooksSaga)]);
}
```

### Tile Extension Context Data

```ts
import { ExtensionContext40 } from '@looker/extension-sdk-react'

export const MyExtension: React.FC = () => {
  const {
    extensionSDK,
    tileSDK,
    tileHostData: { dashboardFilters },
  } = useContext(ExtensionContext40)

```

## Related Projects

- [Looker extension examples](https://github.com/looker-open-source/extension-examples).
- [Looker extension SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-sdk).
- [Looker SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/sdk).
