# RunIt

**RunIt** is a React-based specification-driven REST API request tester.

Looker's [API Explorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/api-explorer) uses the **RunIt** package for testing API endpoints.

A configuration provider interface enables **RunIt** to work both in the [Looker Extension Framework](https://docs.looker.com/data-modeling/extension-framework/extension-framework-intro) runtime environment and as a stand-alone browser application.

OAuth and CORS [are used](https://github.com/looker-open-source/sdk-codegen/blob/main/docs/cors.md) to authenticate and submit REST requests for the stand-alone version.

## RunIt tabs

The [RunIt](src/RunIt.tsx) component has multiple tabs:

### Request

The Request tab displays a form for entering inputs to the chosen REST API endpoint

### Response

API responses are displayed on this tab. Support for rendering a variety of API response types like as JSON, CSV, Markdown, JPEG, HTML, PNG, and SQL are supported.

### SDK Call

The language SDK calling syntax provided by the Looker codegen project (also in this repository) is shown on this tab.

### Performance

Only for the stand-alone version, some performance information for HTTP request and response processing is shown here.

### Configuration

Only for the stand-alone version, this tab is used to configure the OAuth server for API request tokens.

## Using RunIt

See the [stand-alone API Explorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/api-explorer/src/StandaloneApiExplorer.tsx) and the [extension version of API Explorer](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-api-explorer/src/ExtensionApiExplorer.tsx) for reference implementations.
