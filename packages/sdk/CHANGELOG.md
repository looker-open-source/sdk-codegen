# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [21.8.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.6.1...sdk-v21.8.0) (2021-06-17)


### Features

* Looker 21.8 bindings ([#705](https://www.github.com/looker-open-source/sdk-codegen/issues/705)) ([032d0f8](https://www.github.com/looker-open-source/sdk-codegen/commit/032d0f80e30356aaa9f3b3f987b315203f896a61))

### [21.6.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.6.0...sdk-v21.6.1) (2021-06-16)


### Bug Fixes

* export funcs for TS SDK ([#693](https://www.github.com/looker-open-source/sdk-codegen/issues/693)) ([eec853e](https://www.github.com/looker-open-source/sdk-codegen/commit/eec853e87d35e4908d3416d6f3b1d98209ab22f5))

## [21.6.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.4.3...sdk-v21.6.0) (2021-05-05)


### Features

* update SDKs to Looker 21.6 ([#666](https://www.github.com/looker-open-source/sdk-codegen/issues/666)) ([b2b6b79](https://www.github.com/looker-open-source/sdk-codegen/commit/b2b6b793e38d05d0fcb6236505fb581778d12094))


### Bug Fixes

* improve TS SDK imports/exports ([#657](https://www.github.com/looker-open-source/sdk-codegen/issues/657)) ([4c2ec6e](https://www.github.com/looker-open-source/sdk-codegen/commit/4c2ec6ea390bb27d123c333f6d559749efa33830))
* use "TypeScript" and "JavaScript" everywhere ([#644](https://www.github.com/looker-open-source/sdk-codegen/issues/644)) ([c15031c](https://www.github.com/looker-open-source/sdk-codegen/commit/c15031cee189556adbd9e18641e7c992e86e3611))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.12 to ^21.0.13

### [21.4.3](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.4.2...sdk-v21.4.3) (2021-04-27)


### Bug Fixes

* added a missing "import type" statement to the TS SDK ([#632](https://www.github.com/looker-open-source/sdk-codegen/issues/632)) ([59c0f3d](https://www.github.com/looker-open-source/sdk-codegen/commit/59c0f3d418ca557c65e5690435ee2eca96c5231d))

### [21.4.2](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.4.1...sdk-v21.4.2) (2021-04-26)


### Bug Fixes

* use "import type" in the TypeScript SDK ([#623](https://www.github.com/looker-open-source/sdk-codegen/issues/623)) ([c7b5bf8](https://www.github.com/looker-open-source/sdk-codegen/commit/c7b5bf8135db37256b8b119240f1c5a6103dde63))

### [21.4.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.4.0...sdk-v21.4.1) (2021-04-15)


### Features

* TypeScript SDK tree-shaking support ([#580](https://www.github.com/looker-open-source/sdk-codegen/issues/580)) ([8b7f2f0](https://www.github.com/looker-open-source/sdk-codegen/commit/8b7f2f00ab1a765a04bd460a1ca88e9b7bd66a98))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.11 to ^21.0.12

## [21.4.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-v21.0.10...sdk-v21.4.0) (2021-04-02)


### Features

* Added --versions option to the code generator ([#514](https://www.github.com/looker-open-source/sdk-codegen/issues/514)) ([ee6f3e8](https://www.github.com/looker-open-source/sdk-codegen/commit/ee6f3e8f55e300df1a75c9be89b47f067bc08dee))
* Looker 21.4 bindings ([#529](https://www.github.com/looker-open-source/sdk-codegen/issues/529)) ([4ecaec9](https://www.github.com/looker-open-source/sdk-codegen/commit/4ecaec93d991b9d82fd3a9ce584ee6ae8810341f))


### Bug Fixes

* TypeScript SDK generator import logic ([#547](https://www.github.com/looker-open-source/sdk-codegen/issues/547)) ([c5aa033](https://www.github.com/looker-open-source/sdk-codegen/commit/c5aa033c749a2db8a0f98d5b8f49dc287fad06a2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.10 to ^21.0.11

## [21.0.8]

- Published latest SDK

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
