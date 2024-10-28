/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { IRawResponse } from '@looker/sdk-rtl';

export const testJsonResponse: IRawResponse = {
  method: 'GET',
  url: 'https://some/json/data',
  headers: { 'content-type': 'application/json' },
  contentType: 'application/json',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('[{"key1": "value1" }]'),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testOneRowComplexJson: IRawResponse = {
  method: 'GET',
  url: 'https://some/json/data',
  headers: { 'content-type': 'application/json' },
  contentType: 'application/json',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from(`{
  "id": 520,
  "view": "orders",
  "fields": [
    "orders.id",
    "users.age",
    "users.city"
  ],
  "pivots": [],
  "fill_fields": [],
  "filters": null,
  "filter_expression": "",
  "sorts": [],
  "limit": "",
  "column_limit": "",
  "total": null,
  "row_total": "",
  "subtotals": [],
  "vis_config": null,
  "filter_config": null,
  "visible_ui_sections": "",
  "slug": "64zJjJw",
  "client_id": "zfn3SwIaaHbJTbsXSJ0JO7",
  "share_url": "https://localhost:9999/x/zfn3SwIaaHbJTbsXSJ0JO7",
  "expanded_share_url": "https://localhost:9999/explore/thelook/orders?fields=orders.id,users.age,users.city&origin=share-expanded",
  "url": "/explore/thelook/orders?fields=orders.id,users.age,users.city",
  "has_table_calculations": false,
  "model": "thelook",
  "dynamic_fields": "",
  "query_timezone": "",
  "quick_calcs": null,
  "analysis_config": null,
  "can": {
    "run": true,
    "see_results": true,
    "explore": true,
    "create": true,
    "show": true,
    "cost_estimate": true,
    "index": true,
    "see_lookml": true,
    "see_aggregate_table_lookml": true,
    "see_derived_table_lookml": true,
    "see_sql": true,
    "save": true,
    "generate_drill_links": true,
    "download": true,
    "download_unlimited": true,
    "use_custom_fields": true,
    "schedule": true
  }
}`),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testTextResponse: IRawResponse = {
  method: 'GET',
  url: 'https://some/text/data',
  headers: { 'content-type': 'text/plain;charset=utf-8' },
  contentType: 'text/plain;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some text data'),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testHtmlResponse: IRawResponse = {
  method: 'GET',
  url: `https://some/html`,
  headers: { 'content-type': 'text/html;charset=utf-8' },
  contentType: 'text/html;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from(
    '<table>\n' +
      '<tr><th>Orders Created Date</th><th>Orders Count</th></tr>\n' +
      '<tr><td>2019-12-22</td><td>39</td></tr>\n' +
      '</table>'
  ),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testSqlResponse: IRawResponse = {
  method: 'GET',
  url: `https://some/sql`,
  headers: { 'content-type': 'application/sql' },
  contentType: 'application/sql',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from(`SELECT
    COUNT(DISTINCT products.id ) AS \`products.count\`
FROM demo_db.inventory_items  AS inventory_items
LEFT JOIN demo_db.products  AS products ON inventory_items.product_id = products.id
LIMIT 500`),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testImageResponse = (contentType = 'image/png'): IRawResponse => ({
  method: 'GET',
  url: `http://${contentType}`,
  headers: { 'content-type': contentType },
  contentType,
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some image data'),
  requestStarted: 1000,
  responseCompleted: 2000,
});

export const testUnknownResponse: IRawResponse = {
  method: 'GET',
  url: 'http://bogus',
  headers: {},
  contentType: 'bogus',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some data'),
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testErrorResponse: IRawResponse = {
  method: 'GET',
  url: 'http://error',
  headers: {},
  body: Buffer.from(
    '{"message": "Not found", "documentation_url": "http://docs.looker.com"}'
  ),
  contentType: 'text',
  ok: false,
  statusCode: 404,
  statusMessage: 'some status message',
  requestStarted: 1000,
  responseCompleted: 2000,
};

export const testBogusJsonResponse: IRawResponse = {
  method: 'GET',
  url: 'https://some/json/data',
  headers: {},
  contentType: 'application/json',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('<html><body>I AM A LYING JSON RESPONSE</body></html>'),
  requestStarted: 1000,
  responseCompleted: 2000,
};
