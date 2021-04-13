# Changelog

## [1.2.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-all-v1.1.0...sdk-codegen-all-v1.2.0) (2021-04-13)


### Features

* add source declaration links to API Explorer ([#578](https://www.github.com/looker-open-source/sdk-codegen/issues/578)) ([ce0e588](https://www.github.com/looker-open-source/sdk-codegen/commit/ce0e588787bdbc2e8ca4aadd44c31dc3ba1a0ef1))
* adds prism editor and implements for sdkdocs ([#581](https://www.github.com/looker-open-source/sdk-codegen/issues/581)) ([aea0424](https://www.github.com/looker-open-source/sdk-codegen/commit/aea042439d2358a61bbf705528d6006d694d5ea5))
* remember user's SDK language preference ([#567](https://www.github.com/looker-open-source/sdk-codegen/issues/567)) ([faa2511](https://www.github.com/looker-open-source/sdk-codegen/commit/faa25113d87072875ec5fb718da7eb10e0a518e4))


### Bug Fixes

* add missing bumper method to ICodeGen ([#575](https://www.github.com/looker-open-source/sdk-codegen/issues/575)) ([2a87467](https://www.github.com/looker-open-source/sdk-codegen/commit/2a87467ae9297d062257eaced6ebd09cd6d78856))
* add warning about python sdk login_user breaking change in 21.4.0 ([#579](https://www.github.com/looker-open-source/sdk-codegen/issues/579)) ([c74d447](https://www.github.com/looker-open-source/sdk-codegen/commit/c74d447e53d81c84d2182960f00ad2d3191b9cef))
* **ApiExplorer:** Added support for Golang syntax highlighting ([#563](https://www.github.com/looker-open-source/sdk-codegen/issues/563)) ([e2ae33e](https://www.github.com/looker-open-source/sdk-codegen/commit/e2ae33eb1d63b0f8d9987bf86bbed64641d4bea3))
* extends runit response height and fixes response models scrolling ([#558](https://www.github.com/looker-open-source/sdk-codegen/issues/558)) ([61627ce](https://www.github.com/looker-open-source/sdk-codegen/commit/61627ce282c1f7e4eaf082ccd66466060d2e7b98))
* remove search criteria selector and auto expand results ([#571](https://www.github.com/looker-open-source/sdk-codegen/issues/571)) ([e5a5ee7](https://www.github.com/looker-open-source/sdk-codegen/commit/e5a5ee7ddb2a9c6822dccc9493c994a9a826b419))
* RunIt request overflow  ([#565](https://www.github.com/looker-open-source/sdk-codegen/issues/565)) ([38665ac](https://www.github.com/looker-open-source/sdk-codegen/commit/38665ac40b6abc20557db66d0dc536c347c6a862))

## [1.1.0](https://www.github.com/looker-open-source/sdk-codegen/compare/sdk-codegen-all-v1.0.0...sdk-codegen-all-v1.1.0) (2021-04-02)


### ⚠ BREAKING CHANGES

* **python:** sdk.login, sdk.logout, and sdk.login_user will now behave exactly as the Looker API spec describes. The previous behavior can still be accessed via sdk.auth.login, sdk.auth.logout, and sdk.auth.login_user

### Features

* **apix:** adds scrolling to frame elements ([#526](https://www.github.com/looker-open-source/sdk-codegen/issues/526)) ([d7cd769](https://www.github.com/looker-open-source/sdk-codegen/commit/d7cd76917522c37e2902792405a75b8b9358e92f))
* **codegen:** Added --versions option to the code generator ([#514](https://www.github.com/looker-open-source/sdk-codegen/issues/514)) ([ee6f3e8](https://www.github.com/looker-open-source/sdk-codegen/commit/ee6f3e8f55e300df1a75c9be89b47f067bc08dee))
* **codegen:** added -n | --nostreams to code generator options ([#549](https://www.github.com/looker-open-source/sdk-codegen/issues/549)) ([6ead15a](https://www.github.com/looker-open-source/sdk-codegen/commit/6ead15a26093cc108912c8082b7267fb3a0b76b3))
* **codegen:** Looker 21.4 bindings ([#529](https://www.github.com/looker-open-source/sdk-codegen/issues/529)) ([4ecaec9](https://www.github.com/looker-open-source/sdk-codegen/commit/4ecaec93d991b9d82fd3a9ce584ee6ae8810341f))
* **python:** Add Flask app example ([92e088e](https://www.github.com/looker-open-source/sdk-codegen/commit/92e088e30f944540054b75d58614578b8fd5dd00))


### Bug Fixes

* **codegen:** legacy generator was broken ([#540](https://www.github.com/looker-open-source/sdk-codegen/issues/540)) ([212cfce](https://www.github.com/looker-open-source/sdk-codegen/commit/212cfce4745ea663322b2338d91315cefec451a9))
* **codegen:** Typescript SDK generator import logic ([#547](https://www.github.com/looker-open-source/sdk-codegen/issues/547)) ([c5aa033](https://www.github.com/looker-open-source/sdk-codegen/commit/c5aa033c749a2db8a0f98d5b8f49dc287fad06a2))
* **python:** auth_session uses transport_options ([#550](https://www.github.com/looker-open-source/sdk-codegen/issues/550)) ([94d6047](https://www.github.com/looker-open-source/sdk-codegen/commit/94d6047a0d52912ac082eb91616c1e7c379ab262))
* **python:** sdk login, login_user, logout methods ([#545](https://www.github.com/looker-open-source/sdk-codegen/issues/545)) ([e55086c](https://www.github.com/looker-open-source/sdk-codegen/commit/e55086c81401092e8dbd93e273ba101e2e3efe95))
