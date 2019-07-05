/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as OAS from "openapi3-ts"
import * as fs from "fs"
import {utf8} from "./utils"
import {MethodParameterLocation} from "./methodParam"

export declare type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'
export declare type Arg = string
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status for reference
export enum StatusCode {
  OK = 200,
  Created,
  Accepted,
  NonAuthoritative,
  NoContent,
  ResetContent,
  PartialContent,
  MultiStatus,
  MultiStatusDav,
  IMUsed = 226,
  MultipleChoice = 300,
  MovedPermanently,
  Found,
  SeeOther,
  NotModified,
  UseProxy,
  UnusedRedirect,
  TemporaryRedirect,
  PermanentRedirect,
  BadRequest = 400,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  ProxyAuthRequired,
  RequestTimeout,
  Conflict,
  Gone,
  LengthRequired,
  PreconditionFailed,
  PayloadTooLarge,
  UriTooLong,
  UnsupportedMediaType,
  RequestedRangeNotSatisifable,
  ExpecatationFailed,
  ImATeapot,
  MisdirectedRequest = 421,
  UnprocessableEntity,
  Locked,
  FailedDependency,
  TooEarly,
  UpgradeRequired,
  PreconditionRequired,
  TooManyRequests,
  RequestHeaderFieldsTooLarge,
  UnavailableForLegalReasons,
  InternalServerError = 500,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
  HttpVersionNotSupported,
  VariantAlsoNegotiates,
  InsufficientStorage,
  LoopDetected,
  NotExtended = 510,
  NetworkAuthRequired
}

export interface IModel {
}

export interface ISymbol {
  name: string
  type: IType
}

export interface IType {
  name: string
  properties: Record<string, IProperty>
  status: string
  elementType?: IType

  deprecated: boolean
  description: string
  title: string
  default?: string
  refCount: number // if it works for Delphi, it works for TypeScript
}

export interface IParameter extends ISymbol {
  type: IType
  location: MethodParameterLocation
  required: boolean
  description: string
}

export interface IMethodResponse {
  statusCode: number
  mediaType: string
  type: IType
}

class MethodResponse implements IMethodResponse {
  mediaType: string
  statusCode: number
  type: IType
  constructor (statusCode: string, mediaType: string, type: IType) {
    this.statusCode = parseInt(statusCode, 10)
    this.mediaType = mediaType
    this.type = type
  }
}

export interface IProperty extends ISymbol {
  nullable: boolean
  description: string
  readOnly: boolean
  writeOnly: boolean
  deprecated: boolean
}

export interface ISymbolTable {
  methods: Record<string, IMethod>
  types: Record<string, IType>

  resolveType(schema: OAS.SchemaObject): IType
}

class Symbol implements ISymbol {
  name: string
  type: IType
  constructor (name: string, type: IType) {
    this.name = name
    this.type = type
  }
}

class SchemadSymbol extends Symbol {
  schema: OAS.SchemaObject

  constructor (name: string, type: IType, schema: OAS.SchemaObject) {
    super(name, type)
    this.schema = schema
  }

  get description(): string {
    return this.schema.description || ''
  }

  get deprecated(): boolean {
    return this.schema.deprecated || this.schema['x-looker-deprecated'] || false
  }
}

class Property extends SchemadSymbol implements IProperty {
  required: boolean = false

  get nullable(): boolean {
    return this.schema.nullable || this.schema['x-looker-nullable'] || true
  }

  get readOnly(): boolean {
    return this.schema.readOnly || false
  }

  get writeOnly(): boolean {
    return this.schema.writeOnly || false
  }
}

export class Parameter implements IParameter {
  description: string = ''
  location: MethodParameterLocation = 'query'
  name: string
  required: boolean = false
  type: IType

  constructor (param: OAS.ParameterObject, type: IType) {
    this.name = param.name
    this.type = type
    this.description = param.description || ''
    this.location = param.in
    // TODO deal with the required value being the names of the columns that are required
    this.required = param.required || false
  }
}

export interface IMethod extends ISymbol {
  operationId: string // alias of ISymbol.name
  httpMethod: HttpMethod
  endpoint: string
  resultType: IType   // alias of ISymbol.type
  primaryResponse: IMethodResponse
  responses: IMethodResponse[]
  getParams(location?: MethodParameterLocation): IParameter[]

