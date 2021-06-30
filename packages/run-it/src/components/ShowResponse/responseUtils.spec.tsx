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
import {
  testErrorResponse,
  testHtmlResponse,
  testSqlResponse,
  testImageResponse,
  testJsonResponse,
  testTextResponse,
  testUnknownResponse,
} from '../../test-data'
import { isColumnar, pickResponseHandler } from './responseUtils'

describe('responseUtils', () => {
  describe('isColumnar', () => {
    test('detects simple 2D data', () => {
      const inputs = [[1, 'two', false, new Date(), undefined, null]]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(true)
    })
    test('considers any non-Date object complex', () => {
      const inputs = [[{ a: 'A', b: 'B' }, 'two', false, new Date()]]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
    test('considers empty object complex', () => {
      const inputs = [[{}, 'two', false, new Date()]]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
    test('considers any array complex', () => {
      const inputs = [[[], 'two', false, new Date()]]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
    test('considers a 1D array as non-columnar', () => {
      const inputs = [[], 'two', false, new Date()]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
    test('considers an empty array as non-columnar', () => {
      const inputs = [[]]
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
    test('considers connection json as complex', () => {
      const inputs = JSON.parse(`
[
  {
    "name": "looker_external",
    "snippets": [
      {
        "name": "show_processes",
        "label": "Show Processes",
        "sql": "SHOW PROCESSLIST"
      }
    ],
    "host": "localhost",
    "port": 3306,
    "database": "looker_test",
    "db_timezone": null,
    "query_timezone": null,
    "schema": null,
    "max_connections": 75,
    "max_billing_gigabytes": null,
    "ssl": false,
    "verify_ssl": false,
    "tmp_db_name": "cdt_scratch",
    "jdbc_additional_params": null,
    "pool_timeout": null,
    "created_at": "",
    "user_id": "",
    "user_attribute_fields": [],
    "maintenance_cron": null,
    "last_regen_at": "1601597871",
    "last_reap_at": "1601597716",
    "sql_runner_precache_tables": true,
    "after_connect_statements": "",
    "pdt_concurrency": 1,
    "disable_context_comment": false,
    "dialect": {
      "supports_cost_estimate": false,
      "automatically_run_sql_runner_snippets": true,
      "connection_tests": [
        "connect",
        "kill",
        "query",
        "database_timezone",
        "database_version",
        "tmp_db",
        "mysql_tmp_tables",
        "cdt",
        "tmp_db_views"
      ],
      "supports_inducer": false,
      "supports_multiple_databases": false,
      "supports_persistent_derived_tables": true,
      "has_ssl_support": true,
      "name": "mysql",
      "label": "MySQL",
      "supports_streaming": true,
      "persistent_table_indexes": "inline",
      "persistent_table_sortkeys": "",
      "persistent_table_distkey": ""
    },
    "dialect_name": "mysql",
    "example": false,
    "managed": false,
    "pdts_enabled": true,
    "username": "root",
    "uses_oauth": false,
    "pdt_context_override": null,
    "tunnel_id": "",
    "can": {
      "index": true,
      "index_limited": true,
      "show": true,
      "cost_estimate": true,
      "access_data": true,
      "explore": true,
      "refresh_schemas": true,
      "destroy": true,
      "test": true,
      "create": true,
      "update": true
    }
  }]
`)
      const actual = isColumnar(inputs)
      expect(actual).toEqual(false)
    })
  })
  test('it handles image/png', () => {
    const actual = pickResponseHandler(testImageResponse())
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles image/jpeg', () => {
    const actual = pickResponseHandler(testImageResponse('image/jpeg'))
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles image/svg+xml', () => {
    const actual = pickResponseHandler(testImageResponse('image/svg+xml'))
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles json', () => {
    const actual = pickResponseHandler(testJsonResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('json')
  })
  test('it handles text', () => {
    const actual = pickResponseHandler(testTextResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('text')
  })
  test('it handles sql', () => {
    const actual = pickResponseHandler(testSqlResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('sql')
  })
  test('it handles html', () => {
    const actual = pickResponseHandler(testHtmlResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('html')
  })
  test('it handles unknown', () => {
    const actual = pickResponseHandler(testUnknownResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('unknown')
  })
  test('it handles error', () => {
    const actual = pickResponseHandler(testErrorResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('text')
  })
})
