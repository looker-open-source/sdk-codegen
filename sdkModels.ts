import * as OAS from "openapi3-ts"
import * as fs from "fs";
import {utf8} from "./utils";

export interface IModel {}

export interface ISymbol {
  name: string
  type: IType
}

export interface IType {
  name?: string
  properties: Record<string, IProperty>
  status: string
  elementType?: IType
}

export interface IParameter extends ISymbol {
}

export interface IMethod extends ISymbol {
  operationId: string
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

class Property extends Symbol implements IProperty {
  private schema: OAS.SchemaObject
  required: boolean = false

  constructor (name: string, type: IType, schema: OAS.SchemaObject) {
    super(name, type)
    this.schema = schema
  }

  get nullable(): boolean {
    return this.schema.nullable || this.schema['x-looker-nullable'] || true
  }

  get description(): string {
    return this.schema.description || ''
  }

  get readOnly(): boolean {
    return this.schema.readOnly || false
  }

  get writeOnly(): boolean {
    return this.schema.writeOnly || false
  }

  get deprecated(): boolean {
    return this.schema.deprecated || this.schema['x-looker-deprecated'] || false
  }
}

class Type implements IType {
  readonly name?: string
  readonly schema: OAS.SchemaObject
  readonly properties: Record<string, IProperty> = {}

  constructor (schema: OAS.SchemaObject, name?: string) {
    this.schema = schema
    this.name = name
  }

  get status(): string {
    return this.schema['x-looker-status'] || ''
  }

  load(symbols: ISymbolTable): void {
    Object.entries(this.schema.properties || {}).forEach(([propName, propSchema]) => {
      this.properties[propName] = new Property(propName, symbols.resolveType(propSchema), propSchema)
    })
  }
}

class ArrayType extends Type{
  elementType: IType

  constructor(elementType: IType, schema: OAS.SchemaObject) {
    super(schema)
    this.elementType = elementType
  }
}

class IntrinsicType extends Type {
  constructor (name: string) {
    super({}, name)
  }
}

export class LookerApi implements ISymbolTable {
  methods: Record<string, IMethod> = {}
  types: Record<string, IType> = {}
  refs: Record<string, IType> = {}

  constructor () {
    this.types['string'] = new IntrinsicType('string')
    this.types['integer'] = new IntrinsicType('integer')
    this.types['int64'] = new IntrinsicType('int64')
    this.types['boolean'] = new IntrinsicType('boolean')
    this.types['object'] = new IntrinsicType('object')
    this.types['uri'] = new IntrinsicType('uri')
    this.types['float'] = new IntrinsicType('float')
    this.types['double'] = new IntrinsicType('double')
  }

  static load(specFile: string): LookerApi {
    const specContent = fs.readFileSync(specFile, utf8)
    const json = JSON.parse(specContent)
    const spec = new OAS.OpenApiBuilder(json).getSpec()
    return new LookerApi().load(spec)
  }

  load(spec: OAS.OpenAPIObject) : this {
    if (spec.components && spec.components.schemas) {
      Object.entries(spec.components.schemas).forEach(([name, schema]) => {
        const t = new Type(schema, name)
        // types[n] and corresponding refs[ref] MUST reference the same type instance!
        this.types[name] = t
        this.refs[`#/components/schemas/${name}`] = t
      })
      Object.entries(spec.components.schemas).forEach(([name, _]) => {
        (this.resolveType(name) as Type).load(this)
      })
    }
    return this
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
      if (this.types[schema.type]) {
        return this.types[schema.type]
      }
    }
    throw new Error("Schema must have a ref or a type")
  }
}

