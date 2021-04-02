# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [0.9.1](https://www.github.com/looker-open-source/sdk-codegen/compare/api-explorer-v0.9.0...api-explorer-v0.9.1) (2021-04-02)


### Features

* Added --versions option to the code generator ([#514](https://www.github.com/looker-open-source/sdk-codegen/issues/514)) ([ee6f3e8](https://www.github.com/looker-open-source/sdk-codegen/commit/ee6f3e8f55e300df1a75c9be89b47f067bc08dee))
* adds scrolling to frame elements ([#526](https://www.github.com/looker-open-source/sdk-codegen/issues/526)) ([d7cd769](https://www.github.com/looker-open-source/sdk-codegen/commit/d7cd76917522c37e2902792405a75b8b9358e92f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @looker/run-it bumped from ^0.9.0 to ^0.9.1
    * @looker/sdk bumped from ^21.0.10 to ^21.4.0
    * @looker/sdk-codegen bumped from ^21.0.10 to ^21.0.11
    * @looker/sdk-rtl bumped from ^21.0.10 to ^21.0.11
  * devDependencies
    * @looker/sdk-codegen-scripts bumped from ^21.0.9 to ^21.0.11
    * @looker/sdk-node bumped from ^21.0.10 to ^21.4.0

### [0.9.0]

### Added

- This change log file
- Response types now have nested types correctly documented
- The response type processing functions now have arguments for the number of levels to expand nested types
- API explorer's default expansion depth is one level deep
- Added [`ExploreType`](/packages/api-explorer/src/components/ExploreType/ExploreType.tsx) and [`ExploreProperty`](/packages/api-explorer/src/components/ExploreType/ExploreProperty.tsx) components used to display responses and explore the type on the type page