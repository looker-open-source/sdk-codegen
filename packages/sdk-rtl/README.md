# Looker SDK Runtime Library

The Looker Typescript/Javascript SDK depends on the runtime code in this package.

The source code in this package is almost all completely generic REST request/response processing code.

The `@looker/sdk` package is updated with every Looker release. This package has a much longer update/release cycle.

**DISCLAIMER**: This is a _beta_ version of the Looker SDK runtime library. Implementations are still subject to change.

## Using jest tests with this SDK as a dependency

This jest config entry may be required to run jest tests on projects which depend on this package.

```js
  transform: {
    '^.+\\.(js|ts|tsx)?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@looker/(sdk-rtl|sdk)/.*)',
  ],
```
