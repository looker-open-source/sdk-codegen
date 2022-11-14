# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [21.7.3](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.7.2...sdk-codegen-v21.7.3) (2022-11-10)


### Bug Fixes

* spec parsing unit tests ([#1207](https://www.github.com/looker-open-source/sdk-codegen/issues/1207)) ([4e86291](https://www.github.com/looker-open-source/sdk-codegen/commit/4e862913b555c6294798d11eaa012b7f72736ecb))

### [21.7.2](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.7.1...sdk-codegen-v21.7.2) (2022-10-17)


### Bug Fixes

* various path navigation issues ([#1190](https://www.github.com/looker-open-source/sdk-codegen/issues/1190)) ([e73da3d](https://www.github.com/looker-open-source/sdk-codegen/commit/e73da3d39960cb528947c21202318b84d586ce1f))

### [21.7.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.7.0...sdk-codegen-v21.7.1) (2022-09-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.3.4 to ^21.4.0

## [21.7.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.6.0...sdk-codegen-v21.7.0) (2022-07-29)


### Features

* keep SDK request interfaces distinct ([#1125](https://www.github.com/looker-open-source/sdk-codegen/issues/1125)) ([50e925c](https://www.github.com/looker-open-source/sdk-codegen/commit/50e925c90eb3c5ffefc8e8535131471e2f2d0334))

## [21.6.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.5.2...sdk-codegen-v21.6.0) (2022-07-07)


### Features

* generate SDK 22.6 ([#1102](https://www.github.com/looker-open-source/sdk-codegen/issues/1102)) ([2162860](https://www.github.com/looker-open-source/sdk-codegen/commit/2162860f0bf292bce0a79f8115f7c9fc5628057f))


### Bug Fixes

* remove generated files from examples index ([#1076](https://www.github.com/looker-open-source/sdk-codegen/issues/1076)) ([d75bce8](https://www.github.com/looker-open-source/sdk-codegen/commit/d75bce8dc25d41fd6bc5e2e513782eaa6009fd10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.3.3 to ^21.3.4

### [21.5.2](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.5.1...sdk-codegen-v21.5.2) (2022-04-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.3.2 to ^21.3.3

## [21.5.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.4.0...sdk-codegen-v21.5.0) (2022-03-04)


### Features

* generate code deprecation tags ([#1006](https://www.github.com/looker-open-source/sdk-codegen/issues/1006)) ([afd4b66](https://www.github.com/looker-open-source/sdk-codegen/commit/afd4b66ffbd11cdacd19fe1353c9e5bf381fe932))


### Bug Fixes

* remove python version upper bound ([#1015](https://www.github.com/looker-open-source/sdk-codegen/issues/1015)) ([b1650a1](https://www.github.com/looker-open-source/sdk-codegen/commit/b1650a1a8a56c52a7a06ca5c9cef02300af7289e))

## [21.4.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.3.1...sdk-codegen-v21.4.0) (2022-02-14)


### ⚠ BREAKING CHANGES

* SDK support for 22.0

### Features

* fuzzy JSON value handling for the Swift SDK ([#961](https://www.github.com/looker-open-source/sdk-codegen/issues/961)) ([0b6b696](https://www.github.com/looker-open-source/sdk-codegen/commit/0b6b696742d67d1abc0cf69dfbf820f5a28d0f86))
* SDK build for 22.0. ([#959](https://www.github.com/looker-open-source/sdk-codegen/issues/959)) ([de651b3](https://www.github.com/looker-open-source/sdk-codegen/commit/de651b373978fd3689429c0cbdb364a2820fe211))
* SDK support for 22.0 ([5f9930c](https://www.github.com/looker-open-source/sdk-codegen/commit/5f9930c0b0f7bde59f0b9b47f882ae1f3ff9e490))


### Bug Fixes

* Update go codegen to set object as interface{} ([#980](https://www.github.com/looker-open-source/sdk-codegen/issues/980)) ([007989d](https://www.github.com/looker-open-source/sdk-codegen/commit/007989d6c438fa42ec261f5b216f2d933b489742))

### [21.3.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.2.0...sdk-codegen-v21.3.1) (2022-01-27)


### Features

* add http method to IRawResponse ([#925](https://www.github.com/looker-open-source/sdk-codegen/issues/925)) ([25cef47](https://www.github.com/looker-open-source/sdk-codegen/commit/25cef47fa61a5f15565560b48f5e0c45a0cd9b44))
* support string or numeric JSON format for numeric IDs in Swift ([#937](https://www.github.com/looker-open-source/sdk-codegen/issues/937)) ([1487d8a](https://www.github.com/looker-open-source/sdk-codegen/commit/1487d8a38432cef2e994d14001df18659522ca90))


### Bug Fixes

* enum naming and registration ([#918](https://www.github.com/looker-open-source/sdk-codegen/issues/918)) ([9d4a6cb](https://www.github.com/looker-open-source/sdk-codegen/commit/9d4a6cbfac5defad3a35389e2d46947d2135d349))

### [21.3.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.3.0...sdk-codegen-v21.3.1) (2021-12-20)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.3.0 to ^21.3.1

## [21.3.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.2.1...sdk-codegen-v21.3.0) (2021-12-16)


### Features

* add http method to IRawResponse ([#925](https://www.github.com/looker-open-source/sdk-codegen/issues/925)) ([25cef47](https://www.github.com/looker-open-source/sdk-codegen/commit/25cef47fa61a5f15565560b48f5e0c45a0cd9b44))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.2.0 to ^21.3.0

### [21.2.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.2.0...sdk-codegen-v21.2.1) (2021-12-06)


### Bug Fixes

* enum naming and registration ([#918](https://www.github.com/looker-open-source/sdk-codegen/issues/918)) ([9d4a6cb](https://www.github.com/looker-open-source/sdk-codegen/commit/9d4a6cbfac5defad3a35389e2d46947d2135d349))

## [21.2.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.1.1...sdk-codegen-v21.2.0) (2021-11-10)


### Features

* create @looker/extension-utils ([#886](https://www.github.com/looker-open-source/sdk-codegen/issues/886)) ([9d1720d](https://www.github.com/looker-open-source/sdk-codegen/commit/9d1720d9a4cec00c45195dd9c716d9a2a929264f))
* Looker 21.20 bindings ([#899](https://www.github.com/looker-open-source/sdk-codegen/issues/899)) ([304d0d0](https://www.github.com/looker-open-source/sdk-codegen/commit/304d0d0688349efad0499d37609605e14df7e97d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.1.1 to ^21.2.0

### [21.1.1](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.1.0...sdk-codegen-v21.1.1) (2021-10-27)


### Bug Fixes

* another TS SDK error handling tweak ([#873](https://www.github.com/looker-open-source/sdk-codegen/issues/873)) ([1c04952](https://www.github.com/looker-open-source/sdk-codegen/commit/1c049527e22926fa7fe0ae011ab4595520005e2f))
* do not "reserve" type names ending in [] ([#876](https://www.github.com/looker-open-source/sdk-codegen/issues/876)) ([bab56ef](https://www.github.com/looker-open-source/sdk-codegen/commit/bab56ef1c60389d04e8a1e4973afde0d0b75d5ec))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.1.0 to ^21.1.1

## [21.1.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.25...sdk-codegen-v21.1.0) (2021-10-19)


### Features

* closest path match for API Explorer ([#811](https://www.github.com/looker-open-source/sdk-codegen/issues/811)) ([45fd26f](https://www.github.com/looker-open-source/sdk-codegen/commit/45fd26fb0f325fa90edfec72f835ed3a79b9afeb))
* makeTheCall for Kotlin and type tagging ([#833](https://www.github.com/looker-open-source/sdk-codegen/issues/833)) ([2ca950e](https://www.github.com/looker-open-source/sdk-codegen/commit/2ca950e16c9c172d3e67de58261df16e424efaa3))
* support either string or numeric JSON values with AnyString ([#848](https://www.github.com/looker-open-source/sdk-codegen/issues/848)) ([9b428f5](https://www.github.com/looker-open-source/sdk-codegen/commit/9b428f5dc871477402f1683cffaadfad55501878))
* Update Kotlin SDK to use Gson instead of Jackson ([#836](https://www.github.com/looker-open-source/sdk-codegen/issues/836)) ([4d1f789](https://www.github.com/looker-open-source/sdk-codegen/commit/4d1f789fa3b97b0808f06d5d547c96de3ca890ff))


### Bug Fixes

* intrinsic type params are not Partial<T> ([#819](https://www.github.com/looker-open-source/sdk-codegen/issues/819)) ([4b31490](https://www.github.com/looker-open-source/sdk-codegen/commit/4b31490f7ce5c9593854e56518245c5399ea9548))
* Property names with special characters in Kotlin SDK ([#838](https://www.github.com/looker-open-source/sdk-codegen/issues/838)) ([40b6b24](https://www.github.com/looker-open-source/sdk-codegen/commit/40b6b24bfedf8ba16b5dbae2abbbdce2f73c1ffd))
* request content initialization and filtering for RunIt requests ([#852](https://www.github.com/looker-open-source/sdk-codegen/issues/852)) ([474ee93](https://www.github.com/looker-open-source/sdk-codegen/commit/474ee9365dafe6549826a9f627ac0a79dc0e9a56))
* stack overflow for type tagging during codegen ([#845](https://www.github.com/looker-open-source/sdk-codegen/issues/845)) ([4ece1b3](https://www.github.com/looker-open-source/sdk-codegen/commit/4ece1b374d9d4b73c1f3fd0512ab54da209c6be6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.20 to ^21.1.0

### [21.0.25](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.24...sdk-codegen-v21.0.25) (2021-09-01)


### Bug Fixes

* spec refresh ([#801](https://www.github.com/looker-open-source/sdk-codegen/issues/801)) ([a10245a](https://www.github.com/looker-open-source/sdk-codegen/commit/a10245aa7ea180670d9d8219810aab88eb50854d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.19 to ^21.0.20

### [21.0.24](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.23...sdk-codegen-v21.0.24) (2021-08-11)


### Features

* fetch API specifications for stand-alone API Explorer ([#789](https://www.github.com/looker-open-source/sdk-codegen/issues/789)) ([f7be1fb](https://www.github.com/looker-open-source/sdk-codegen/commit/f7be1fb589570137c5ab39304910c57f721de8fb))

### [21.0.23](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.22...sdk-codegen-v21.0.23) (2021-07-30)


### Bug Fixes

* improved writeable type support ([#766](https://www.github.com/looker-open-source/sdk-codegen/issues/766)) ([be91bd8](https://www.github.com/looker-open-source/sdk-codegen/commit/be91bd8e772f9a64c47486b317f1ac1f6ef14327))
* remove unused net/url import from go ([#767](https://www.github.com/looker-open-source/sdk-codegen/issues/767)) ([35d912c](https://www.github.com/looker-open-source/sdk-codegen/commit/35d912c1e31e5817a2b6a81084753a66a4860338)), closes [#765](https://www.github.com/looker-open-source/sdk-codegen/issues/765)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.18 to ^21.0.19

### [21.0.22](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.21...sdk-codegen-v21.0.22) (2021-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.17 to ^21.0.18

### [21.0.21](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.20...sdk-codegen-v21.0.21) (2021-07-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.16 to ^21.0.17

### [21.0.20](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.19...sdk-codegen-v21.0.20) (2021-07-02)


### Bug Fixes

* python remove runtime asserts ([#703](https://www.github.com/looker-open-source/sdk-codegen/issues/703)) ([9b963c3](https://www.github.com/looker-open-source/sdk-codegen/commit/9b963c3367905f907e7867df1446f56e18284c3b)), closes [#695](https://www.github.com/looker-open-source/sdk-codegen/issues/695)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.15 to ^21.0.16

### [21.0.19](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.18...sdk-codegen-v21.0.19) (2021-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.14 to ^21.0.15

### [21.0.18](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-v21.0.17...sdk-codegen-v21.0.18) (2021-06-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/sdk-rtl bumped from ^21.0.13 to ^21.0.14

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
