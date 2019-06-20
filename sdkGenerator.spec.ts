import * as Models from "./sdkModels";
import { SdkGenerator } from "./sdkGenerator";
import {PythonFormatter} from "./python.fmt";

describe('ts template test', () => {
  it ('outputs source with interpolations', () => {
    const model: Models.IApi = {
      methods: [
        {
          httpMethod: "get",
          endpoint: "queries/{id}/run",
            description:"run a query",
          operationId: "run_query",
          type: { name: "string" },
          params: [
            {
              name: "query_id",
                description: "id of query to run",
              type: { name: "integer"},
                location: 'path',
            },
            {
              name: "limit",
              type: { name: "integer"},
                location: 'query'
            },
          ],
        },
        {
          httpMethod: "post",
          endpoint: "queries/run/inline",
            description: "run inline query",
          operationId: "run_inline_query",
          type: { name: "string" },
          params: [
            {
              name: "query",
                description:"query to create",
              type: { name: "CreateQuery" },
                location: 'body'
            },
          ],
        }]
    }

    const result = new SdkGenerator(model, new PythonFormatter()).render('  ')

    console.log(result)
  })
})
