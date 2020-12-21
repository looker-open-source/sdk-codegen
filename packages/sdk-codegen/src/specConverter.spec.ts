/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import { readFileSync } from 'fs'
import { isEmpty } from 'lodash'
import { NodeSettingsIniFile } from '@looker/sdk-rtl'
import { LookerNodeSDK, environmentPrefix } from '@looker/sdk'
import {
  fixConversion,
  openApiStyle,
  swapXLookerTags,
  convertParam,
  upgradeSpec,
  convertDefs,
  getLookerSpecs,
  getSpecLinks,
  loadSpecs,
} from './specConverter'
import { TestConfig } from './testUtils'
import { compareSpecs } from './specDiff'
import { ApiModel } from './sdkModels'

const swaggerFrag = `
{
  "paths": {
    "/query_tasks/multi_results": {
      "get": {
        "tags": ["Query"],
        "operationId": "query_task_multi_results",
        "summary": "Get Multiple Async Query Results",
        "description": "### Fetch results of multiple async queries\\n\\nReturns the results of multiple async queries in one request.\\n\\nFor Query Tasks that are not completed, the response will include the execution status of the Query Task but will not include query results.\\nQuery Tasks whose results have expired will have a status of 'expired'.\\nIf the user making the API request does not have sufficient privileges to view a Query Task result, the result will have a status of 'missing'\\n",
        "parameters": [
          {
            "name": "query_task_ids",
            "in": "query",
            "description": "List of Query Task IDs",
            "required": true,
            "type": "array",
            "items": {
              "type": "string"
            },
            "collectionFormat": "csv"
          }
        ],
        "responses": {
          "200": {
            "description": "Multiple query results",
            "schema": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "schema": {
              "$ref": "#/definitions/Error"
            }
          },
          "404": {
            "description": "Not Found",
            "schema": {
              "$ref": "#/definitions/Error"
            }
          }
        },
        "x-looker-status": "beta",
        "x-looker-activity-type": "db_query"
      }
    },
    "/dashboards/{lookml_dashboard_id}/import/{space_id}": {
      "post": {
        "tags": ["Dashboard"],
        "operationId": "import_lookml_dashboard",
        "summary": "Import LookML Dashboard",
        "description": "### Import a LookML dashboard to a space as a UDD\\nCreates a UDD (a dashboard which exists in the Looker database rather than as a LookML file) from the LookML dashboard\\nand puts it in the space specified. The created UDD will have a lookml_link_id which links to the original LookML dashboard.\\n\\nTo give the imported dashboard specify a (e.g. title: \\"my title\\") in the body of your request, otherwise the imported\\ndashboard will have the same title as the original LookML dashboard.\\n\\nFor this operation to succeed the user must have permission to see the LookML dashboard in question, and have permission to\\ncreate content in the space the dashboard is being imported to.\\n\\n**Sync** a linked UDD with [sync_lookml_dashboard()](#!/Dashboard/sync_lookml_dashboard)\\n**Unlink** a linked UDD by setting lookml_link_id to null with [update_dashboard()](#!/Dashboard/update_dashboard)\\n",
        "parameters": [
          {
            "name": "lookml_dashboard_id",
            "in": "path",
            "description": "Id of LookML dashboard",
            "required": true,
            "type": "string"
          },
          {
            "name": "space_id",
            "in": "path",
            "description": "Id of space to import the dashboard to",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "description": "Dashboard",
            "required": false,
            "schema": {
              "$ref": "#/definitions/Dashboard"
            }
          },
          {
            "name": "raw_locale",
            "in": "query",
            "description": "If true, and this dashboard is localized, export it with the raw keys, not localized.",
            "required": false,
            "type": "boolean"
          }
        ],
        "responses": {
          "200": {
            "description": "Dashboard",
            "schema": {
              "$ref": "#/definitions/Dashboard"
            }
          },
          "201": {
            "description": "dashboard",
            "schema": {
              "$ref": "#/definitions/Dashboard"
            }
          },
          "400": {
            "description": "Bad Request",
            "schema": {
              "$ref": "#/definitions/Error"
            }
          },
          "404": {
            "description": "Not Found",
            "schema": {
              "$ref": "#/definitions/Error"
            }
          },
          "422": {
            "description": "Validation Error",
            "schema": {
              "$ref": "#/definitions/ValidationError"
            }
          }
        },
        "x-looker-status": "beta",
        "x-looker-activity-type": "non_query"
      }
    }
  }
}
`
const openApiFrag = `
{
  "paths": {
    "/query_tasks/multi_results": {
      "get": {
        "tags": ["Query"],
        "operationId": "query_task_multi_results",
        "summary": "Get Multiple Async Query Results",
        "description": "### Fetch results of multiple async queries\\n\\nReturns the results of multiple async queries in one request.\\n\\nFor Query Tasks that are not completed, the response will include the execution status of the Query Task but will not include query results.\\nQuery Tasks whose results have expired will have a status of 'expired'.\\nIf the user making the API request does not have sufficient privileges to view a Query Task result, the result will have a status of 'missing'\\n",
        "parameters": [
          {
            "name": "query_task_ids",
            "in": "query",
            "description": "List of Query Task IDs",
            "required": true,
            "style": "simple",
            "explode": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Multiple query results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        },
        "x-looker-status": "beta",
        "x-looker-activity-type": "db_query"
      }
    },

    "/dashboards/{lookml_dashboard_id}/import/{space_id}": {
      "post": {
        "tags": ["Dashboard"],
        "operationId": "import_lookml_dashboard",
        "summary": "Import LookML Dashboard",
        "description": "### Import a LookML dashboard to a space as a UDD\\nCreates a UDD (a dashboard which exists in the Looker database rather than as a LookML file) from the LookML dashboard\\nand puts it in the space specified. The created UDD will have a lookml_link_id which links to the original LookML dashboard.\\n\\nTo give the imported dashboard specify a (e.g. title: \\"my title\\") in the body of your request, otherwise the imported\\ndashboard will have the same title as the original LookML dashboard.\\n\\nFor this operation to succeed the user must have permission to see the LookML dashboard in question, and have permission to\\ncreate content in the space the dashboard is being imported to.\\n\\n**Sync** a linked UDD with [sync_lookml_dashboard()](#!/Dashboard/sync_lookml_dashboard)\\n**Unlink** a linked UDD by setting lookml_link_id to null with [update_dashboard()](#!/Dashboard/update_dashboard)\\n",
        "parameters": [
          {
            "name": "lookml_dashboard_id",
            "in": "path",
            "description": "Id of LookML dashboard",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "space_id",
            "in": "path",
            "description": "Id of space to import the dashboard to",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "raw_locale",
            "in": "query",
            "description": "If true, and this dashboard is localized, export it with the raw keys, not localized.",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Dashboard"
              }
            }
          },
          "description": "Dashboard"
        },
        "responses": {
          "200": {
            "description": "Dashboard",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Dashboard"
                }
              }
            }
          },
          "201": {
            "description": "dashboard",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Dashboard"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidationError"
                }
              }
            }
          }
        },
        "x-looker-status": "beta",
        "x-looker-activity-type": "non_query"
      }
    }
  }
}
`
const specFrag = `
"can": {
  "type": "object",
  "additionalProperties": {
    "type": "boolean"
  },
  "readOnly": true,
  "description": "Operations the current user is able to perform on this object",
  "x-looker-nullable": false
},
"content_favorite_id": {
  "type": "integer",
  "format": "int64",
  "readOnly": true,
  "description": "Content Favorite Id",
  "x-looker-nullable": true
},
"content_metadata_id": {
  "type": "integer",
  "format": "int64",
  "readOnly": true,
  "description": "Id of content metadata",
  "x-looker-nullable": true
},
"description": {
  "type": "string",
  "readOnly": true,
  "description": "Description",
  "x-looker-nullable": true
},
"hidden": {
  "type": "boolean",
  "readOnly": true,
  "description": "Is Hidden",
  "x-looker-nullable": false
},
"supported_formats": {
  "type": "array",
  "items": { "type": "string" },
  "readOnly": true,
  "x-looker-values": [
    "txt",
    "csv",
    "inline_json",
    "json",
    "json_label",
    "json_detail",
    "json_detail_lite_stream",
    "xlsx",
    "html",
    "wysiwyg_pdf",
    "assembled_pdf",
    "wysiwyg_png",
    "csv_zip"
  ],
  "description": "A list of data formats the integration supports. If unspecified, the default is all data formats. Valid values are: \\"txt\\", \\"csv\\", \\"inline_json\\", \\"json\\", \\"json_label\\", \\"json_detail\\", \\"json_detail_lite_stream\\", \\"xlsx\\", \\"html\\", \\"wysiwyg_pdf\\", \\"assembled_pdf\\", \\"wysiwyg_png\\", \\"csv_zip\\".",
  "nullable": false
},
`