  description: string
  params: IParameter[]
  summary: string
  pathArgs: string[]
  bodyArg: string
  queryArgs: string[]
  headerArgs: string[]
  cookieArgs: string[]
  errorResponses : IMethodResponse[]
  // All parameters in the correct, sorted order for the method call
  allParams : IParameter[]
}


export class Method extends SchemadSymbol implements IMethod {
  readonly httpMethod: HttpMethod
  readonly endpoint: string
  readonly primaryResponse: IMethodResponse
  responses: IMethodResponse[]
  readonly params: IParameter[]

  constructor (httpMethod: HttpMethod, endpoint: string, schema: OAS.OperationObject, params: IParameter[],
    responses: IMethodResponse[], body? : IParameter) {
    if (!schema.operationId) {
      throw new Error('Missing operationId')
    }

    const primaryResponse = responses.find((response) => {
      // prefer json response over all other 200s
      return response.statusCode === StatusCode.OK && response.mediaType === 'application/json'
    }) || responses.find((response) => {
      return response.statusCode === StatusCode.OK // accept any mediaType for 200 if none are json
    }) || responses.find((response) => {
      return response.statusCode === StatusCode.NoContent
    })

    if (!primaryResponse) {
      throw new Error(`Missing 2xx + application/json response in ${endpoint}`)
    }

    super(schema.operationId, primaryResponse.type, schema)
    this.httpMethod = httpMethod
    this.endpoint = endpoint
    this.responses = responses
    this.primaryResponse = primaryResponse
    this.params = params
    if (body) {
      this.params.push(body)
    }
  }

  get resultType(): IType {
    return this.type
  }

  get operationId(): string {
    return this.name
  }

  get summary(): string {
    return this.schema.summary || ''
  }

  getParams(location?: MethodParameterLocation): IParameter[] {
    if (location) {
      return this.params.filter((p) => p.location === location)
    }
    return this.params
  }

  // order parameters in location priority
  locationSorter(p1: IParameter, p2: IParameter) {
    const remain = 0
    const before = -1
    // const after = 1
    // note: "body" is an injected location for simplifying method declarations
    // parameters should be sorted in the following location order:
    const locations = ['path', 'body', 'query', 'header', 'cookie']
    if (p1.location === p2.location) return remain // no need to re-order

    for (let location of locations) {
      if (p1.location === location) {
        return remain // first parameter should stay first
      }
      if (p2.location === location) {
        return before // second parameter should move up
      }
    }
    return remain
  }

  sort(list? : IParameter[]) {
    if (!list) list = this.params
    return list
      .sort((p1, p2) => this.locationSorter(p1, p2))
  }

  // return the list of required, writeable parameters, optionally for a specific location
  required(location?: MethodParameterLocation) {
    let list = this.params
      .filter((i) => i.required)
    if (location) {
      list = list.filter((i) => i.location === location)
    }
    return list
  }

  // return the list of optional, writeable parameters, optionally for a specific location
  optional(location?: MethodParameterLocation) {
    let list = this.params
      .filter((i) => !i.required)
    if (location) {
      list = list.filter((i) => i.location === location)
    }
    return list
  }

  // all required parameters ordered by location declaration order
  get requiredParams() {
    return this.required('path')
      .concat(
        this.required('body'),
        this.required('query'),
        this.required('header'),
        this.required('cookie')
      )
  }

  // all required parameters ordered by location declaration order
  get optionalParams() {
    return this.optional('path')
      .concat(
        this.optional('body'),
        this.optional('query'),
        this.optional('header'),
        this.optional('cookie')
      )
  }

  // all parameters ordered by required, then optional, location declaration order
  get allParams() {
    return this.requiredParams.concat(this.optionalParams)
  }

  get pathParams(){
    return this.getParams('path')
  }

  get bodyParams() {
    return this.getParams('body')
  }

  get queryParams() {
    return this.getParams('query')
  }

  get headerParams() {
    return this.getParams('header')
  }

  get cookieParams() {
    return this.getParams('cookie')
  }

  private argumentNames(location?: MethodParameterLocation): string[] {
    return this
    .getParams(location)
    .map(p => p.name)
  }

  get pathArgs(){
    return this.argumentNames('path')
  }

  get bodyArg() {
    const body = this.argumentNames('body')
    if (body.length === 0) return ''
    return body[0]
  }

  get queryArgs() {
    return this.argumentNames('query')
  }

  get headerArgs() {
    return this.argumentNames('header')
  }

  get cookieArgs() {
    return this.argumentNames('cookie')
  }

