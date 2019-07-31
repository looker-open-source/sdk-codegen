import {loadSpec, jsonPath, processEndpoint, getResponses, getRequestBodySchema} from "./specSupport"
import { PathsObject, OperationObject } from "openapi3-ts"
import { log, debug } from "./utils"

describe('spec support', () => {

  beforeAll( ()=> {
    loadSpec('./Looker.3.1.oas.json')
  })

  // TODO object type (hash/dict) determination
  describe('array type determination', () => {

    it('/query_tasks/multi_results', () => {
      const endpoint = '/query_tasks/multi_results'
      const oo = jsonPath(['paths', endpoint, 'get']) as OperationObject
      const responses = getResponses(oo)
      expect(responses.length).toBe(1)
      debug('responses', responses)
    })

    it('/query_tasks/{query_task_id}/results', () => {
      const endpoint = '/query_tasks/{query_task_id}/results'
      const oo = jsonPath(['paths', endpoint, 'get']) as OperationObject
      const responses = getResponses(oo)
      expect(responses.length).toBe(4)
      debug('responses', responses)
    })

  })

  describe('request types', () => {
    it('/query_tasks', () => {
      const endpoint = '/query_tasks'
      const oo = jsonPath(['paths', endpoint, 'post']) as OperationObject
      expect(oo.requestBody).not.toBeFalsy()
      const schemas = getRequestBodySchema(oo.requestBody!)
      debug('schemas', schemas)
      expect(schemas.length).toBe(1)
    })
  })

  it('/queries', () => {
    const endpoint = '/queries'
    const po = jsonPath(['paths', endpoint]) as PathsObject
    const ep = processEndpoint(endpoint, po)
    expect(ep).not.toBeUndefined()
    expect(ep.methods.length).toBe(1)
    const params = ep.methods[0].params
    expect(params.allParams.length).toBe(2)
    expect(params.bodyArgs).toBe('body')
    expect(params.queryArgs).toBe('fields')
    const data = { methods: ep.methods }
    const output = template(data)
    expect(output).not.toBeFalsy()
    log(output)
  })

  it('/users', () => {
    const endpoint = '/users'
    const po = jsonPath(['paths', endpoint]) as PathsObject
    const ep = processEndpoint(endpoint, po)
    expect(ep).not.toBeUndefined()
    expect(ep.methods.length).toBe(2)
    const data = { methods: ep.methods }
    const output = template(data)
    expect(output).not.toBeFalsy()
    log(output)
  })

  it('/query_tasks/multi_results', () => {
    const endpoint = '/query_tasks/multi_results'
    const po = jsonPath(['paths', endpoint]) as PathsObject
    const ep = processEndpoint(endpoint, po)
    expect(ep).not.toBeUndefined()
    expect(ep.methods.length).toBe(1)
    const data = { methods: ep.methods }
    const output = template(data)
    expect(output).not.toBeFalsy()
    log(output)
  })

})
