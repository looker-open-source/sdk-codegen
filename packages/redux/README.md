## @looker/redux

> Our own abstractions to make how we use Redux simpler.

## Notes

Our usage of Redux is moving more towards slices and sagas and the API contained in this package is geared towards guiding us down that path.

## Utilities

### createSliceHooks

> Returns hooks that are automatically bound to your typed state, slices and sagas.

`createSliceHooks` takes a `slice` and `saga` initializer and returns hooks - composed of other hooks in this API - that are automatically bound to your typed state, slices and sagas (optional) so you can focus on the important parts of your data and less about implementation details. It assumes that your using `@reduxjs/toolkit` as this produces information that `createSliceHooks` uses internally.

`createSliceHooks` also ensures your reducers and sagas are registered with the store (and registered only once), so you don't need to worry about doing this as side effects of an import or the component lifecycle. Dynamically registering them also ensures your code can be properly code-split.

`createSliceHooks` returns the following hooks:

- `useActions` - returns the actions from your slice bound to `dispatch` using `bindActionActionCreators`.
- `useStoreState` - ensures your reducers and sagas have been registered and returns the top-level state from your slice.

#### Your data file

You use `createSliceHooks` in the file that exports the data layer for your connected components. You can structure this any way you want as long as you pass it a slice and saga. The following file is a minimal version of what you might start with:

```ts
import { createSlice } from '@reduxjs/toolkit'
import { createSliceHooks } from '@looker/redux'

interface State {
  count: number
}

const slice = createSlice({
  name: 'some/data',
  initialState: {
    count: 0,
  },
  reducers: {
    increment(state) {
      state.count++
    },
  },
})

export const { useActions, useStoreState } = createSliceHooks(slice)
```

Notice that nothing besides `useActions` and `useStoreState` is exported because your component generally won't need to know about anything else.

#### Your connected component file

Your component file might look like the following. It assumes that there is a store being provided in the context tree.

```tsx
import React from 'react'
import { useActions, useStoreState } from './data'

export const MyComponent = () => {
  const actions = useActions()
  const state = useStoreState()
  return (
    <button onClick={() => actions.increment()}>Clicked: {state.count}</button>
  )
}
```

Notice, first, that you don't need to pass anything to these hooks. They're bound to your slice, and optionally sagas, so your data layer can be a black-box API (in a good way). Also, notice how actions are pre-bound; you don't need to worry about calling `useDispatch`.

Most of the time, you'll probably only be using these APIs in your connected component. However, you there may also be cases where you want to export them as part of your API to share state and actions. In either case, the usage is similar because you don't need to know about slices or sagas and how they're registered.

### createStore

> Creates a store that is pre-configured for Looker usage and is enhanced to dynamically add reducers and sagas.

```ts
import { createStore } from '@looker/redux'

const store = createStore()
```

The `createStore()` function accepts all of the options that `configureStore()` from `@reduxjs/toolkit` does, except that `middleware` is required to be an array of middleware as `createStore` preloads middleware.

_We create several, very similar stores across the codebase. Currently both `web/` and `web/scenes/admin` each have their own stores, and many tests also use a store. This function sets up a store so that it can be used anywhere in the codebase, and eventually, hopefully, only use the single configuration provided by this function._

## Hooks

The hooks here are all composed into the hooks that `createSliceHooks` returns. They are:

- `useActions(slice: Slice)` - Binds a slice's action creators to dispatch().
- `useSaga(saga: any)` - Adds a saga to the nearest store.
- `useSagas(saga: any[])` - Adds an array of sagas to the nearest store. Generally used for backward compatibility where `registerSagas` was previously used.
- `useSlice(slice: Slice)` - Adds a slice to the nearest store.
- `useStoreState<State>(slice: Slice, saga: any): State` - Adds a saga and slice to the nearest store and returns the root state for the slice.

These hooks generally require you pass some form of a `slice` or `saga` into them, exposing more of your data layer's implementation details, but it does mean that you can adopt this API incrementally, for whatever reason.

Each of the following examples assumes a `./data` file with the following:

```ts
import { createSlice } from '@reduxjs/toolkit'

// Exported to show full API.
export interface State {
  count: number
}

// Exported to show full API.
// Empty to show how to use sagas.
export function* initSagas() {}

// Exported to show full API.
export const slice = createSlice({
  name: 'some/data',
  initialState: {
    count: 0,
  },
  reducers: {
    increment(state) {
      state.count++
    },
  },
})

// If you use these hooks, you don't need to export the above items.
export const { useActions, useStoreState } = createSliceHooks(slice, initSagas)
```

### Composing hooks individually

```tsx
import { useActions, useSaga, useSlice } from '@looker/redux'
import React from 'react'
import { useSelector } from 'react-redux'
import { saga, slice, State } from './data'

function selectState(store: any): State {
  return store?.data?.[slice.name]
}

export const MyComponent = () => {
  useSaga(saga)
  useSlice(slice)
  const actions = useActions(slice)
  const state = useSelector(selectState)
  return (
    <button onClick={() => actions.increment()}>Clicked: {state.count}</button>
  )
}
```

This is the most long-winded approach, but might be necessary if you can only use certain parts of the API. For example, you may only have time to refactor to dynamically register sagas, and might still have globally registered reducers which you will refactor at a later time. Maybe vice versa, or you might still be using thunks.

### Composing hooks with useStoreState

```tsx
import { useActions, useStoreState } from '@looker/redux'
import React from 'react'
import { saga, slice, State } from './data'

export const MyComponent = () => {
  const actions = useActions(slice)
  const state = useStoreState<State>(slice, saga)
  return (
    <button onClick={() => actions.increment()}>Clicked: {state.count}</button>
  )
}
```

The major difference between this example and the one above is that this one hides the implementation detail of having to register slices and sagas. You must still pass them in, however. This usage is the most likely scenario for adopting incrementally if you are already using `@reduxjs/tookit` and sagas.

### Compared to createSliceHooks

```tsx
import React from 'react'
import { useActions, useStoreState } from './data'

export const MyComponent = () => {
  const actions = useActions()
  const state = useStoreState()
  return (
    <button onClick={() => actions.increment()}>Clicked: {state.count}</button>
  )
}
```

This example shows the ideal scenario. Your component doesn't have to know about, slices, sagas, state types or manually dispatching. `MyComponent` acts much like `connect()` normally would, mapping state and props onto `<button />`.