  get errorResponses() {
    // TODO use lodash or underscore
    const result = [];
    const map = new Map();
    for (const item of this.responses.filter(r => r.statusCode >= 400)) {
        if (!map.has(item.type.name)) {
            map.set(item.type.name, true)
            result.push(item)
        }
    }
    return result
  }

}

class Type implements IType {
  readonly name: string
  readonly schema: OAS.SchemaObject
  readonly properties: Record<string, IProperty> = {}
  refCount = 0

  constructor (schema: OAS.SchemaObject, name: string) {
    this.schema = schema
    this.name = name
  }

  load(symbols: ISymbolTable): void {
    Object.entries(this.schema.properties || {}).forEach(([propName, propSchema]) => {
      this.properties[propName] = new Property(propName, symbols.resolveType(propSchema), propSchema)
    })
  }

  get status(): string {
    return this.schema['x-looker-status'] || ''
  }

  get deprecated(): boolean {
    return this.schema.deprecated || this.schema['x-looker-deprecated'] || false
  }

  get description(): string {
    return this.schema.description || ''
  }

  get title(): string {
    return this.schema.title || ''
  }

  get default(): string | undefined {
    return this.schema.default || ''
  }
}

class ArrayType extends Type{
  elementType: IType

  constructor(elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `${elementType.name}[]`)
    this.elementType = elementType
  }
}

class ListType extends Type {
  elementType: IType

  constructor(elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `List[${elementType.name}`)
    this.elementType = elementType
  }
}

export class IntrinsicType extends Type {
  constructor (name: string) {
    super({}, name)
  }
}

export interface IApiModel extends IModel {
  version: string
  description: string
  methods: Record<string, IMethod>
  types: Record<string, IType>
  sortedTypes(): IType[]
  sortedMethods(): IMethod[]
}

export class ApiModel implements ISymbolTable, IApiModel {
  readonly schema: OAS.OpenAPIObject | undefined
  readonly methods: Record<string, IMethod> = {}
  readonly types: Record<string, IType> = {}
  private refs: Record<string, IType> = {}

  constructor(spec: OAS.OpenAPIObject) {
    [ 'string', 'integer', 'int64', 'boolean', 'object',
      'uri', 'float', 'double', 'void', 'datetime', 'email',
      'uuid', 'uri', 'hostname', 'ipv4', 'ipv6',
    ].forEach((name) => this.types[name] = new IntrinsicType(name))

    this.schema = spec
    this.load()
  }

  static fromFile(specFile: string): ApiModel {
    const specContent = fs.readFileSync(specFile, utf8)
    return this.fromString(specContent)
  }

  static fromString(specContent: string): ApiModel {
    const json = JSON.parse(specContent)
    return this.fromJson(json)
  }

  static fromJson(json: any): ApiModel {
    const spec = new OAS.OpenApiBuilder(json).getSpec()
    return new ApiModel(spec)
  }

  get version(): string {
    return (this.schema && this.schema.version) || ''
  }

  get description(): string {
    return (this.schema && this.schema.description) || ''
  }

  private load(): void {
    if (this.schema && this.schema.components && this.schema.components.schemas) {
      Object.entries(this.schema.components.schemas).forEach(([name, schema]) => {
        const t = new Type(schema, name)
        // types[n] and corresponding refs[ref] MUST reference the same type instance!
        this.types[name] = t
        this.refs[`#/components/schemas/${name}`] = t
      })
      Object.keys(this.schema.components.schemas).forEach((name) => {
        (this.resolveType(name) as Type).load(this)
      })
    }

    if (this.schema && this.schema.paths) {
      Object.entries(this.schema.paths).forEach(([path, schema]) => {
        const methods = this.loadMethods(path, schema)
        methods.forEach((method) => {
          this.methods[method.name] = method
        })
      })
    }
  }

  // Retrieve an api object via its JSON path
  // TODO replace this with get from underscore?
  jsonPath(path: string | string[], item: any = this.schema, splitter: string = "/") {
    let keys = path
    if (!(path instanceof Array)) {
      keys = path.split(splitter)
    }
    for (let key of keys) {
      if (key === '#') continue
      item = item[key]
      if (item == null) return null
    }
    return item
  }

