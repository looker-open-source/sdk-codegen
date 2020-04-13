import { apiTestModel } from './sdkModels.spec'

describe('sdk generator test', () => {
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
