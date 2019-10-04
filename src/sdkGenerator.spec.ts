import * as Models from './sdkModels'
import { MethodGenerator } from './sdkGenerator'
import { PythonGen } from './python.gen'

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json', './Looker.3.1.json')

describe('sdk generator test', () => {
  it('outputs a method in Python', () => {
    const gen = new MethodGenerator(apiModel, new PythonGen(apiModel))
    const result = gen.codeFormatter.declareMethod('  ', apiModel.methods['create_look'])
    expect(result).toEqual(
      `  # POST /looks -> models.LookWithQuery
  def create_look(
      self,
      body: Optional[models.WriteLookWithQuery] = None,
      # Requested fields.
      fields: Optional[str] = None
  ) -> models.LookWithQuery:
      """Create Look"""
      response = self.post(f"/looks", models.LookWithQuery, query_params={"fields": fields}, body=body)
      assert isinstance(response, models.LookWithQuery)
      return response`)
  })

  it('resolves OAS schemas into types', () => {
    expect(typeof apiModel.types['ValidationError'].elementType).toEqual('undefined')

    const test = apiModel.types.ValidationError.properties.errors.type.elementType
    expect(test && test.name).toEqual('ValidationErrorDetail')
  })

  it('loads a method with a ref type response', () => {
    const method = apiModel.methods['user']
    expect(method.primaryResponse.statusCode).toEqual(200)
    expect(method.primaryResponse.type.name).toEqual('User')
    expect(method.type.name).toEqual('User')
    expect(method.endpoint).toEqual('/users/{user_id}')
    const response = method.responses.find((a) => a.statusCode === 400)
    expect(response).toBeDefined()
    if (response) {
      expect(response.type.name).toEqual('Error')
    }
  })

  it('loads 204 methods with void response type', () => {
    const method = apiModel.methods['delete_group_user']
    expect(method.primaryResponse.statusCode).toEqual(204)
    expect(method.primaryResponse.type.name).toEqual('void')
  })
})