  resolveType(schema: string | OAS.SchemaObject | OAS.ReferenceObject): IType {
    if (typeof schema === 'string') {
      if (schema.indexOf("/requestBodies/") < 0) return this.types[schema.substr(schema.lastIndexOf('/')+1)]
      // dereference the request body schema reference
      const deref = this.jsonPath(schema)
      if (deref) {
        const ref = this.jsonPath(["content", "application/json", "schema", "$ref"], deref)
        if (ref) return this.resolveType(ref)
      }
    } else if (OAS.isReferenceObject(schema)) {
      return this.refs[schema.$ref]
    } else if (schema.type) {
      if (schema.type === 'integer' && schema.format === 'int64') {
        return this.types['int64']
      }
      if (schema.type === 'number' && schema.format) {
        return this.types[schema.format]
      }
      if (schema.type === 'array' && schema.items) {
        return new ArrayType(this.resolveType(schema.items), schema)
      }
      if (schema.type === 'object' && schema.additionalProperties) {
        if (schema.additionalProperties !== true) {
          return new ListType(this.resolveType(schema.additionalProperties), schema)
        }
      }
      if (schema.format === 'date-time') {
        return this.types['datetime']
      }
      if (schema.format && this.types[schema.format]) {
        return this.types[schema.format]
      }
      if (this.types[schema.type]) {
        return this.types[schema.type]
      }
    }
    throw new Error("Schema must have a ref or a type")
  }

