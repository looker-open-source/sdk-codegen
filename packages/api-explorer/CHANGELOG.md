# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [21.1.1](https://www.github.com/looker-open-source/sdk-codegen/compare/api-explorer-v21.1.0...api-explorer-v21.1.1) (2021-03-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/run-it bumped from ^21.0.10 to ^21.0.11
    * @joeldodge/sdk bumped from ^21.0.9 to ^21.5.0
    * @joeldodge/sdk-codegen bumped from ^21.1.0 to ^21.1.1
    * @joeldodge/sdk-rtl bumped from ^21.0.9 to ^21.1.0
  * devDependencies
    * @joeldodge/sdk-codegen-scripts bumped from ^21.0.10 to ^21.0.11
    * @joeldodge/sdk-node bumped from ^21.0.9 to ^21.1.0

## [21.1.0](https://www.github.com/looker-open-source/sdk-codegen/compare/api-explorer-v21.0.9...api-explorer-v21.1.0) (2021-03-19)


### Features

* updating a bunch of docs ([#494](https://www.github.com/looker-open-source/sdk-codegen/issues/494)) ([0639c48](https://www.github.com/looker-open-source/sdk-codegen/commit/0639c485b40959eff55de31c8ceffa989f69a87e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/run-it bumped from ^21.0.9 to ^21.0.10
    * @joeldodge/sdk-codegen bumped from ^21.0.9 to ^21.1.0
  * devDependencies
    * @joeldodge/sdk-codegen-scripts bumped from ^21.0.9 to ^21.0.10

## [Current]

### Added

- This change log file
- Response types now have nested types correctly documented
- The response type processing functions now have arguments for the number of levels to expand nested types
- API explorer's default expansion depth is one level deep
- Added [`ExploreType`](/packages/api-explorer/src/components/ExploreType/ExploreType.tsx) and [`ExploreProperty`](/packages/api-explorer/src/components/ExploreType/ExploreProperty.tsx) components used to display responses and explore the type on the type page
