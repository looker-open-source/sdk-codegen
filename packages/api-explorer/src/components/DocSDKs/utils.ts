import { IApiModel, IMethod, Method } from '@looker/sdk-codegen'
import * as OAS from 'openapi3-ts'

class NoCommentMethod extends Method {
  get description(): string {
    return ''
  }
}

export const noComment = (spec: IApiModel, method: IMethod): Method => {
  const clone = new NoCommentMethod(
    spec,
    method.httpMethod,
    method.endpoint,
    method.schema as OAS.OperationObject,
    method.params,
    method.responses
  )

  return clone
}