  sortedTypes() {
    return Object.values(this.types)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  sortedMethods() {
    return Object.values(this.methods)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  private loadMethods(endpoint: string, schema: OAS.PathItemObject): Method[] {
    const methods: Method[] = []

    const addIfPresent = (httpMethod: HttpMethod, opSchema: OAS.OperationObject | undefined) => {
      if (opSchema) {
        const responses = this.methodResponses(opSchema)
        const params = this.methodParameters(opSchema)
        const body = this.requestBody(opSchema.requestBody)
        methods.push(new Method(httpMethod, endpoint, opSchema, params, responses, body))
      }
    }

    addIfPresent('GET', schema.get)
    addIfPresent('PUT', schema.put)
    addIfPresent('POST', schema.post)
    addIfPresent('PATCH', schema.patch)
    addIfPresent('DELETE', schema.delete)
    // options?: OperationObject;
    // head?: OperationObject;
    // trace?: OperationObject;
    return methods
  }

  private methodResponses(schema: OAS.OperationObject): IMethodResponse[] {
    const responses: IMethodResponse[] = []
    Object.entries(schema.responses).forEach(([statusCode, contentSchema]) => {
      if (contentSchema.content) {
        Object.entries(contentSchema.content).forEach(([mediaType, response]) => {
          responses.push(new MethodResponse(statusCode, mediaType,
          this.resolveType((response as OAS.MediaTypeObject).schema || {})))
        })
      } else if (statusCode === '204') {
        // no content - returns void
        responses.push(new MethodResponse(statusCode, '', this.types['void']))
      }
    })
    return responses
  }

  private methodParameters(schema: OAS.OperationObject): IParameter[] {
    const params: IParameter[] = []
    if (schema.parameters) {
      for (let p of schema.parameters) {
        let type: IType
        let param: OAS.ParameterObject
        if (OAS.isReferenceObject(p)) {
          // TODO make this work correctly for reference objects at the parameter level
          type = this.resolveType(p)
          param = {
            name: type.name,
            in: "query",
          }
        } else {
          param = p
          const schema = p.schema
          type = this.resolveType(schema || {})
        }
        params.push(new Parameter(param, type))
      }
    }
    return params
  }

  /*
  "requestBody": {
    "$ref": "#/components/requestBodies/Dashboard2"
  },

  "Dashboard2": {
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/Dashboard"
        }
      }
    },
    "description": "Dashboard"
  },

  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/UserAttributeGroupValue"
          }
        }
      }
    },
    "description": "Array of group values.",
    "required": true
  },

  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "type": "array",
          "items": {
            "type": "integer",
            "format": "int64"
          }
        }
      }
    },
    "description": "array of roles ids for user",
    "required": true
  },

  "requestBody": {
    "$ref": "#/components/requestBodies/Dashboard"
  },

  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "description": "Data Action Request",
    "required": true
  },

  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/DataActionRequest"
        }
      }
    },
    "description": "Data Action Request",
    "required": true
  },
  "requestBody": {
    "content": {
      "text/plain": {
        "schema": {
          "type": "string"
        }
      }
    },
    "description": "SAML IdP metadata xml",
    "required": true
  },

  */
  private requestBody(obj: OAS.RequestBodyObject | OAS.ReferenceObject | undefined) {
    if (!obj) return undefined
    // TODO replace with new Type()
    let type: IType = {
      default: '',
      status: '',
      description: '',
      deprecated: false,
      name: '',
      title: 'body parameter',
      properties:{},
      refCount: 0
    }
    let result : IParameter = {
      name: 'body',
      location: 'body',
      required: true,
      description: '', // TODO capture description
      type: type,
    } as IParameter

    if (OAS.isReferenceObject(obj)) {
      type = this.resolveType(obj.$ref)
    } else if (obj.content) {
      const content = obj.content
      // TODO need to understand headers or links
      Object.keys(content).forEach(key => {
        const media = content[key]
        const schema = media.schema!
        if (OAS.isReferenceObject(schema)) {
          type = this.resolveType(schema.$ref)
        } else {
          type = this.resolveType(schema)
        }
      })
    } else {
      // TODO must be dynamic, create type
    }
    result.type = type

    return result
  }

}

export interface IMappedType {
  name: string
  default: string
}

export interface ICodeFormatter {

  // root path for generated source code files
  // e.g. 'python' for Python
  codePath: string

  // namespace/folder for the Looker SDK reference
  // e.g. 'looker' for Python. All python source would end up under `python/looker`
  package: string

  // name of api request instance variable
  // e.g. _rtl for Python, transport for TypeScript
  transport: string

  // reference to self. e.g self, this, it, etc.
  itself : string

  // file extension for generated files
  fileExtension: string
  // comment string
  // e.g. Python=# C#=// TypeScript=//
  commentStr: string
  // string representation of null value
  // e.g. Python None, C# null, Delphi nil
  nullStr: string
  // indentation string. Typically two spaces '  '
  indentStr: string
  // end type string. For C# and TypeScript, usually '}\n'
  endTypeStr: string

  // argument separator string. Typically ', '
  argDelimiter: string
  // parameter delimiter. Typically ",\n"
  paramDelimiter: string
  // property delimiter. Typically, ",\n"
  propDelimiter: string

  // standard code to insert at the top of the generated "methods" file(s)
  methodsPrologue(indent: string): string

  // standard code to append to the bottom of the generated "methods" file(s)
  methodsEpilogue(indent: string): string

  // standard code to insert at the top of the generated "models" file(s)
  modelsPrologue(indent: string): string

  // standard code to append to the bottom of the generated "models" file(s)
  modelsEpilogue(indent: string): string

  // provide the name for a file with the appropriate language code extension
  fileName(base: string) : string

  // generate an optional comment header if the comment is not empty
  commentHeader(indent: string, text: string | undefined): string

  // group argument names together
  // e.g.
  //   [ row_size, page_offset ]
  argGroup(indent: string, args: Arg[] ): string

  // list arguments by name
  // e.g.
  //   row_size, page_offset
  argList(indent: string, args: Arg[]): string

  // generate a comment block
  // e.g.
  //   # this is a
  //   # multi-line comment block
  comment(indent: string, description: string): string

  // generates the method signature including parameter list and return type.
  // supports
  methodSignature(indent: string, method: IMethod): string

  // generate a call to the http API abstraction
  // includes http method, path, body, query, headers, cookie arguments
  httpCall(indent: string, method: IMethod): string

  // generates the type declaration signature for the start of the type definition
  typeSignature(indent: string, type: IType): string

  // generates summary text
  // e.g, for Python:
  //    '''This is the method summary'''
  summary(indent: string, text: string): string

  // produces the declaration block for a parameter
  // e.g.
  //   # ID of the query to run
  //   query_id: str
  //
  // and
  //
  //   # size description of parameter
  //   row_limit: int = None
  declareParameter(indent: string, param: IParameter): string

  // generates the entire method
  declareMethod(indent: string, method: IMethod): string

  // generates the list of parameters for a method signature
  // e.g.
  //   # ID of the query to run
  //   query_id: str,
  //   # size description of parameter
  //   row_limit: int = None
  declareParameters(indent: string, params: IParameter[] | undefined): string

  // generates the syntax for a constructor argument
  declareConstructorArg(indent: string, property: IProperty): string

  // produces the code for the type constructor
  construct(indent: string, properties: Record<string, IProperty>): string

  // generates entire type declaration
  declareType(indent: string, type: IType): string

  // generates type property
  declareProperty(indent: string, property: IProperty): string

  typeNames() : string[]

  typeMap(type: IType) : IMappedType
}
