# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [21.0.13](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-rtl-v21.0.12...sdk-rtl-v21.0.13) (2021-05-01)


### Bug Fixes

* use "TypeScript" and "JavaScript" everywhere ([#644](https://www.github.com/looker-open-source/sdk-codegen/issues/644)) ([c15031c](https://www.github.com/looker-open-source/sdk-codegen/commit/c15031cee189556adbd9e18641e7c992e86e3611))

### [21.0.12](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-rtl-v21.0.11...sdk-rtl-v21.0.12) (2021-04-15)


### Features

* TypeScript SDK tree-shaking support ([#580](https://www.github.com/looker-open-source/sdk-codegen/issues/580)) ([8b7f2f0](https://www.github.com/looker-open-source/sdk-codegen/commit/8b7f2f00ab1a765a04bd460a1ca88e9b7bd66a98))


### Bug Fixes

* TypeScript OAuth test ([#597](https://www.github.com/looker-open-source/sdk-codegen/issues/597)) ([d84d1fc](https://www.github.com/looker-open-source/sdk-codegen/commit/d84d1fc976b52f01981592eacb3abc8e1aab9f1f))

### [21.0.11](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-rtl-v21.0.10...sdk-rtl-v21.0.11) (2021-04-02)


### Features

* Added --versions option to the code generator ([#514](https://www.github.com/looker-open-source/sdk-codegen/issues/514)) ([ee6f3e8](https://www.github.com/looker-open-source/sdk-codegen/commit/ee6f3e8f55e300df1a75c9be89b47f067bc08dee))


### Bug Fixes

* TypeScript SDK generator import logic ([#547](https://www.github.com/looker-open-source/sdk-codegen/issues/547)) ([c5aa033](https://www.github.com/looker-open-source/sdk-codegen/commit/c5aa033c749a2db8a0f98d5b8f49dc287fad06a2))

## [21.0.8]

- Published latest SDK

## [21.0.0]

- Updated dependencies for security issues
- Updated package version to match Looker 21.0 version

## [0.3.7-beta.5]

- The SDK environment variable prefix can now be set to an empty string to avoid reading environment variables in [NodeSettingsIniFile() and NodeSettings()](src/nodeSettings.ts)
- [Looker 7.20 bindings](https://github.com/looker-open-source/sdk-codegen/pull/383)
