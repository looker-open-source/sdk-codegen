import { LookerApi } from "./sdkModels";
// import { SdkGenerator } from "./sdkGenerator";

describe('ts template test', () => {
  // it ('outputs source with interpolations', () => {
  //   const model: Models.LookerApi = {
  //     methods: [
  //       {
  //         httpMethod: "GET",
  //         endpoint: "queries/{id}/run",
  //         operationId: "run_query",
  //         type: { name: "string" },
  //         params: [
  //           {
  //             name: "query_id",
  //             type: { name: "integer"},
  //           },
  //           {
  //             name: "limit",
  //             type: { name: "integer"},
  //           },
  //         ],
  //       },
  //       {
  //         httpMethod: "POST",
  //         endpoint: "queries/run/inline",
  //         operationId: "run_inline_query",
  //         type: { name: "string" },
  //         params: [
  //           {
  //             name: "query",
  //             type: { name: "CreateQuery" },
  //           },
  //         ],
  //       }]
  //   }
  //
  //   const result = new SdkGenerator(model).render()
  //
  //   console.log(result)
  // })

  it('resolves OAS schemas into types', () => {
    const apiData = LookerApi.load('./Looker.3.1.oas.json')
    expect(typeof apiData.types['ValidationError'].elementType).toEqual('undefined')

    const test = apiData.types.ValidationError.properties.errors.type.elementType
    expect(test && test.name).toEqual('ValidationErrorDetail')
  })
})