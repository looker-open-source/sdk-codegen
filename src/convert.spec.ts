/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


import { addSpecStyles, openApiStyle, swapXLookerNullable } from './convert'
// import { TestConfig } from './testUtils'
// import { readFileSync } from './nodeUtils'

// const config = TestConfig()
// const swaggerFile = `${config.testPath}/data/swaggerRef.json`
// const openApiFile = `${config.testPath}/data/openApiRef.json`
// const swaggerSpec = readFileSync(swaggerFile)
// const openApiSpec = readFileSync(openApiFile)

const swaggerFrag = `
{ "paths": {
  "/query_tasks/multi_results": {
    "get": {
      "tags": [
        "Query"
      ],
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
  }}
}
`

const openApiFrag = `
{"paths": {
  "/query_tasks/multi_results": {
    "get": {
      "tags": [
        "Query"
      ],
      "operationId": "query_task_multi_results",
      "summary": "Get Multiple Async Query Results",
      "description": "### Fetch results of multiple async queries\\n\\nReturns the results of multiple async queries in one request.\\n\\nFor Query Tasks that are not completed, the response will include the execution status of the Query Task but will not include query results.\\nQuery Tasks whose results have expired will have a status of 'expired'.\\nIf the user making the API request does not have sufficient privileges to view a Query Task result, the result will have a status of 'missing'\\n",
      "parameters": [
        {
          "name": "query_task_ids",
          "in": "query",
          "description": "List of Query Task IDs",
          "required": true,
          "style": "form",
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
  }}
}
`
describe('spec conversion', () => {
  it('swaps out x-looker-nullable', () => {
    const input = `
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
`
    const actual = swapXLookerNullable(input)
    const puzzle = input.replace(/x-looker-nullable/gi, 'nullable')
    expect(actual).toEqual(puzzle)

    expect(actual).toContain('"nullable": true')
    expect(actual).not.toContain('"x-looker-nullable": true')
  })

  it('collectionFormat to style', () => {
    expect(openApiStyle('csv')).toEqual('simple')
    expect(openApiStyle('ssv')).toEqual('spaceDelimited')
    expect(openApiStyle('pipes')).toEqual('pipeDelimited')
    expect(openApiStyle('tabs')).toBeUndefined()
  })

  it('adds styles to openAPI spec', () => {
    const actual = addSpecStyles(openApiFrag, swaggerFrag)
    expect(actual).toContain(`"style": "simple"`)
  })
})
