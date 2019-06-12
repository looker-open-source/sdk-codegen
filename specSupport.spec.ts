import { loadSpec, jsonPath, processEndpoint, template } from "./specSupport"
import { PathsObject } from "openapi3-ts"
import { log } from "./utils"

describe('spec support', () => {

  beforeAll( ()=> {
    loadSpec('./Looker.3.1.oas.json')
  })

  it('processEndpoint', () => {
    const po = jsonPath(['paths', '/queries']) as PathsObject
    const ep = processEndpoint('/queries', po)
    expect(ep).not.toBeUndefined()
    expect(ep.methods.length).toBe(1)
    const params = ep.methods[0].params
    expect(params.allParams.length).toBe(2)
    const data = { methods: ep.methods }
    const output = template(data)
    expect(output).not.toBeFalsy()
    log(output)
  })

})