import { MethodParameters } from './methodParam'
import { loadSpec, jsonPath } from './specSupport'
import { OperationObject } from 'openapi3-ts'

describe('basic', () => {

  beforeAll( ()=> {
    loadSpec('./Looker.3.1.oas.json')
  })

  it('create query', () => {
    const path = jsonPath(['paths', '/queries', 'post']) as OperationObject
    expect(path).not.toBeUndefined()
    const p = new MethodParameters(path)
    expect(p.allParams.length).toBe(2)
    expect(p.requiredParams.length).toBe(0)
    expect(p.optionalParams.length).toBe(2)
    expect(p.pathParams.length).toBe(0)
    expect(p.bodyParams.length).toBe(1)
    expect(p.queryParams.length).toBe(1)
    expect(p.headerParams.length).toBe(0)
    expect(p.cookieParams.length).toBe(0)
    expect(p.bodyArgs).toBe('body')
    expect(p.queryArgs).toBe('fields')
  })

  it('create query task', () => {
    const path = jsonPath(['paths', '/query_tasks', 'post']) as OperationObject
    expect(path).not.toBeUndefined()
    const p = new MethodParameters(path)
    const count = 14
    expect(p.allParams.length).toBe(count)
    expect(p.requiredParams.length).toBe(1)
    expect(p.optionalParams.length).toBe(count-1)
    expect(p.pathParams.length).toBe(0)
    expect(p.bodyParams.length).toBe(1)
    expect(p.queryParams.length).toBe(count-1)
    expect(p.headerParams.length).toBe(0)
    expect(p.cookieParams.length).toBe(0)
    expect(p.bodyArgs).toBe('body')
    expect(p.queryArgs).toBe('force_production, limit, apply_vis, cache, image_width, image_height, generate_drill_links, apply_formatting, cache_only, path_prefix, rebuild_pdts, server_table_calcs, fields')
    const body = p.bodyParams[0]
    expect(body.schema.type).toBe('WriteCreateQueryTask')
  })

  it('get request', () => {
    const path = jsonPath(['paths', '/queries/{query_id}', 'get']) as OperationObject
    expect(path).not.toBeUndefined()
    const p = new MethodParameters(path)
    expect(p.allParams.length).toBe(2)
    expect(p.requiredParams.length).toBe(1)
    const id = p.requiredParams[0]
    expect(id.name).toBe('query_id')
    expect(id.schema.type).toBe('long')
    expect(p.optionalParams.length).toBe(1)
    expect(p.pathParams.length).toBe(1)
    expect(p.pathArgs).toBe('query_id')
    expect(p.queryParams.length).toBe(1)
    expect(p.queryArgs).toBe('fields')
  })

})