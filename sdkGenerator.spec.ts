import * as Models from "./sdkModels";
import { SdkGenerator } from "./sdkGenerator";

describe('ts template test', () => {
  it ('outputs source with interpolations', () => {
    const model: Models.IApi = {
      methods: [
        {
          httpMethod: "get",
          endpoint: "queries/{id}/run",
          operationId: "run_query",
          type: { name: "string" },
          params: [
            {
              name: "query_id",
              type: { name: "integer"},
            },
            {
              name: "limit",
              type: { name: "integer"},
            },
          ],
        },
        {
          httpMethod: "post",
          endpoint: "queries/run/inline",
          operationId: "run_inline_query",
          type: { name: "string" },
          params: [
            {
              name: "query",
              type: { name: "CreateQuery" },
            },
          ],
        }]
    }

    const result = new SdkGenerator(model).render()

    console.log(result)
  })
})
