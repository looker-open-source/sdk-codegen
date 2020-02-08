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

import * as OAS from 'openapi3-ts'
import md5 from 'blueimp-md5'
import { camelCase, readFileSync } from './utils'
import { HttpMethod, ResponseMode, responseMode, StatusCode } from '../typescript/looker/rtl/transport'
import { IVersionInfo } from './codeGen'

export const strBody = 'body'
export const strRequest = 'Request'
export const strWrite = 'Write'
export declare type Arg = string

export interface IModel {
}

export interface ISymbol {
  name: string
  type: IType

  asHashString(): string
}

export interface IType {
  name: string
  properties: Record<string, IProperty>
  writeable: IProperty[]
  status: string
  elementType?: IType

  deprecated: boolean
  description: string
  title: string
  default?: string
  readOnly: boolean
  refCount: number // if it works for Delphi, it works for TypeScript
  schema: OAS.SchemaObject

  asHashString(): string
  isRecursive(): boolean
}

export declare type MethodParameterLocation = 'path' | 'body' | 'query' | 'header' | 'cookie'

export interface IParameter extends ISymbol {
  type: IType
  location: MethodParameterLocation
  required: boolean
  description: string

  asProperty(): IProperty

  asHashString(): string
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

  constructor(statusCode: string, mediaType: string, type: IType) {
    this.statusCode = parseInt(statusCode, 10)
    this.mediaType = mediaType
    this.type = type
  }
}

export interface IProperty extends ISymbol {
  required: boolean
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

  constructor(name: string, type: IType) {
    this.name = name
    this.type = type
  }

  asHashString() {
    return `${this.name}:${this.type.name}`
  }
}

class SchemadSymbol extends Symbol {
  schema: OAS.SchemaObject

  constructor(name: string, type: IType, schema: OAS.SchemaObject) {
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

  constructor(name: string, type: IType, schema: OAS.SchemaObject, required: string[] = []) {
    super(name, type, schema)
    this.required = required.includes(name)
  }

  get nullable(): boolean {
    // TODO determine cascading nullable options
    return this.schema.nullable || this.schema['x-looker-nullable'] || false
  }

  get readOnly(): boolean {
    return this.schema.readOnly || false
  }

  get writeOnly(): boolean {
    return this.schema.writeOnly || false
  }

  asHashString() {
    return super.asHashString()
    + this.nullable ? '?' : ''
    + this.readOnly ? ' ro' : ''
    + this.required ? ' req' : ''
    + this.writeOnly ? ' wo' : ''
  }
}

export class Parameter implements IParameter {
  description: string = ''
  location: MethodParameterLocation = 'query'
  name: string
  required: boolean = false
  type: IType

  constructor(param: OAS.ParameterObject | Partial<IParameter>, type: IType) {
    this.name = param.name!
    this.type = type
    this.description = param.description || ''
    if ('in' in param) {
      this.location = param.in
    } else {
      this.location = (param as Partial<IParameter>).location || strBody
    }
    // TODO deal with the required value being the names of the columns that are required
    this.required = param.required || false
  }

  asSchemaObject() {
    return {
      nullable: !(this.required), // || this.location === strBody),
      required: this.required ? [this.name] : undefined,
      readOnly: false,
      writeOnly: false,
      deprecated: false,
      description: this.description,
      type: this.type.name
    } as OAS.SchemaObject
  }

  asProperty() {
    return new Property(this.name, this.type, this.asSchemaObject())
  }

