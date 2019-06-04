import { ParameterStyle, SchemaObject, ExampleObject, ContentObject, PathItemObject } from "openapi3-ts"

export declare type MethodParameterLocation = 'path' | 'body' | 'query' | 'header' | 'cookie'

/*
export interface SchemaObject extends ISpecificationExtension {
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XmlObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    examples?: any[];
    deprecated?: boolean;
    type?: string;
    allOf?: (SchemaObject | ReferenceObject)[];
    oneOf?: (SchemaObject | ReferenceObject)[];
    anyOf?: (SchemaObject | ReferenceObject)[];
    not?: SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    properties?: {
        [propertyName: string]: (SchemaObject | ReferenceObject);
    };
    additionalProperties?: (SchemaObject | ReferenceObject | boolean);
    description?: string;
    format?: string;
    default?: any;
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
}
*/

export const asParams = (list : any[] | undefined) : MethodParameter[] => {
  let results : MethodParameter[] = []
  if (!list) return results
  let propNames = ['name', 'description', 'required', 'in', 'readOnly', 'required', 'schema']
  for (let item of list) {
    let value : MethodParameter = {
      name: '',
      in: 'query',
      schema: {}
    }
    let defined = false
    for (let propName of propNames) {
      const val = item.hasOwnProperty(propName) ? item[propName] : null
      if (val) {
        // @ts-ignore
        value[propName] = val
        defined = true
      }
    }
    if (defined) {
      results.push(value)
    }
  }

  return results
}

// coerce a SchemaObject to a ParameterObject
export const schemaToParam = (name: string, schema: SchemaObject) : MethodParameter => {
  let result = new MethodParameter()
  if (schema) {
    result = {
      schema: {
        type: schema.type,
        format: schema.format
      },
      // @ts-ignore
      in: 'body',
      name: name,
      readOnly : schema.readOnly,
      description: schema.description,
      default: schema.default,
      // "x-looker-nullable": schema["x-looker-nullable"]
    }
    console.log({name, schema, result})
  }
  return result
}

// order parameters in location priority
const locationSorter = (p1: MethodParameter, p2: MethodParameter) => {
  const remain = 0
  const before = -1
  // const after = 1
  // note: "body" is an injected location for simplifying method declarations
  // parameters should be sorted in the following location order:
  const locations = ['path', 'body', 'query', 'header', 'cookie']
  if (p1.in === p2.in) return remain // no need to re-order

  for (let location of locations) {
    if (p1.in === location) {
      return remain // first parameter should stay first
    }
    if (p2.in === location) {
      return before // second parameter should move up
    }
  }
  return remain
}

// - list params in precedence order as defined in paramSorter
// - inject body parameters from request object
// - exclude readOnly parameters
export const writeParams = (props: PathItemObject, requestSchema: SchemaObject | null = null) => {
  const params = asParams(props.parameters)
  if (requestSchema && requestSchema.properties) {
    Object
      .entries(requestSchema.properties)
      .forEach(([name, param]) => {
        if (param) {
          const schema = param as SchemaObject
          if (schema) {
            params.push(schemaToParam(name, schema))
          }
        }
      })
  }
  const writers = params
    .filter(p => !p.readOnly)
    .sort((p1, p2) => locationSorter(p1, p2))
  return writers
}

export class MethodParameter {
  static propNames = Object.getOwnPropertyNames(new MethodParameter())
  schema: SchemaObject = {}
  name: string = '';
  in: MethodParameterLocation = 'query'

  default? : string
  readOnly?: boolean
  description?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
  style?: ParameterStyle
  explode?: boolean
  allowReserved?: boolean
  examples?: {
      [param: string]: ExampleObject
  }
  example?: any
  content?: ContentObject

  constructor (param?: any) {
    this.name = ''
    this.schema = {} as SchemaObject
    this.in = 'query'
    if (param) {
      for (let name of MethodParameter.propNames) {
        if (param.hasOwnProperty(name)) {
          // @ts-ignore
          this[name] = param[name]
        }
      }
    }
  }

}
