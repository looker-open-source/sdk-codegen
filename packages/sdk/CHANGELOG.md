# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [21.0.4]

- **BREAKING CHANGE**: Functionality dependent on node has been moved to a separate package, `@looker/sdk-node`. When upgrading the SDK in a node project you must add this new package as a dependency.
- **BREAKING CHANGE**: The `NodeSettingsIniFile` constructor has changed and now expects an enviroment prefix as the first parameter. If you are not using environment variables, set the prefix to an empty string.

## [21.0.0]

- Updated dependencies for security issues
- Updated package version to match Looker 21.0 version

## [7.20.0]

- **BREAKING CHANGE**: The internally constructed `stream` property of the SDK object has been removed. Instead, use:

```ts
import { Looker40SDKStream } from '@looker/sdk'

const sdkStream = new Looker40SDKStream(sdk.authSession)
```

See the [README](README.md#streaming-api-responses) for more information.

- ApiMethods no longer has apiVersion as a constructor parameter to clean up use in other factories such as the Extension SDK.
  This shouldn't affect consumers of the SDK-level declarations.
- SDK objects now have a static `ApiVersion` that reports the version of the API being used by that sdk
- Modified the packaging method of the TS SDKs to support better tree-shaking

## [0.3.7-beta.5]

- Moved sdk versioning constants out of the runtime into the sdk package
- [Looker 7.20 bindings](https://github.com/looker-open-source/sdk-codegen/pull/383)

## [0.3.7-beta.3]

### Added

- [Looker 7.18 bindings](https://github.com/looker-open-source/sdk-codegen/pull/350)

## [0.3.7-beta.2]

### Added

- [Looker 7.16 bindings](https://github.com/looker-open-source/sdk-codegen/pull/348)