const swagger = JSON.parse(swaggerFrag)
const api = JSON.parse(openApiFrag)

const config = TestConfig()
const swaggerFile = `${config.rootPath}spec/Looker.4.0.json`
const apiFile = `${config.rootPath}spec/Looker.4.0.oas.json`
const swaggerSource = readFileSync(swaggerFile, 'utf-8')
const fullSwagger = JSON.parse(swaggerSource)
const apiSource = readFileSync(apiFile, 'utf-8')
const settings = new NodeSettingsIniFile(
  environmentPrefix,
  config.localIni,
  'Looker'
)
const sdk = LookerNodeSDK.init40(settings)

describe('spec conversion', () => {
  it('swaps out x-looker-tags', () => {
    const actual = swapXLookerTags(specFrag)
    expect(actual).toContain('"nullable": true')
    expect(actual).not.toContain('"x-looker-nullable": true')
    expect(actual).toContain('"enum": [')
    expect(actual).not.toContain('"x-looker-values": [')
  })

  it('collectionFormat to style', () => {
    expect(openApiStyle('csv')).toEqual('simple')
    expect(openApiStyle('ssv')).toEqual('spaceDelimited')
    expect(openApiStyle('pipes')).toEqual('pipeDelimited')
    expect(openApiStyle('tabs')).toBeUndefined()
  })

  it('fixes missing conversion items', () => {
    const actual = fixConversion(openApiFrag, swaggerFrag)
    expect(actual.spec).toContain(`"style":"simple"`)
    expect(actual.fixes).not.toHaveLength(0)
  })

  describe('spec retrieval', () => {
    it('gets looker specs', async () => {
      const actual = await getLookerSpecs(sdk, config.baseUrl)
      expect(actual).toBeDefined()
      expect(actual.looker_release_version).not.toEqual('')
      expect(actual.current_version.version).not.toEqual('')
      expect(actual.supported_versions).toHaveLength(4)
    })

    it('gets spec links', async () => {
      const versions = await getLookerSpecs(sdk, config.baseUrl)
      expect(versions).toBeDefined()
      const actual = getSpecLinks(versions)
      expect(actual).toBeDefined()
      expect(actual).toHaveLength(3)
      actual.forEach((spec) => {
        expect(spec.name).not.toEqual('')
        expect(spec.version).not.toEqual('')
        expect(spec.status).not.toEqual('')
        expect(spec.url).not.toEqual('')
        expect(isEmpty(spec.api)).toEqual(true)
      })
      const current = actual.find((s) => s.status === 'current')
      expect(current).toBeDefined()
      actual.forEach((spec) => expect(isEmpty(spec.api)).toEqual(true))
    })

    it('fetches and parses all specs', async () => {
      const versions = await getLookerSpecs(sdk, config.baseUrl)
      expect(versions).toBeDefined()
      const links = getSpecLinks(versions)
      const actual = await loadSpecs(sdk, links)
      expect(actual).toBeDefined()
      expect(actual).toHaveLength(3)
      actual.forEach((spec) => {
        expect(isEmpty(spec.api)).toEqual(false)
        expect(spec.api.version).not.toEqual('')
        expect(spec.api.description).not.toEqual('')
      })
    })
  })

  describe('spec upgrade', () => {
    it('converts a swagger array param', () => {
      const op = swagger.paths['/query_tasks/multi_results'].get
      const param = op.parameters[0]
      const actual = convertParam(param)
      expect(actual).toBeDefined()
      const expected = api.paths['/query_tasks/multi_results'].get.parameters[0]
      expect(actual).toEqual(expected)
    })

    it('converts all definitions', () => {
      const defs = fullSwagger.definitions
      const actual = convertDefs(defs)
      expect(actual).toBeDefined()
      const keys = Object.keys(actual)
      expect(keys).toHaveLength(Object.keys(defs).length)
    })

    it('matches a reference OpenAPI conversion', () => {
      const spec = upgradeSpec(swaggerSource)
      expect(spec).toBeDefined()
      // writeFileSync(`${config.rootPath}/spec/spec.upgrade.json`, spec, 'utf-8')
      const left = ApiModel.fromString(apiSource)
      const right = ApiModel.fromString(spec)
      const diff = compareSpecs(left, right)
      expect(diff).toHaveLength(0)
    })

    it('passes through an existing OpenAPI spec', () => {
      const spec = upgradeSpec(apiSource)
      expect(spec).toBeDefined()
      const left = ApiModel.fromString(apiSource)
      const right = ApiModel.fromString(spec)
      const diff = compareSpecs(left, right)
      expect(diff).toHaveLength(0)
    })
  })
})
