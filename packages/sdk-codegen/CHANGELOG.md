# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [21.0.17](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.16...sdk-codegen-v21.0.17) (2021-06-16)


### Features

* reduce size of apix bundle ([#676](https://www.github.com/looker-open-source/sdk-codegen/issues/676)) ([0d74f6a](https://www.github.com/looker-open-source/sdk-codegen/commit/0d74f6a7814b509416a9d2558c16439a4859b543))
* two-way type references ([#684](https://www.github.com/looker-open-source/sdk-codegen/issues/684)) ([fbc0565](https://www.github.com/looker-open-source/sdk-codegen/commit/fbc0565c4c8fe3d1488bd246e244bed56f1412a9))

### [21.0.16](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.15...sdk-codegen-v21.0.16) (2021-05-05)


### Bug Fixes

* use "TypeScript" and "JavaScript" everywhere ([#644](https://www.github.com/looker-open-source/sdk-codegen/issues/644)) ([c15031c](https://www.github.com/looker-open-source/sdk-codegen/commit/c15031cee189556adbd9e18641e7c992e86e3611))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.12 to ^21.0.13

### [21.0.15](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.14...sdk-codegen-v21.0.15) (2021-04-27)


### Bug Fixes

* added a missing "import type" statement to the TS SDK ([#632](https://www.github.com/looker-open-source/sdk-codegen/issues/632)) ([59c0f3d](https://www.github.com/looker-open-source/sdk-codegen/commit/59c0f3d418ca557c65e5690435ee2eca96c5231d))

### [21.0.14](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.13...sdk-codegen-v21.0.14) (2021-04-26)


### Features

* add noComment toggle to code generators ([#627](https://www.github.com/looker-open-source/sdk-codegen/issues/627)) ([90bbecb](https://www.github.com/looker-open-source/sdk-codegen/commit/90bbecbeb31c66bda31f6d14abcc50288e6d7ea1)), closes [#626](https://www.github.com/looker-open-source/sdk-codegen/issues/626)

### [21.0.13](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.12...sdk-codegen-v21.0.13) (2021-04-21)


### Features

* adds 'SDK Examples' data table ([#602](https://www.github.com/looker-open-source/sdk-codegen/issues/602)) ([3678c96](https://www.github.com/looker-open-source/sdk-codegen/commit/3678c96cc7c2edadd00013b66711c917a62d1000))


### Bug Fixes

* updated TypeScript, C#, Go language names in codeGenerators.ts ([#610](https://www.github.com/looker-open-source/sdk-codegen/issues/610)) ([13fb42b](https://www.github.com/looker-open-source/sdk-codegen/commit/13fb42b6bfa651a137e75b04fc6ee00620705ede))

### [21.0.12](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.11...sdk-codegen-v21.0.12) (2021-04-15)


### Features

* add source declaration links to API Explorer ([#578](https://www.github.com/looker-open-source/sdk-codegen/issues/578)) ([ce0e588](https://www.github.com/looker-open-source/sdk-codegen/commit/ce0e588787bdbc2e8ca4aadd44c31dc3ba1a0ef1))
* TypeScript SDK tree-shaking support ([#580](https://www.github.com/looker-open-source/sdk-codegen/issues/580)) ([8b7f2f0](https://www.github.com/looker-open-source/sdk-codegen/commit/8b7f2f00ab1a765a04bd460a1ca88e9b7bd66a98))


### Bug Fixes

* add missing bumper method to ICodeGen ([#575](https://www.github.com/looker-open-source/sdk-codegen/issues/575)) ([2a87467](https://www.github.com/looker-open-source/sdk-codegen/commit/2a87467ae9297d062257eaced6ebd09cd6d78856))
* add warning about python sdk login_user breaking change in 21.4.0 ([#579](https://www.github.com/looker-open-source/sdk-codegen/issues/579)) ([c74d447](https://www.github.com/looker-open-source/sdk-codegen/commit/c74d447e53d81c84d2182960f00ad2d3191b9cef))
* **ApiExplorer:** Added support for Golang syntax highlighting ([#563](https://www.github.com/looker-open-source/sdk-codegen/issues/563)) ([e2ae33e](https://www.github.com/looker-open-source/sdk-codegen/commit/e2ae33eb1d63b0f8d9987bf86bbed64641d4bea3))
* recursive search of direct type references ([#591](https://www.github.com/looker-open-source/sdk-codegen/issues/591)) ([9af2e37](https://www.github.com/looker-open-source/sdk-codegen/commit/9af2e3755fb4f7f987cc6980ed57e15f504295ba))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.11 to ^21.0.12

### [21.0.11](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.10...sdk-codegen-v21.0.11) (2021-04-02)


### Features

* Added --versions option to the code generator ([#514](https://www.github.com/looker-open-source/sdk-codegen/issues/514)) ([ee6f3e8](https://www.github.com/looker-open-source/sdk-codegen/commit/ee6f3e8f55e300df1a75c9be89b47f067bc08dee))


### Bug Fixes

* legacy generator was broken ([#540](https://www.github.com/looker-open-source/sdk-codegen/issues/540)) ([212cfce](https://www.github.com/looker-open-source/sdk-codegen/commit/212cfce4745ea663322b2338d91315cefec451a9))
* python sdk login, login_user, logout methods ([#545](https://www.github.com/looker-open-source/sdk-codegen/issues/545)) ([e55086c](https://www.github.com/looker-open-source/sdk-codegen/commit/e55086c81401092e8dbd93e273ba101e2e3efe95))
* TypeScript SDK generator import logic ([#547](https://www.github.com/looker-open-source/sdk-codegen/issues/547)) ([c5aa033](https://www.github.com/looker-open-source/sdk-codegen/commit/c5aa033c749a2db8a0f98d5b8f49dc287fad06a2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-codegen-utils bumped from ^21.0.10 to ^21.0.11
    * @looker/sdk-rtl bumped from ^21.0.10 to ^21.0.11

## [0.3.5-alpha.5]

### Added

- [API spec diff utility](https://github.com/looker-open-source/sdk-codegen/pull/380)
