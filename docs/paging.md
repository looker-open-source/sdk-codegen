# API response paging

Looker is adding [alpha-level](#alpha-support-level) support for API response paging in Looker API 4.0.

Any endpoint that accepts `limit` and `offset` parameters can support generic paging. Starting with Looker release 21.12, Looker is adding paging support for API 4.0 endpoints (until all endpoints that accept `limit` and `offset` provide the headers).

| Parameter | Description                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`   | If provided, this value sets the number of results to return per _page_ and triggers paging headers to be provided.                                                                    |
| `offset`  | This value sets the starting position of the results to return. A value of `0` (zero) is used for the first result. `offset` defaults to 0 if `limit` is provided and `offset` is not. |

Some endpoints have `page` and `per_page` parameters instead of, or in addition to, `limit` and `offset`. The `limit` and `offset` parameters take precedence over the `page` and `per_page` parameters for endpoints that support both.
Only API calls specifying `limit` or `per_page` will produce paging headers for those endpoints that provide paging headers. The response paging headers use `limit` and `offset` parameters even if the original API request uses `page` and `per_page`.

**NOTE**: The `page` and `per_page` parameters are deprecated for API 4.0 and may be removed before API 4.0 is released as _stable_. Also, the Looker API does not support cursor-based paging.

## Paging headers

The [`X-Total-Count`](https://stackoverflow.com/a/43968710) and [`Link`](https://datatracker.ietf.org/doc/html/rfc5988) headers provide all the information required for an SDK to generically page API calls that return a collection of items.

### X-Total-Count header

If the `total count` of items can be known, the value of this header is that count. If `total count` is unknown, this header is not in the endpoint response.

Because many Looker endpoints restrict the user's ability to view individual items of a collection based on complex access constraints, sometimes calculating the total count degrades performance too much to calculate it.

### Link header

The Looker API adopts the [GitHub Link header values](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header).

Paging responses always include `Link` headers. Different **Link Relation Type** (`rel`) values may or may not exist in the Link header.

The table below explains Looker's use of the `rel` values adopted from GitHub.

| Rel     | Description                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `first` | The URI to the first page of results. This link is always provided.                                                                   |
| `next`  | The URI to the next page of results. This link is provided when `total count` is known or the number of items returned == the `limit` |
| `prev`  | The URI to the previous page of results. This link is provided when there **is** a previous page.                                     |
| `last`  | The URI to the last page of results. This link can only be provided when `total count` is known.                                      |

Here is an example of a "full" Link header's content:

```
<http://localhost/api/4.0/alerts/search?imit=2&offset=0>; rel="first",
<http://localhost/api/4.0/alerts/search?limit=2&offset=8>; rel="last",
<http://localhost/api/4.0/alerts/search?limit=2&offset=7>; rel="next",
<http://localhost/api/4.0/alerts/search?limit=2&offset=3>; rel="prev"
```

## SDK Paging

Thanks to the adoption of the "standard" paging headers shown above, the SDKs can implement API result paging generically.

The current SDK-based paging pattern prototype is in the `@looker/sdk-rtl` TypeScript/Javascript package.

### Paging interface

The main routines that initialize SDK paging are the functions `pager` and `pageAll`, and the class `Paging` defined in [paging.ts](../packages/sdk-rtl/src/paging.ts).

### Page iteration example

Results can be retrieved a page at a time with code like this sample:

```ts
// "Monolithic" SDK search function
async function dashboardSearchResultsByPage(
  inTitle: string,
  limit: number = 100
) {
  const sdk = new Looker40SDK(session);
  return await pager(sdk, () =>
    sdk.search_dashboards({ title: inTitle, limit })
  );
}

const pagedDashboards = await dashboardSearchResultsByPage('JOEL');
for (const dash of pagedDashboards.items) {
  console.log(dash.title);
}
while (pagedDashboards.more()) {
  for (const dash of await pagedDashboards.nextPage()) {
    console.log(dash.title);
  }
}
```

For the functional SDK, the syntax is almost identical (the imports will vary). The search function can be changed to:

```ts
// Functional SDK search function
async function dashboardSearchResultsByPage(
  inTitle: string,
  limit: number = 100
) {
  const sdk = new Looker40SDK(session);
  return await pager(sdk, () =>
    search_dashboards(sdk, { title: inTitle, limit })
  );
}
```

**Note** The above examples will only work correctly when a Looker release with paging headers for the API 4.0 implementation of `search_dashboards` is available.

## Alpha support level

Support for paging headers is currently at alpha level. This means that:

- Not all endpoints with `limit` and `offset` parameters provide paging headers.
- Paging performance may vary for large results sets. We recommend making the `limit` size a larger value (half or a quarter of the total count, perhaps) to reduce paging if performance degradation is noticed as the `offset` grows larger.
- Currently, SDK support for paging is only available in the Typescript SDK prototype.
- While SDK paging routines **should** work for API endpoints that provide paging headers, reliability is not guaranteed, and SDK paging routines are only "community supported." This means that issues can be filed in this repository and Looker engineering will attempt to address them, but no timeframe or response is guaranteed.
