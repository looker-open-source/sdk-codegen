# Looker SDK code generator scripts

This package contains the Node-based scripts used by the Looker SDK Codegen project.

It has node dependencies, so it cannot be used in the browser.

**DEPRECATED AND NOT SUPPORTED**: Looker does not support direct use of this package, other than via direct use in the
[SDK Codegen project](https://github.com/looker-open-source/sdk-codegen) repository.

## Scripts

* [legacy.ts](src/legacy.ts) for the OpenAPI legacy code generator
* [sdkGen.ts](src/sdkGen.ts) is the entry point for the Looker SDK code generator
* [specConvert.ts](src/specConvert.ts) converts a swagger (OpenAPI 2.x) file to OpenAPI 3.x
* [yamlToJson.ts](src/yamlToJson.ts) converts a `YAML` file to a pretty-printed `JSON` file
