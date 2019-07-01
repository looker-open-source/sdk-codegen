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
}

export interface IParameter extends ISymbol {
  type: IType
  location: MethodParameterLocation
  required: boolean
  description: string
}

export interface IMethodResponse {
  statusCode: string
  mediaType: string
  type: IType
}

class MethodResponse implements IMethodResponse {
  mediaType: string;
  statusCode: string;
  type: IType;
  constructor (statusCode: string, mediaType: string, type: IType) {
    this.statusCode = statusCode
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

  description: string
  params: IParameter[]
  summary: string
  pathArgs: string[]
  bodyArg: string
  queryArgs: string[]
  headerArgs: string[]
  cookieArgs: string[]
}

export class Method extends SchemadSymbol implements IMethod {
  readonly httpMethod: HttpMethod
  readonly endpoint: string
  readonly primaryResponse: IMethodResponse
  responses: IMethodResponse[]
  readonly params: IParameter[]

  constructor (httpMethod: HttpMethod, endpoint: string, schema: OAS.OperationObject, params: IParameter[], responses: IMethodResponse[]) {
    if (!schema.operationId) {
      throw new Error('Missing operationId')
    }

    const primaryResponse = responses.find((response) => {
      // prefer json response over all other 200s
      return response.statusCode === '200' && response.mediaType === 'application/json'
    }) || responses.find((response) => {
      return response.statusCode === '200' // accept any mediaType for 200 if none are json
    }) || responses.find((response) => {
      return response.statusCode === '204' // No Content
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

  private getParams(location?: MethodParameterLocation): IParameter[] {
    if (location) {
      return this.params.filter((p) => p.location === location)
    }
    return this.params
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
}

class Type implements IType {
  readonly name: string
  readonly schema: OAS.SchemaObject
  readonly properties: Record<string, IProperty> = {}

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

  resolveType(schema: string | OAS.SchemaObject | OAS.ReferenceObject): IType {
    if (typeof schema === 'string') {
      return this.types[schema]
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

  private loadMethods(endpoint: string, schema: OAS.PathItemObject): Method[] {
    const methods: Method[] = []

    const addIfPresent = (httpMethod: HttpMethod, opSchema: OAS.OperationObject | undefined) => {
      if (opSchema) {
        const responses = this.methodResponses(opSchema)
        const params = this.methodParameters(opSchema)
        methods.push(new Method(httpMethod, endpoint, opSchema, params, responses))
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
          param = p as OAS.ParameterObject
          const schema = param.schema
          type = this.resolveType(schema || {})
        }
        params.push(new Parameter(param, type))
      }
    }
    return params
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
  library: string

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
  methodsPrologue : string

  // standard code to append to the bottom of the generated "methods" file(s)
  methodsEpilogue : string

  // standard code to insert at the top of the generated "models" file(s)
  modelsPrologue : string

  // standard code to append to the bottom of the generated "models" file(s)
  modelsEpilogue : string

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

  typeMap(type: IType) : IMappedType
}
