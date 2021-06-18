# API response pagination

Looker is adding [alpha-level](#alpha-support-level) support for API response pagination in Looker API 4.0.

Any endpoint that accepts `limit` and `offset` parameters can support generic pagination. Starting with Looker release 21.12, Looker is adding pagination support for API 4.0 endpoints (until all endpoints that accept `limit` and `offset` provide the headers).

| Parameter | Description                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`   | If provided, this value sets the number of results to return per _page_ and triggers pagination headers to be provided.                                                                |
| `offset`  | This value sets the starting position of the results to return. A value of `0` (zero) is used for the first result. `offset` defaults to 0 if `limit` is provided and `offset` is not. |

Some endpoints have `page` and `per_page` parameters instead of, or in addition to, `limit` and `offset`. The `page` and `per_page` parameters will be removed for API 4.0 endpoints that accept `limit` and `offset`. Only API calls using `limit` will produce pagination headers.

**NOTE**: Looker does not support cursor-based pagination.

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

Thanks to the adoption of "standard" headers for pagination shown above, the SDKs can implement API result pagination generically.

The current SDK-based pagination pattern prototype is in the `@looker/sdk-rtl` TypeScript/Javascript package.

### Paginator interface

Below is the pagination interface prototype. The latest version is in the [current source code](/packages/sdk-rtl/src/paginator.ts).

```ts
/**
 * Types of pagination link relative URLs
 * based on https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header
 */
export type PageLinkRel = 'first' | 'last' | 'next' | 'prev'

/** Pagination function call */
export type PaginateFunc<TSuccess, TError> = () => Promise<
  SDKResponse<TSuccess, TError>
>

/** Page link structure */
export interface IPageLink {
  /** Name of link */
  name?: string
  /** Type of link */
  rel: PageLinkRel
  /** Media type for link */
  mediaType?: string
  /** URL for retrieving the link results */
  url: string
}

/**
 * Collection of page links
 */
export type PageLinks = Record<string, IPageLink>

export interface IPaginate<TSuccess, TError> {
  /** Total number of available items being paginated */
  total: number
  /** Offset extracted from paginate request */
  offset: number
  /** Limit extracted from paginate request */
  limit: number
  /** Links extracted from Pagination link header */
  links: PageLinks
  /** Latest items returned from response */
  items: TSuccess
  /** Captured from the original pagination request */
  options?: Partial<ITransportSettings>
  /** Total number of pages. -1 if not known. */
  pages: number
  /** Current page. -1 if not known. */
  page: number

  /**
   * Is the specified link rel defined in the Link header?
   * @param link to check
   */
  hasRel(link: PageLinkRel): boolean

  /** Get the requested relative link
   * if the requested link is not defined, all calculated values are reset, including
   * `total`, `items`, `offset`, and `limit`
   */
  getRel(link: PageLinkRel): Promise<SDKResponse<TSuccess, TError>>
  /** Get the first page of items. This is the same as offset=0 */
  firstPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the last page of items
   *
   * @remarks This link is only provided if `total` is known.
   */
  lastPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the next page of items
   *
   * @remarks This link is provided if `total` is known, or if the number of items returned == `limit`. In the latter case, this function may return an empty result set.
   */
  nextPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the previous page of items
   *
   * @remarks This link is provided if the last page was not the first page.
   */
  prevPage(): Promise<SDKResponse<TSuccess, TError>>

  /** `true` if the `next` link is defined and the current items count === `limit` */
  more(): boolean
}
```

### Page iteration example

Results can be retrieved a page at a time with code similar to the following that starts with a call to `paginate()`:

```ts
// Get 20 dashboards at a time
const paged = await paginate(sdk, all_dashboards({ limit: 20 }))
const dashboards = paged.items
// paged.more() is true if there's a 'next' rel link and the last page request items.length === limit
while (paged.more()) {
  await paged.nextPage()
  // if there are no more pages, paged.items will be empty after nextPage()
  dashboards.push(paged.items)
}
```

See [paginator.ts](/packages/sdk-rtl/src/paginator.ts) for the current implementation.

## Alpha support level

Support for pagination headers is currently at alpha level. This means that:

- Not all endpoints with `limit` and `offset` parameters provide pagination headers.
- Pagination performance may vary for large results sets. We recommend making the `limit` size a larger value (half or a quarter of the total count, perhaps) to reduce pagination if performance degradation is experienced.
- SDK support for pagination is only available in the Typescript SDK prototype.
- While SDK pagination routines **should** work for API endpoints that provide pagination headers, reliability is not guaranteed, and SDK pagination routines are only "community supported." This means that issues can be filed in this repository and Looker engineering will attempt to address them, but no timeframe or response is guaranteed.
