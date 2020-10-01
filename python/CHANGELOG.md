# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
