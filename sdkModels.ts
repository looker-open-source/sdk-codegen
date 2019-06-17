// import { ParameterObject, PathsObject, OperationObject } from "openapi3-ts"

export interface IModel {}

export interface IType extends IModel {
  name: string
}

export interface IParameter extends IModel {
  name: string
  type: IType
}

export interface IMethod extends IModel {
  operationId: string
  httpMethod: string
  endpoint: string
  type: IType           // function result type

  description?: string
  params?: IParameter[]
  summary?: string
  pathArgs?: string[]
  bodyArg?: string
  queryArgs?: string[]
  headerArgs?: string[]
  cookieArgs?: string[]
}

export interface ILookerApi extends IModel {
  methods: Array<IMethod>;
}

