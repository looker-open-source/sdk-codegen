import { MethodGenerator } from './sdkGenerator'
import { PythonGen } from './python.gen'
import { apiTestModel } from './sdkModels.spec'

describe('sdk generator test', () => {
  it('outputs a method in Python', () => {
    const gen = new MethodGenerator(apiTestModel, new PythonGen(apiTestModel))
    const result = gen.codeFormatter.declareMethod('', apiTestModel.methods['create_look'])
    expect(result).toEqual(
      `# POST /looks -> models.LookWithQuery
def create_look(
    self,
    body: models.WriteLookWithQuery,
    # Requested fields.
    fields: Optional[str] = None,
    transport_options: Optional[transport.TransportSettings] = None,
) -> models.LookWithQuery:
    """Create Look"""
    response = self.post(
                        f"/looks",
            models.LookWithQuery,
            query_params={"fields": fields},
            body=body,
            transport_options=transport_options
    )
    assert isinstance(response, models.LookWithQuery)
    return response`)
  })

  it('resolves OAS schemas into types', () => {
    expect(typeof apiTestModel.types['ValidationError'].elementType).toEqual('undefined')

    const test = apiTestModel.types.ValidationError.properties.errors.type.elementType
    expect(test && test.name).toEqual('ValidationErrorDetail')
  })

  it('loads a method with a ref type response', () => {
    const method = apiTestModel.methods['user']
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
    const method = apiTestModel.methods['delete_group_user']
    expect(method.primaryResponse.statusCode).toEqual(204)
    expect(method.primaryResponse.type.name).toEqual('void')
  })
})
