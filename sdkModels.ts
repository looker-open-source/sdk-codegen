// import { ParameterObject, PathsObject, OperationObject } from "openapi3-ts"

export interface IModel {
  name?: string
}

export interface IType extends IModel {
  default?: string
}

export interface IParameter extends IModel {
  type: IType
  required?: boolean
  description?: string
}

export interface IMethod extends IModel {
  operationId: string // maps internally to name
  httpMethod: string
  endpoint: string
  type: IType

  description?: string
  params?: IParameter[]
  summary?: string
  pathArgs?: string[]
  bodyArg?: string
  queryArgs?: string[]
  headerArgs?: string[]
  cookieArgs?: string[]
}

export interface IStruct extends IModel {
  description?: string
  properties: IParameter[]
}

export interface IApi extends IModel {
  version?: string
  description?: string
  methods: Array<IMethod>
  structures?: Array<IStruct>
}

export interface IFormatter {
  // produces the declaration block for a parameter
  // e.g.
  //   # ID of the query to run
  //   query_id: str
  //
  // and
  //
  //   # size description of parameter
  //   row_limit: int = None
  declareParameter: (indent: string, param: IParameter) => string
  // produces the list of parameters for a method signature
  // e.g.
  //   # ID of the query to run
  //   query_id: str,
  //   # size description of parameter
  //   row_limit: int = None
  declareParameters: (indent: string, params: IParameter[]) => string
  // group argument names together
  // e.g.
  //   [ row_size, page_offset ]
  argGroup : (indent: string, args: string[] ) => string
  // list arguments by name
  // e.g.
  //   row_size, page_offset
  argList: (indent: string, args: string[]) => string
  // generate a comment block
  // e.g.
  //   # this is a
  //   # multi-line comment block
  commentBlock: (indent: string, description: string) => string
  // generates the method signature including parameter list and return type.
  // supports
  methodSignature: (indent: string, method: IMethod) => string
  // generate a call to the http API abstraction
  // includes http method, path, body, query, headers, cookie arguments
  httpCall: (indent: string, method: IMethod) => string
  // string representation of null value
  // e.g. Python None, C# null, Delphi nil
  nullStr: string
}
