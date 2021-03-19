# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [21.1.0](https://www.github.com/looker-open-source/sdk-codegen/compare/lktstpy-v21.0.0...lktstpy-v21.1.0) (2021-03-19)


### Features

* updating a bunch of docs ([#494](https://www.github.com/looker-open-source/sdk-codegen/issues/494)) ([8722051](https://www.github.com/looker-open-source/sdk-codegen/commit/872205152048f80dd7a1c2b9c4ecc1c8a9775b1c))

## [21.0.0](https://www.github.com/looker-open-source/sdk-codegen/compare/v7.20.0...v21.0.0) (2021-02-28)


### Features

* **python:** Looker 7.20 bindings ([#451](https://www.github.com/looker-open-source/sdk-codegen/issues/451)) ([55a20d5](https://www.github.com/looker-open-source/sdk-codegen/commit/55a20d549cab0fe950f999130706654e8fb1efcb))


### Bug Fixes

* **python:** pin cattrs at 1.1.2 ([#460](https://www.github.com/looker-open-source/sdk-codegen/issues/460)) ([bf8f3f6](https://www.github.com/looker-open-source/sdk-codegen/commit/bf8f3f694efd3a2b7af7d5c849694e0c7bd399c5)), closes [#455](https://www.github.com/looker-open-source/sdk-codegen/issues/455)

## [7.20.0]

### Added

- Looker 7.20 bindings - note that this package version will now follow Looker major/minor versioning.

### Fixed

- Pinning cattrs 1.1.2 for pyton >= 3.7 as 1.2.0 [has an unstructure bug](https://github.com/Tinche/cattrs/issues/119)


## [0.1.3b21]

### Fixed

- [Pass headers per sdk call](https://github.com/looker-open-source/sdk-codegen/issues/387)


## [0.1.3b20]

### Added

- Python 3.9 support

### Fixed

- cattrs and attrs version [pinning per python version](https://github.com/looker-open-source/sdk-codegen/pull/374)


## [0.1.3b19]

### Added

- [Looker 7.18 bindings](https://github.com/looker-open-source/sdk-codegen/pull/350)


## [0.1.3b18]

### Added

- [Looker 7.16 bindings](https://github.com/looker-open-source/sdk-codegen/pull/348)


## [0.1.3b17]

### Fixed

- Properties that should have been typed `Sequence[SomeEnum]` were incorrectly typed `SomeEnum` [Bug report](https://github.com/looker-open-source/sdk-codegen/issues/334) and [fix](https://github.com/looker-open-source/sdk-codegen/pull/335)


## [0.1.3b16]

### Added

- [Dictionary input/ouput support](https://github.com/looker-open-source/sdk-codegen/commit/ada7ec0f9aa122eebe391f79507b9bbe118e3882)
- [Looker 7.14 bindings](https://github.com/looker-open-source/sdk-codegen/commit/62cc1b1ceba95fe28541343bb27cd2e019ae4e35)

### Changed

- Enum generated for parameter, property, or type with an `x-looker-values` or `enum` value list declaration [#241](https://github.com/looker-open-source/sdk-codegen/pull/241), [#242](https://github.com/looker-open-source/sdk-codegen/pull/242) and [#282](https://github.com/looker-open-source/sdk-codegen/pull/282)

### Fixed

- [Use base64 encoding for OAuth session PKCE](https://github.com/looker-open-source/sdk-codegen/commit/637a0d66a352d86c236c6dea2fdd65d10fe90dd0)
