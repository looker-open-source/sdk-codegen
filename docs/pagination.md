# API response pagination

Looker is adding [alpha-level](#alpha-support-level) support for API response pagination in Looker API 4.0.

Any endpoint that accepts `limit` and `offset` parameters can support generic pagination. Starting with Looker release 21.12, Looker is adding pagination support for API 4.0 endpoints (until all endpoints that accept `limit` and `offset` provide the headers).

| Parameter | Description                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`   | If provided, this value sets the number of results to return per _page_ and triggers pagination headers to be provided.                                                                |
| `offset`  | This value sets the starting position of the results to return. A value of `0` (zero) is used for the first result. `offset` defaults to 0 if `limit` is provided and `offset` is not. |

Some endpoints have `page` and `per_page` parameters instead of, or in addition to, `limit` and `offset`. The `limit` and `offset` parameters take precedence over the `page` and `per_page` parameters for endpoints that support both.
Only API calls specifying `limit` will produce pagination headers for those endpoints that provide pagination headers.

**NOTE**: The `page` and `per_page` parameters may be removed for API 4.0. Looker does not support cursor-based pagination.

## Pagination headers

The [`X-Total-Count`](https://stackoverflow.com/a/43968710) and [`Link`](https://datatracker.ietf.org/doc/html/rfc5988) headers provide all information required for an SDK to generically paginate API calls that return a collection of items.

### X-Total-Count header

If the `total count` of items can be known, the value of this header is that count. If `total count` is unknown, this header is not in the endpoint response.

Because many Looker endpoints restrict the user's ability to view individual items of a collection based on complex access constraints, sometimes calculating the total count degrades performance too much to calculate it.

### Link header

The Looker API adopts the [GitHub Link header values](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header).

Pagination responses always include `Link` headers. Different **Link Relation Type** (`rel`) values may or may not exist in the Link header.

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

## SDK Pagination

Thanks to the adoption of the "standard" pagination headers shown above, the SDKs can implement API result pagination generically.

The current SDK-based pagination pattern prototype is in the `@looker/sdk-rtl` TypeScript/Javascript package.

### Paginator interface

The main routines that initialize SDK pagination are below.
The latest implementation is in the [current source code](/packages/sdk-rtl/src/paginator.ts).

```ts
/**
 * Create an API response paginator for an endpoint that returns a Link header
 * @param sdk implementation of IAPIMethods. Can be full SDK or functional auth session
 * @param func sdk call that includes a pagination header
 * @param options transport options override to capture and use in paging requests
 *
 * @remarks `TSuccess` must be a collection type that supports `length`
 */
export async function paginate<TSuccess extends ILength, TError>(
  sdk: IAPIMethods,
  func: PaginateFunc<TSuccess, TError>,
  options?: Partial<ITransportSettings>
): Promise<IPaginate<TSuccess, TError>> {
  return await new Paginator<TSuccess, TError>(sdk, func, options).init()
}

/**
 * Create an API response paginator and collect all pages, returning the result
 * @param sdk implementation of IAPIMethods. Can be full SDK or functional auth session
 * @param func sdk call that includes a pagination header
 * @param onPage observer of the latest page of results. Defaults to noop.
 * @param options transport options override to capture and use in paging requests
 */
export async function pageAll<TSuccess extends ILength, TError>(
  sdk: IAPIMethods,
  func: PaginateFunc<TSuccess, TError>,
  onPage: PageObserver<TSuccess> = (page: TSuccess) => page,
  options?: Partial<ITransportSettings>
): Promise<SDKResponse<TSuccess, TError>> {
  const paged = await paginate(sdk, func, options)
  let rows: any[] = []
  rows = rows.concat(onPage(paged.items))
  let error
  try {
    while (paged.more()) {
      const items = await sdk.ok(paged.nextPage())
      rows = rows.concat(onPage(items))
    }
  } catch (err) {
    error = err
  }
  if (error) {
    return { ok: false, error }
  }
  return { ok: true, value: rows as unknown as TSuccess }
}
```

### Page iteration example

Results can be retrieved a page at a time with code like this functional test:

```ts
describe('pagination', () => {
  describe('paginate', () => {
    test(
      'getRel can override limit and offset',
      async () => {
        const sdk = new LookerSDK(session)
        const limit = 2
        const all = await sdk.ok(sdk.search_dashboards({ fields: 'id' }))
        const paged = await paginate(sdk, () =>
          sdk.search_dashboards({ fields: 'id', limit })
        )
        const full = await sdk.ok(paged.getRel('first', all.length))
        expect(full).toEqual(all)
      },
      testTimeout
    )
  })
  describe('pageAll', () => {
    test(
      'search_dashboard',
      async () => {
        const sdk = new LookerSDK(session)
        // Use a small limit to test paging for a small number of dashboards
        const limit = 2
        let count = 0
        const progress = (page: IDashboard[]) => {
          console.log(`Page ${++count} has ${page.length} items`)
          return page
        }
        const actual = await sdk.ok(
          pageAll(
            sdk,
            () => sdk.search_dashboards({ fields: 'id,title', limit }),
            progress
          )
        )
        const all = await sdk.ok(sdk.search_dashboards({ fields: 'id, title' }))
        expect(actual.length).toEqual(all.length)
        expect(actual).toEqual(all)
      },
      testTimeout
    )
  })
})
```

This test code verifies:

- correct retrieval of all `search_dashboard` pages
- that pagination stops when it should

**Note** The above test will only work correctly when a Looker release with pagination headers for the API 4.0 implementation of `search_dashboards` is available.

## Alpha support level

Support for pagination headers is currently at alpha level. This means that:

- Not all endpoints with `limit` and `offset` parameters provide pagination headers.
- Pagination performance may vary for large results sets. We recommend making the `limit` size a larger value (half or a quarter of the total count, perhaps) to reduce pagination if performance degradation is experienced.
- SDK support for pagination is only available in the Typescript SDK prototype.
- While SDK pagination routines **should** work for API endpoints that provide pagination headers, reliability is not guaranteed, and SDK pagination routines are only "community supported." This means that issues can be filed in this repository and Looker engineering will attempt to address them, but no timeframe or response is guaranteed.