  asHashString() {
    return `${this.name}:${this.type.name}${this.required ? '' : '?'}${this.location}`
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
  errorResponses: IMethodResponse[]
  // All parameters in the correct, sorted order for the method call
  allParams: IParameter[]
  // All optional parameters
  optionalParams: IParameter[]
  bodyParams: IParameter[]
  responseModes: Set<ResponseMode>

  getParams(location?: MethodParameterLocation): IParameter[]

  optional(location?: MethodParameterLocation): IParameter[]

  hasOptionalParams(): boolean

  responseIsBinary() : boolean

  responseIsString() : boolean

  responseIsBoth() : boolean
}

export class Method extends SchemadSymbol implements IMethod {
  readonly httpMethod: HttpMethod
  readonly endpoint: string
  readonly primaryResponse: IMethodResponse
  responses: IMethodResponse[]
  readonly params: IParameter[]
  readonly responseModes: Set<ResponseMode>

  constructor(httpMethod: HttpMethod, endpoint: string, schema: OAS.OperationObject, params: IParameter[],
              responses: IMethodResponse[], body?: IParameter) {
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
    this.responseModes = this.getResponseModes()
    this.params = params
    if (body) {
      this.params.push(body)
    }
  }

  /**
   * Determines which response modes (binary/string) this method supports
   * @returns {Set<string>} Either a set of 'string' or 'binary' or both
   */
  private getResponseModes() {
    let modes = new Set<ResponseMode>()
    for (const resp of this.responses) {

      // TODO should we use one of the mime packages like https://www.npmjs.com/package/mime-types for
      // more thorough/accurate coverage?
      const mode = responseMode(resp.mediaType)
      if (mode !== ResponseMode.unknown) modes.add(mode)
    }

    if (modes.size === 0) {
      throw new Error(`Is ${this.operationId} ${JSON.stringify(this.responses)} binary or string?`)
    }

    return modes
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

  // all required parameters ordered by location declaration order
  get requiredParams() {
    return this.required('path')
      .concat(
        this.required(strBody),
        this.required('query'),
        this.required('header'),
        this.required('cookie')
      )
  }

  // all required parameters ordered by location declaration order
  get optionalParams() {
    return this.optional('path')
      .concat(
        this.optional(strBody),
        this.optional('query'),
        this.optional('header'),
        this.optional('cookie')
      )
  }

  // all parameters ordered by required, then optional, location declaration order
  get allParams() {
    return this.requiredParams.concat(this.optionalParams)
  }

  get pathParams() {
    return this.getParams('path')
  }

  get bodyParams() {
    return this.getParams(strBody)
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

  get pathArgs() {
    return this.argumentNames('path')
  }

  get bodyArg() {
    const body = this.argumentNames(strBody)
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
    const result = []
    const map = new Map()
    for (const item of this.responses.filter(r => r.statusCode >= 400)) {
      if (!map.has(item.type.name)) {
        map.set(item.type.name, true)
        result.push(item)
      }
    }
    return result
  }

  getParams(location?: MethodParameterLocation): IParameter[] {
    if (location) {
      return this.params.filter((p) => p.location === location)
    }
    return this.params
  }

  responseIsBinary(): boolean {
    return this.responseModes.has(ResponseMode.binary)
  }

  responseIsString(): boolean {
    return this.responseModes.has(ResponseMode.string)
  }

  responseIsBoth(): boolean {
    return this.responseIsBinary() && this.responseIsString()
  }

  // order parameters in location priority
  private locationSorter(p1: IParameter, p2: IParameter) {
    const remain = 0
    const before = -1
    // const after = 1
    // note: "strBody" is an injected location for simplifying method declarations
    // parameters should be sorted in the following location order:
    const locations = ['path', strBody, 'query', 'header', 'cookie']
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

  sort(list?: IParameter[]) {
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

  hasOptionalParams() {
    return this.optional().length > 0
  }

  private argumentNames(location?: MethodParameterLocation): string[] {
    return this
      .getParams(location)
      .map(p => p.name)
  }

}

class Type implements IType {
  readonly name: string
  readonly schema: OAS.SchemaObject
  readonly properties: Record<string, IProperty> = {}
  refCount = 0

  constructor(schema: OAS.SchemaObject, name: string) {
    this.schema = schema
    this.name = name
  }

  get writeable(): IProperty[] {
    let result: IProperty[] = []
    Object.entries(this.properties)
      .filter(([_, prop]) => !(prop.readOnly || prop.type.readOnly))
      .forEach(([_, prop]) => result.push(prop))
    return result
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

  get readOnly(): boolean {
    return Object.entries(this.properties).every(([_, prop]) => prop.readOnly && prop.readOnly === true)
  }

  load(symbols: ISymbolTable): void {
    Object.entries(this.schema.properties || {}).forEach(([propName, propSchema]) => {
      this.properties[propName] = new Property(propName, symbols.resolveType(propSchema), propSchema, this.schema.required)
    })
  }

  asHashString() {
    let result = `${this.name}:`
    Object.entries(this.properties)
    // put properties in alphabetical order first
      .sort(([a, _], [b, __]) => a.localeCompare(b))
      .forEach(([_, prop]) => {
        result += prop.asHashString() + ':'
      })
    return result
  }

  /**
   * Is this type directly recursive?
   * @returns {boolean} Does this type contain references to itself as a top-level property?
   */
  isRecursive(): boolean {
    const selfType = this.name
    // test for directly recursive type references
    return Object.entries(this.properties)
      .some(([_, prop]) => prop.type.name === selfType)
  }
}

export class ArrayType extends Type {

  constructor(public elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `${elementType.name}[]`)
  }

  get readOnly() {
    return this.elementType.readOnly
  }
}

export class DelimArrayType extends Type {
  constructor(public elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `DelimArray<${elementType.name}>`)
    this.elementType = elementType
  }

  get readOnly() {
    return this.elementType.readOnly
  }
}

export class HashType extends Type {
  elementType: IType

  constructor(elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `Hash[${elementType.name}`)
    this.elementType = elementType
  }

  get readOnly() {
    return this.elementType.readOnly
  }
}

export class IntrinsicType extends Type {
  constructor(name: string) {
    super({}, name)
  }

  get readOnly(): boolean {
    return false
  }
}

export class RequestType extends Type {
  constructor(api: IApiModel, name: string, params: IParameter[], description: string = '') {
    super({description}, name)
    // params.forEach(p => this.properties[p.name] = p.asProperty())
    params.forEach(p => {
      let writeProp = p.asProperty()
      const typeWriter = api.getWriteableType(p.type)
      if (typeWriter) writeProp.type = typeWriter
      this.properties[p.name] = writeProp
    })
  }
}

export class WriteType extends Type {
  constructor(api: IApiModel, type: IType) {
    const name = `${strWrite}${type.name}`
    const description = `Dynamically generated writeable type for ${type.name}`
    super({description}, name)
    type.writeable
      .filter(p => (!p.readOnly) && (!p.type.readOnly))
      .forEach(p => {
        let writeProp = new Property(p.name, p.type,
          {
            description: p.description,
            // nullable/optional if property is nullable or property is complex type
            nullable: p.nullable || !(p.type instanceof IntrinsicType)
          }, type.schema.required)
        const typeWriter = api.getWriteableType(p.type)
        if (typeWriter) writeProp.type = typeWriter
        this.properties[p.name] = writeProp
      })
  }
}

export interface IApiModel extends IModel {
  version: string
  description: string
  methods: Record<string, IMethod>
  types: Record<string, IType>

  sortedTypes(): IType[]

  sortedMethods(): IMethod[]

  getRequestType(method: IMethod): IType | undefined

  getWriteableType(type: IType): IType | undefined
}

export class ApiModel implements ISymbolTable, IApiModel {
  readonly schema: OAS.OpenAPIObject | undefined
  readonly methods: Record<string, IMethod> = {}
  readonly types: Record<string, IType> = {}
  readonly requestTypes: Record<string, IType> = {}
  private refs: Record<string, IType> = {}

  constructor(spec: OAS.OpenAPIObject, private readonly swagger: any) {
    ['string', 'integer', 'int64', 'boolean', 'object',
      'uri', 'float', 'double', 'void', 'datetime', 'email',
      'uuid', 'uri', 'hostname', 'ipv4', 'ipv6',
    ].forEach((name) => this.types[name] = new IntrinsicType(name))

    this.schema = spec
    this.load()
  }

  get version(): string {
    return this.schema?.version || ''
  }

  get description(): string {
    return this.schema?.decription?.trim() || ''
  }

  static fromFile(specFile: string, swaggerFile: string): ApiModel {
    const specContent = readFileSync(specFile)
    const swaggerContent = readFileSync(swaggerFile)
    return this.fromString(specContent, swaggerContent)
  }

  static fromString(specContent: string, swaggerContent: string): ApiModel {
    const json = JSON.parse(specContent)
    const swagger = JSON.parse(swaggerContent)
    return this.fromJson(json, swagger)
  }

  static fromJson(json: any, swagger: any): ApiModel {
    const spec = new OAS.OpenApiBuilder(json).getSpec()
    return new ApiModel(spec, swagger)
  }

  // TODO replace this with get from underscore?
  jsonPath(path: string | string[], item: any = this.schema, splitter: string = '/') {
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

  // Retrieve an api object via its JSON path

  resolveType(schema: string | OAS.SchemaObject | OAS.ReferenceObject, style?: string): IType {
    if (typeof schema === 'string') {
      if (schema.indexOf('/requestBodies/') < 0) return this.types[schema.substr(schema.lastIndexOf('/') + 1)]
      // dereference the request strBody schema reference
      const deref = this.jsonPath(schema)
      if (deref) {
        const ref = this.jsonPath(['content', 'application/json', 'schema', '$ref'], deref)
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
        if (style === 'csv') {
          return new DelimArrayType(this.resolveType(schema.items), schema)
        }
        return new ArrayType(this.resolveType(schema.items), schema)
      }
      if (schema.type === 'object' && schema.additionalProperties) {
        if (schema.additionalProperties !== true) {
          return new HashType(this.resolveType(schema.additionalProperties), schema)
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
    throw new Error('Schema must have a ref or a type')
  }

  // add to this.requestTypes collection with hash as key
  makeRequestType(hash: string, method: IMethod) {
    const name = `${strRequest}${camelCase('_' + method.name)}`
    const request = new RequestType(this, name, method.allParams,
      `Dynamically generated request type for ${method.name}`)
    this.types[name] = request
    this.requestTypes[hash] = request
    return request
  }

  // create request type from method parameters
  // add to this.types collection with name as key

  // only gets the request type if more than one method parameter is optional
  getRequestType(method: IMethod) {
    if (method.optionalParams.length <= 1) return undefined
    // matches method params hash against current request types
    let paramHash = ''
    method.allParams.forEach(p => paramHash += p.asHashString())
    const hash = md5(paramHash)
    // if no match, creates the request type and increments its refCount for inclusion
    // in generated imports
    let result = this.requestTypes[hash]
    if (!result) result = this.makeRequestType(hash, method)
    if (result) result.refCount++
    return result
  }

  makeWriteableType(hash: string, type: IType) {
    const writer = new WriteType(this, type)
    this.types[writer.name] = writer
    this.requestTypes[hash] = writer
    return writer
  }

  // a writeable type will need to be found or created
  getWriteableType(type: IType) {
    const props = Object.entries(type.properties).map(([_, prop]) => prop)
    const writes = type.writeable
    // do we have any readOnly properties?
    if (writes.length === 0 || writes.length === props.length) return undefined
    const hash = md5(type.asHashString())
    let result = this.requestTypes[hash]
    if (!result) result = this.makeWriteableType(hash, type)
    return result
  }

  // if any properties of the parameter type are readOnly (including in subtypes)

  sortedTypes() {
    return Object.values(this.types)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  sortedMethods() {
    return Object.values(this.methods)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  private load(): void {
    if (this.schema?.components?.schemas) {
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

    if (this.schema?.paths) {
      Object.entries(this.schema.paths).forEach(([path, schema]) => {
        const methods = this.loadMethods(path, schema)
        methods.forEach((method) => {
          this.methods[method.name] = method
        })
      })
    }
  }

  private loadMethods(endpoint: string, schema: OAS.PathItemObject): Method[] {
    const methods: Method[] = []

    const addIfPresent = (httpMethod: HttpMethod, opSchema: OAS.OperationObject | undefined) => {
      if (opSchema) {
        const responses = this.methodResponses(opSchema)
        const params = this.methodParameters(opSchema, endpoint, httpMethod)
        const body = this.requestBody(opSchema.requestBody, endpoint, httpMethod)
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

  private methodParameters(schema: OAS.OperationObject, endpoint: string, httpMethod: HttpMethod): IParameter[] {
    const params: IParameter[] = []
    if (schema.parameters) {
      const swaggerParams = this.swagger.paths[endpoint][httpMethod.toLowerCase()]['parameters']
      for (let p of schema.parameters) {
        let type: IType
        let param: OAS.ParameterObject
        if (OAS.isReferenceObject(p)) {
          // TODO make this work correctly for reference objects at the parameter level
          // TODO is style resolution like below required here?
          type = this.resolveType(p)
          param = {
            name: type.name,
            in: 'query',
          }
        } else {
          param = p
          const sp = swaggerParams.find((s: any) => s.name === param.name)
          const style = sp ? sp.collectionFormat : undefined
          const schema = p.schema
          type = this.resolveType(schema || {}, style)
        }
        const mp = new Parameter(param, type)
        params.push(mp)
      }
    }
    return params
  }

  /*
  some sample request strBody patterns
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
  private requestBody(obj: OAS.RequestBodyObject | OAS.ReferenceObject | undefined, endpoint: string, httpMethod: HttpMethod) {
    if (!obj) return undefined
    const swaggerParams = this.swagger.paths[endpoint][httpMethod.toLowerCase()]['parameters']
    const bp = swaggerParams.find((i:any) => i.name === 'body')
    if (!bp) bp.required = false

    // TODO create a schema factory function and use that where SchemaObject is directly created?
    const typeSchema: OAS.SchemaObject = {
      nullable: false,
      required: bp.required ? [strBody] : [],
      readOnly: false,
      writeOnly: false,
      deprecated: false,
      description: ''
    }
    // TODO create a BodyType descendant of Type?
    let type: IType = new Type(typeSchema, strBody)
    let result = new Parameter({
      name: strBody,
      location: strBody,
      required: bp.required,
      description: '', // TODO capture description
    } as Partial<IParameter>, type)

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

export interface ICodeGen {

  // root path for generated source code files
  // e.g. 'python' for Python
  codePath: string

  /**
   * beginning name pattern for all environment variables
   * e.g. LOOKERSDK
   */
  environmentPrefix: string

  /**
   * folder for the Looker SDK reference
   * e.g. 'looker_sdk' for Python. All python source would end up under `python/looker_sdk`
   */
  packagePath: string

  // folder for the Looker SDK reference
  // e.g. 'looker_sdk' for Python. All python source would end up under `python/looker_sdk`
  packageName: string

  // name of api request instance variable
  // e.g. _rtl for Python, transport for TypeScript
  transport: string

  // reference to self. e.g self, this, it, etc.
  itself: string

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

  /**
   * Does this language require request types to be generated because it doesn't
   * conveniently support named default parameters?
   */
  needsRequestTypes: boolean

  /**
   * Does this language support specific streaming methods?
   */
  willItStream: boolean

  /**
   * Stamps the version file (typically rtl/constants.xx) with server and api version
   * @returns {IVersionInfo | undefined}
   */
  versionStamp(): IVersionInfo | undefined

  /**
   * Returns true if the SDK supports multiple API versions of models
   * @returns {boolean} True if multi-API is supported
   */
  supportsMultiApi() : boolean

  /**
   * Returns the name of the RequestType if this language AND method require it.
   * Otherwise return empty string.
   * @param {IMethod} method
   * @returns {string}
   */
  requestTypeName(method: IMethod): string

  //
  /**
   * Returns the WriteType if the passed type has any readOnly properties or types
   * @param {IType} type
   * @returns {IType | undefined}
   */
  writeableType(type: IType): IType | undefined

  //
  /**
   * standard code to insert at the top of the generated "methods" file(s)
   * @param {string} indent
   * @returns {string}
   */
  methodsPrologue(indent: string): string

  //
  /**
   * standard code to append to the bottom of the generated "methods" file(s)
   * @param {string} indent
   * @returns {string}
   */
  methodsEpilogue(indent: string): string

  /**
   * standard code to insert at the top of the generated "streams" file(s)
   * @param {string} indent
   * @returns {string}
   */
  streamsPrologue(indent: string): string

  /**
   * standard code to insert at the top of the generated "models" file(s)
   * @param {string} indent indentation string
   * @returns {string}
   */
  modelsPrologue(indent: string): string

  /**
   * standard code to append to the bottom of the generated "models" file(s)
   * @param {string} indent indentation string
   * @returns {string}
   */
  modelsEpilogue(indent: string): string

  /**
   * Prepare the path where API-specific SDK files should go
   * @returns {string}
   */
  sdkPathPrep() : void

  /**
   * Get the name of an SDK file complete with API version
   * @param {string} baseFileName e.g. "methods" or "models"
   * @returns {string} fully specified, API-version-specific file name
   */
  sdkFileName(baseFileName: string) : string

  /**
   * provide the name for a file with the appropriate language code extension
   * @param {string} base eg "methods" or "models"
   * @returns {string} full sdk file name complete with extension
   */
  fileName(base: string): string

  // generate an optional comment header if the comment is not empty
  commentHeader(indent: string, text: string | undefined): string

  // group argument names together
  // e.g.
  //   [ row_size, page_offset ]
  argGroup(indent: string, args: Arg[], prefix?: string): string

  // list arguments by name
  // e.g.
  //   row_size, page_offset
  argList(indent: string, args: Arg[], prefix?: string): string

  // generate a comment block
  // e.g.
  //   # this is a
  //   # multi-line comment block
  comment(indent: string, description: string): string

  // generates the method signature including parameter list and return type.
  methodSignature(indent: string, method: IMethod): string

  // convert endpoint pattern to platform-specific string template
  httpPath(path: string, prefix?: string): string

  // generate a call to the http API abstraction
  // includes http method, path, body, query, headers, cookie arguments
  httpCall(indent: string, method: IMethod): string

  // generate a call to the stream API abstraction
  // includes http method, path, body, query, headers, cookie arguments
  streamCall(indent: string, method: IMethod): string

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

  // generates the method signature including parameter list and return type.
  methodSignature(indent: string, method: IMethod): string

  // generates the entire method
  declareMethod(indent: string, method: IMethod): string

  // generates the streaming method signature including parameter list and return type.
  streamerSignature(indent: string, method: IMethod): string

  // generates the entire streaming method
  declareStreamer(indent: string, method: IMethod): string

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
  construct(indent: string, type: IType): string

  // generates entire type declaration
  declareType(indent: string, type: IType): string

  // generates a textual description for the property's comment header
  describeProperty(property: IProperty): string

  // generates type property
  declareProperty(indent: string, property: IProperty): string

  // if countError is false, no import reference to Error or IError should be included
  typeNames(countError: boolean): string[]

  typeMap(type: IType): IMappedType

  reformatFile(fileName: string): string

  reformat(): string[]
}
