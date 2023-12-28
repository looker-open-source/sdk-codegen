/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import * as OAS from 'openapi3-ts';
import md5 from 'blueimp-md5';
import type { HttpMethod } from '@looker/sdk-rtl';
import { ResponseMode, responseMode, StatusCode } from '@looker/sdk-rtl';

/**
 * Handy specification references
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schema-object
 * https://swagger.io/docs/specification/data-models/data-types/
 */

export const strBody = 'body';
export const strRequest = 'Request';
export const strWrite = 'Write';
export declare type Arg = string;

/**
 * Tags for types that have an `x-looker-values` or `enum` specification
 * according to https://swagger.io/docs/specification/data-models/enums/
 *
 * Ordinarily, if the OpenAPI specification is created by SDK Codegen, `x-looker-values` will already be converted to `enum`
 */
const lookerValuesTag = 'x-looker-values';
const enumTag = 'enum';

/** simple symbol name pattern */
const simpleName = /^[a-z_][a-z_\d]*(\[])?$/im;

/**
 * Convenience enum for exploring types
 */
export enum TypeOfType {
  /** This is an intrinsic type */
  Intrinsic,
  /** This is an ArrayType */
  Array,
  /** This is a HashType */
  Hash,
  /** This is a DelimArrayType */
  DelimArray,
  /** This is an EnumType */
  Enum,
  /** This is an EnumType */
  Complex,
}

/**
 * Get the enum for the class of the type
 * @param type
 */
export const typeOfType = (type: IType): TypeOfType => {
  if (type.intrinsic) return TypeOfType.Intrinsic;
  switch (type.className) {
    case 'ArrayType':
      return TypeOfType.Array;
    case 'HashType':
      return TypeOfType.Hash;
    case 'DelimArrayType':
      return TypeOfType.DelimArray;
    case 'EnumType':
      return TypeOfType.Enum;
    default: {
      return TypeOfType.Complex;
    }
  }
};

/**
 * Does this name have special characters?
 * @param name to name check
 * @returns true if the name isn't a standard variable name, optionally ending with []
 */
export const isSpecialName = (name: string) => {
  if (!name) return false;
  // simple naming pattern that should theoretically just work
  const result = simpleName.test(name);
  return !result;
};

/**
 * Argument values passed into functions like makeTheCall
 */
export type ArgValues = { [key: string]: any };

/**
 * convert string to a safe variable name
 *
 * @param value string value to convert to a safe variable name
 */
export const safeName = (value: string) => {
  if (!value) return '';
  // TODO need to convert unicode characters also
  return value.replace(/([-_ ]+)/g, '_');
};

/**
 * convert string to camelCase
 * @param value string value to convert to camelCase
 */
export const camelCase = (value: string) => {
  if (!value) return '';
  return value.replace(/(([-_ ]+)[a-z])|([-_ ]+)/gi, ($1) => {
    return $1.toLocaleUpperCase().replace(/([-_ ]+)/gi, '');
  });
};
/**
 * convert string to TitleCase
 * @param value string value to convert to TitleCase
 */
export const titleCase = (value: string) => {
  if (!value) return '';
  value = camelCase(value);
  return value[0].toLocaleUpperCase() + value.substr(1);
};

/**
 * Only first character of string should be uppercase
 *
 * Values are first converted to camelCase()
 *
 * @param value of string to convert
 * @returns converted string
 */
export const firstCase = (value: string) => {
  if (!value) return '';
  value = camelCase(value);
  return value[0].toLocaleUpperCase() + value.substr(1).toLocaleLowerCase();
};

export interface IModel {}

/**
 * create a "searchable" string that can be concatenated to a larger search string
 * @param {string} value to search
 * @returns {string} value plus search delimiter
 */
const searchIt = (value: string) => (value ? value + '\t' : '');

/**
 * lambda function for local sorting
 * @param {string} a first string to compare
 * @param {string} b second string to compare
 * @returns {any} but should be -1, 0, or 1
 */
const localeSort = (a: string, b: string) => a.localeCompare(b);

export interface ISymbol {
  name: string;
  fullName: string;
  owner: string;
  /**
   * if the specification name is a "special name" (e.g. the name contains hyphens or is unicode), it's saved here
   * and the name property will have the supported name since not all SDK languages support special names.
   * for example, "foo-bar" and "foo bar" would be saved in jsonName, and name="foo_bar"
   */
  jsonName: string;

  /**
   * returns True if the symbol or any symbols it contains have a "special name"
   */
  hasSpecialNeeds: boolean;

  asHashString(): string;

  searchString(criteria: SearchCriteria): string;

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean;
}

export interface ITypedSymbol extends ISymbol {
  type: IType;
}

export interface IParameter extends ITypedSymbol {
  location: MethodParameterLocation;
  required: boolean;
  description: string;
  deprecated: boolean;

  asProperty(): IProperty;

  signature(): string;

  summary(): string;

  asHashString(): string;

  doEncode(): boolean;
}

/**
 * Add generational annotations to a parameter description, like (DEPRECATED)
 * @param param to describe
 */
export const describeParam = (param: IParameter) => {
  let desc = param.description || param.type?.description;
  if (param.deprecated) {
    if (!param.description.match(/deprecated/gi)) {
      desc = `(DEPRECATED) ${desc}`;
    }
  }
  return desc;
};

export type KeyedCollection<T> = Record<string, T>;
export type MethodList = KeyedCollection<IMethod>;
export type TypeList = KeyedCollection<IType>;
export type TagList = KeyedCollection<MethodList>;
export type TypeTagList = KeyedCollection<TypeList>;
export type PropertyList = KeyedCollection<IProperty>;
export type KeyList = Set<string>;
export type EnumValueType = string | number;

/**
 * Returns sorted string array for IKeylist type
 * @param list Set of values
 * @returns sorted string array of keys
 */
export const keyValues = (list: KeyList): string[] => {
  if (!list) return [];
  return Array.from(list.values()).sort();
};

/**
 * Optionally quote a string if quotes are required
 * @param value to convert to string and optionally quote
 * @param quoteChar defaults to "'"
 * @returns the quoted or unquoted value
 */
export const mayQuote = (value: any, quoteChar = `'`): string => {
  const str = value.toString();
  if (!isSpecialName(str)) return str;
  return `${quoteChar}${str}${quoteChar}`;
};

/**
 * Resolve a list of method keys into an IMethod[] in alphabetical order by name
 * @param api model to use
 * @param refs references to models
 * @returns Populated method list. Anything not matched is skipped
 */
export const methodRefs = (api: IApiModel, refs: KeyList): IMethod[] => {
  const keys = keyValues(refs);
  const result: IMethod[] = [];
  keys.forEach((k) => {
    if (k in api.methods) {
      result.push(api.methods[k]);
    }
  });
  return result;
};

/**
 * Resolve a list of method keys into an IType[] in alphabetical order by name
 * @param api model to use
 * @param refs references to models
 * @returns Populated method list. Anything not matched is skipped
 */
export const typeRefs = (api: IApiModel, refs: KeyList): IType[] => {
  const keys = keyValues(refs);
  const result: IType[] = [];
  keys.forEach((k) => {
    const ref = api.types[k];
    if (ref) {
      result.push(ref);
    }
  });
  return result;
};

/**
 * Resolves first method ref it can find
 * @param api parsed spec
 * @param type tree to walk
 * @param stack call stack to prevent infinite recursion
 */
export const firstMethodRef = (
  api: ApiModel,
  type: IType,
  stack: KeyList = new Set<string>()
): IMethod => {
  stack.add(type.name);

  let method = methodRefs(api, type.methodRefs)[0];
  if (!method) {
    const parents = typeRefs(api, type.parentTypes);
    for (const parent of parents) {
      if (!stack.has(parent.name)) {
        method = firstMethodRef(api, parent, stack);
      }
      if (method) break;
    }
  }
  return method;
};

/**
 * Returns the first method (if any) that uses the reference type for updating
 * @param api parsed spec
 * @param type to check for writing
 * @param stack call stack to prevent infinite recursion
 */
const anyWriter = (
  api: ApiModel,
  type: IType,
  stack: KeyList = new Set<string>()
): IMethod | undefined => {
  let result: IMethod | undefined;
  if (stack.has(type.name)) return undefined;
  stack.add(type.name);
  const methods = methodRefs(api, type.methodRefs);
  for (const method of methods) {
    if (
      method.httpMethod === 'POST' ||
      method.httpMethod === 'PUT' ||
      method.httpMethod === 'PATCH'
    ) {
      result = method;
      break;
    }
  }
  if (!result) {
    const allTypes = new Set([...type.parentTypes, ...type.customTypes]);
    allTypes.delete(type.name);
    const refs = typeRefs(api, allTypes);

    for (const ref of refs) {
      result = anyWriter(api, ref, stack);
      if (result) {
        break;
      }
    }
  }
  return result;
};

export interface ISymbolList {
  methods: MethodList;
  types: TypeList;
}

export enum SearchCriterion {
  method,
  type,
  name,
  description,
  argument,
  property,
  title,
  activityType,
  status,
  response,
}

export type SearchCriterionTerm = keyof typeof SearchCriterion;

export type SearchCriteria = Set<SearchCriterion>;

export const SearchAll: SearchCriteria = new Set([
  SearchCriterion.method,
  SearchCriterion.type,
  SearchCriterion.name,
  SearchCriterion.description,
  SearchCriterion.argument,
  SearchCriterion.property,
  SearchCriterion.title,
  SearchCriterion.activityType,
  SearchCriterion.status,
  SearchCriterion.response,
]);

export const criteriaToSet = (criteria: string[]): SearchCriteria => {
  const result: SearchCriteria = new Set();
  criteria.forEach((name) => {
    const val = SearchCriterion[name as SearchCriterionTerm];
    if (val !== undefined)
      result.add(SearchCriterion[name as SearchCriterionTerm]);
  });
  return result;
};

export const setToCriteria = (criteria: SearchCriteria): string[] => {
  const result: string[] = [];
  criteria.forEach((value) => result.push(SearchCriterion[value]));
  return result;
};

export interface ISearchResult {
  ok: boolean;
  tags: TagList;
  types: TypeList;
  message: string;
}

export interface ISymbolTable extends ISymbolList {
  resolveType(schema: OAS.SchemaObject): IType;
}

/** Type of type */
export enum MetaType {
  /** scalar type */
  Intrinsic = 'Intrinsic',
  /** from API specification */
  Specification = 'Specification',
  /** writeable type */
  Write = 'Write',
  /** Request type for API methods */
  Request = 'Request',
  /** enumerated type */
  Enumerated = 'Enumerated',
}

export interface IType extends ISymbol {
  /**
   * key/value collection of properties for this type
   */
  properties: PropertyList;

  /**
   * key/value collection of required properties for this type
   */
  requiredProperties: PropertyList;

  /**
   * key/value collection of optional properties for this type
   */
  optionalProperties: PropertyList;

  /**
   * List of writeable properties for this type
   */
  writeable: IProperty[];

  /**
   * Status like 'beta', 'experimental', 'stable'
   */
  status: string;

  /**
   * If this type is a collection, this is the "item" type
   */
  elementType?: IType;

  /**
   * True if this type is deprecated
   */
  deprecated: boolean;

  /**
   * Description of the type
   */
  description: string;

  /**
   * Title for the type. Dunno why OAS has this
   */
  title: string;

  /**
   * Default value for the type. Optional types may have default values defined
   */
  default?: string;

  /**
   * Is this a read-only type?
   */
  readOnly: boolean;

  /**
   * Number of times this type is referenced, per language, when generating methods
   * Other than for reporting purposes, this is used to generate import statements
   * Idea adopted from Delphi
   */
  refCount: number;

  /**
   * OAS schema for the type
   */
  schema: OAS.SchemaObject;

  /**
   * If this is a custom type from the API specification, it will be eponymous
   * If it's a list type, it will be customType of the item type
   * Otherwise, it will be '' (e.g. IntrinsicType)
   */
  customType: string;

  /**
   * names of methods referencing this type
   */
  methodRefs: KeyList;

  /**
   * Names of types referenced by this type
   */
  types: KeyList;

  /**
   * Names of custom types referenced by this type
   */
  customTypes: KeyList;

  /**
   * Names of custom types that have a property of this type
   */
  parentTypes: KeyList;

  /**
   * Hopefully temporary concession to build problems with instance of ArrayType checks etc failing
   */
  className: string;

  /**
   * Is this an intrinsic type?
   */
  intrinsic: boolean;

  /**
   * type classification
   */
  metaType: MetaType;

  /**
   * Hacky workaround for inexplicable instanceof failures
   * @param {string} className name of class to check
   * @returns {boolean} true if class name matches this.className
   */
  instanceOf(className: string): boolean;

  asHashString(): string;

  isRecursive(): boolean;

  searchString(criteria: SearchCriteria): string;

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean;
}

export interface IEnumType extends IType {
  values: EnumValueType[];
}

export declare type MethodParameterLocation =
  | 'path'
  | 'body'
  | 'query'
  | 'header'
  | 'cookie';

export interface IMethodResponse {
  statusCode: number;
  mediaType: string;
  type: IType;
  mode: ResponseMode;
  description: string;

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean;

  searchString(criteria: SearchCriteria): string;
}

/**
 * categorize all types using their method refs
 *
 * @param api parsed Api specification
 * @param types to categorize
 */
export const tagTypes = (api: ApiModel, types: TypeList) => {
  const typeTags = {};
  Object.entries(types)
    .filter(([_, type]) => !type.intrinsic)
    .forEach(([name, type]) => {
      let methods = methodRefs(api, type.methodRefs);
      // If no method is found, look up parents until you get a method
      if (methods.length === 0) {
        const first = firstMethodRef(api, type);
        if (first) methods = [first];
      }
      methods.forEach((method) => {
        // The type is tagged for each method's tags
        for (const tag of method.schema.tags) {
          let list: TypeList = typeTags[tag];
          if (!list) {
            list = {};
            typeTags[tag] = list;
          }
          list[name] = type;
        }
      });
    });
  return typeTags;
};

class MethodResponse implements IMethodResponse {
  // TODO either use this https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-useless-constructor.md
  // or turn off 'useless constructor' linting
  constructor(
    public statusCode: number,
    public mediaType: string,
    public type: IType,
    public description: string
  ) {}

  get mode(): ResponseMode {
    return responseMode(this.mediaType);
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    if (!criteria.has(SearchCriterion.response)) return false;
    return (
      rx.test(this.searchString(criteria)) || this.type.search(rx, criteria)
    );
  }

  searchString(criteria: SearchCriteria): string {
    let result =
      searchIt(`${this.statusCode}`) + searchIt(`${ResponseMode[this.mode]}`);
    if (criteria.has(SearchCriterion.name)) result += searchIt(this.mediaType);
    return result;
  }
}

export interface IProperty extends ITypedSymbol {
  required: boolean;
  nullable: boolean;
  description: string;
  readOnly: boolean;
  writeOnly: boolean;
  deprecated: boolean;

  searchString(include: SearchCriteria): string;

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} include items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, include: SearchCriteria): boolean;

  summary(): string;
}

class Symbol implements ISymbol {
  jsonName = '';
  readonly hasSpecialNeeds: boolean = false;
  constructor(
    public name: string,
    public type: IType,
    public owner: string = ''
  ) {
    this.jsonName = name;
    const snake = safeName(name);
    if (snake !== name) {
      this.name = snake;
      this.hasSpecialNeeds = true;
    }
  }

  get fullName(): string {
    return `${this.owner ? this.owner + '.' : ''}${this.name}`;
  }

  asHashString() {
    return `${this.name}:${this.type.name}`;
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    return (
      rx.test(this.searchString(criteria)) || this.type.search(rx, criteria)
    );
  }

  searchString(criteria: Set<SearchCriterion>): string {
    let result = '';
    if (
      criteria.has(SearchCriterion.name) ||
      criteria.has(SearchCriterion.method)
    )
      result += searchIt(this.name) + searchIt(this.jsonName);
    return result;
  }
}

interface ISchemadSymbol extends ITypedSymbol {
  /**
   * Original OpenAPI schema reference for this item
   */
  schema: OAS.SchemaObject;

  /**
   * Status indicator of this item. Typically 'stable', 'beta', 'experimental', or ''
   */
  status: string;

  /**
   * Description of this item
   */
  description: string;

  /**
   * True if this item has been deprecated
   */
  deprecated: boolean;

  /**
   * If deprecated, 'deprecated'. Otherwise ''
   */
  deprecation: string;
}

class SchemadSymbol extends Symbol implements ISchemadSymbol {
  schema: OAS.SchemaObject;
  description: string;
  deprecated = false;

  constructor(name: string, type: IType, schema: OAS.SchemaObject, owner = '') {
    super(name, type, owner);
    this.schema = schema;
    this.description = schema.description || type.description || '';
    this.deprecated =
      schema.deprecated || schema['x-looker-deprecated'] || false;
  }

  get status(): string {
    return this.schema['x-looker-status'] || '';
  }

  get deprecation(): string {
    return this.deprecated ? 'deprecated' : '';
  }
}

export class Property extends SchemadSymbol implements IProperty {
  required = false;
  nullable = false;
  readOnly = false;
  writeOnly = false;

  constructor(
    name: string,
    type: IType,
    schema: OAS.SchemaObject,
    owner = '',
    required: string[] = []
  ) {
    super(name, type, schema, owner);
    this.required = !!(
      required.includes(name) || schema.required?.includes(name)
    );
    this.nullable =
      this.schema.nullable || this.schema['x-looker-nullable'] || false;
    this.readOnly = this.schema.readOnly || false;
    this.writeOnly = this.schema.writeOnly || false;
  }

  private tag(key: string) {
    return this[key] ? ` ${key}` : '';
  }

  summary() {
    return `${this.fullName}:${this.type.name}${this.tag('readOnly')}${this.tag(
      'required'
    )}${this.tag('nullable')}${this.tag('deprecated')}`;
  }

  asHashString() {
    return (
      super.asHashString() +
      this.tag('readOnly') +
      this.tag('required') +
      this.tag('nullable') +
      this.tag('deprecated')
    );
  }

  searchString(criteria: SearchCriteria): string {
    let result = super.searchString(criteria);
    if (criteria.has(SearchCriterion.description))
      result += searchIt(this.description);
    if (criteria.has(SearchCriterion.status))
      result += searchIt(this.status) + searchIt(this.deprecation);
    return result;
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    return (
      rx.test(this.searchString(criteria)) || this.type.search(rx, criteria)
    );
  }
}

export class Parameter extends SchemadSymbol implements IParameter {
  description = '';
  location: MethodParameterLocation = 'query';
  required = false;

  constructor(
    param: OAS.ParameterObject | Partial<IParameter>,
    type: IType,
    owner = ''
  ) {
    super(param.name || '', type, type.schema, owner);
    this.description = param.description || type.description || '';
    if ('in' in param) {
      this.location = param.in;
    } else {
      this.location = (param as Partial<IParameter>).location || strBody;
    }
    this.deprecated = param.deprecated || this.deprecated;
    // TODO deal with the required value being the names of the columns that are required
    this.required = param.required || false;
  }

  asSchemaObject() {
    return {
      deprecated: this.deprecated,
      description: this.description,

      nullable: !this.required,

      readOnly: false,
      // || this.location === strBody),
      required: this.required ? [this.name] : undefined,
      type: this.type.name || this.name,
      writeOnly: false,
    } as OAS.SchemaObject;
  }

  asProperty() {
    return new Property(this.name, this.type, this.asSchemaObject());
  }

  private tag(key: string) {
    return this[key] ? ` ${key}` : '';
  }

  signature() {
    return (
      (this.required ? '' : '[') +
      this.name +
      ':' +
      this.type.name +
      (this.required ? '' : ']')
    );
  }

  summary() {
    return `${this.fullName}:${this.type.name}${this.tag('readOnly')}${this.tag(
      'required'
    )}${this.tag('nullable')}${this.tag('deprecated')}`;
  }

  asHashString() {
    return `${this.name}:${this.type.name}${this.required ? '' : '?'}${
      this.location
    }`;
  }

  doEncode() {
    return (
      this.type.name === 'string' ||
      this.type.name === 'datetime' ||
      this.type.name === 'date'
    );
  }

  searchString(criteria: Set<SearchCriterion>): string {
    let result = '';
    if (criteria.has(SearchCriterion.name)) result += searchIt(this.name);
    if (criteria.has(SearchCriterion.description))
      result += searchIt(this.description);
    return result;
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    return (
      rx.test(this.searchString(criteria)) || this.type.search(rx, criteria)
    );
  }
}

/**
 * Properties and methods of an SDK method
 *
 * Everything required to generate a method declaration, and documentation for it,
 * is contained in this interface. Search functionality is also included.
 *
 */
export interface IMethod extends ISchemadSymbol {
  /** Lookup id */
  id: string;

  /** alias of ISymbol.name */
  operationId: string;

  /** HTTP method used for this REST request */
  httpMethod: HttpMethod;

  /** Relative URL of the endpoint */
  endpoint: string;

  /** Prefers 200 response with application/json as the response type */
  primaryResponse: IMethodResponse;

  /** If there's only one 200 or 204 response for this method, this is it's return type */
  returnType: IMethodResponse | undefined;

  /** List of all responses that can be returned by this REST call */
  responses: IMethodResponse[];

  /** List of all 2xx responses */
  okResponses: IMethodResponse[];

  /** Description (from the spec) of this method */
  description: string;

  /** All parameters defined for this method, in natural order from spec processing */
  params: IParameter[];

  /** Summary from the method's schema object */
  summary: string;

  /** Names of path arguments. Not in required/optional priority */
  pathArgs: string[];

  /** Primary body argument name ('' if it doesn't exist) */
  bodyArg: string;

  /** Names of query arguments. Not in required/optional priority */
  queryArgs: string[];

  /** Names of header arguments. Not currently used by Codegen */
  headerArgs: string[];

  /** Names of cookie arguments. Not currently used by Codegen */
  cookieArgs: string[];

  /** Responses that have HTTP error codes (4xx) */
  errorResponses: IMethodResponse[];

  /** All required parameters, ordered by location precedence */
  requiredParams: IParameter[];

  /** All optional parameters, ordered by location precedence */
  optionalParams: IParameter[];

  /**
   * All parameters in the correct, sorted order for the method code generator
   * Parameters are required, by location precedence, then optional, by location precedence
   */
  allParams: IParameter[];

  /** All body parameters in natural order */
  bodyParams: IParameter[];

  /** All path parameters in natural order */
  pathParams: IParameter[];

  /** All query parameters in natural order */
  queryParams: IParameter[];

  /** The types of responses returned by this method (binary and/or string) */
  responseModes: Set<ResponseMode>;

  /** Value of `x-looker-activity-type` from schema specification */
  activityType: string;

  /** all type names referenced in this method, including intrinsic types */
  types: KeyList;

  /** all non-instrinsic type names referenced in this method */
  customTypes: KeyList;

  /** true if this method is a rate-limited API endpoint */
  rateLimited: boolean;

  /**
   * Get a list of parameters for location, or just all parameters
   * @param {MethodParameterLocation} location is optional. defaults to all parameters
   * @returns {IParameter[]} all parameters in natural order matching the location constraing
   */
  getParams(location?: MethodParameterLocation): IParameter[];

  /**
   * return the list of optional parameters, optionally for a specific location
   * @param {MethodParameterLocation} location
   * @returns {IParameter[]}
   */
  optional(location?: MethodParameterLocation): IParameter[];

  /**
   * return the list of required parameters, optionally for a specific location
   */
  required(location?: MethodParameterLocation): IParameter[];

  /**
   * Does this method have optional parameters?
   * @returns {boolean} true if optional parameters exist for this method
   */
  hasOptionalParams(): boolean;

  /**
   * Does this method return binary responses?
   * @returns {boolean} true if binary responses are possible
   */
  responseIsBinary(): boolean;

  /**
   * Does this method return string responses?
   * @returns {boolean} true if string responses are possible
   */
  responseIsString(): boolean;

  /**
   * Does this method return both binary and string responses
   * @returns {boolean} true if both binary and string responses are possible
   */
  responseIsBoth(): boolean;

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean;

  /**
   * Add a parameter to the method, tracking all cross-reference information
   * @param {IApiModel} api specification containing this method
   * @param {IParameter} param to add to the spec
   * @returns {IMethod} the defined method with parameter and references added
   */
  addParam(api: IApiModel, param: IParameter): IMethod;

  /**
   * Add a type to the method, tracking all cross-reference information
   * @param {IApiModel} api specification containing this method
   * @param {IType} type to add to the spec
   * @returns {IMethod} the defined method with parameter and references added
   */
  addType(api: IApiModel, type: IType): IMethod;

  /**
   * Sorts parameters by location precedence, then alphanumeric
   * @param {IParameter[]} list
   * @returns {IParameter[]}
   */
  sort(list?: IParameter[]): IParameter[];

  /**
   * If a method may need a request type for a given language, this function returns true
   */
  eligibleForRequestType(): boolean;

  /**
   * If any dynamic types will be required for this method, this function will make them
   *
   * Dynamic types are Request and Write types
   *
   * @param api the spec to use for making types
   * @returns {KeyList} the list of all types used by the method
   */
  makeTypes(api: IApiModel): KeyList;

  signature(): string;
}

/**
 * Concrete implementation of IMethod interface
 */
export class Method extends SchemadSymbol implements IMethod {
  readonly id: string;
  readonly httpMethod: HttpMethod;
  readonly endpoint: string;
  readonly primaryResponse: IMethodResponse;
  responses: IMethodResponse[];
  readonly okResponses: IMethodResponse[];
  readonly params: IParameter[];
  readonly responseModes: Set<ResponseMode>;
  readonly activityType: string;
  readonly customTypes: KeyList;
  readonly types: KeyList;
  readonly rateLimited: boolean;
  readonly returnType: IMethodResponse | undefined;

  constructor(
    api: IApiModel,
    httpMethod: HttpMethod,
    endpoint: string,
    schema: OAS.OperationObject,
    params: IParameter[],
    responses: IMethodResponse[],
    body?: IParameter
  ) {
    if (!schema.operationId) {
      throw new Error('Missing operationId');
    }

    const okays = responses.filter((response) => {
      return (
        response.statusCode === StatusCode.OK ||
        response.statusCode === StatusCode.NoContent
      );
    });
    if (!okays) {
      throw new Error(`Missing 2xx + application/json response in ${endpoint}`);
    }

    const primaryResponse =
      okays.find((response) => {
        // prefer json response over all other 200s
        return (
          response.statusCode === StatusCode.OK &&
          response.mediaType === 'application/json'
        );
      }) ||
      okays.find((response) => {
        return response.statusCode === StatusCode.OK; // accept any mediaType for 200 if none are json
      }) ||
      okays.find((response) => {
        return response.statusCode === StatusCode.NoContent;
      });

    if (!primaryResponse) {
      throw new Error(`Missing 2xx + application/json response in ${endpoint}`);
    }

    super(schema.operationId, primaryResponse.type, schema);
    this.okResponses = okays;
    if (okays.length === 1) {
      // There's only one return type for this function
      this.returnType = primaryResponse;
    }

    this.customTypes = new Set<string>();
    this.types = new Set<string>();
    this.httpMethod = httpMethod;
    this.endpoint = endpoint;
    this.id = `${httpMethod} ${endpoint}`;
    this.responses = responses;
    this.primaryResponse = primaryResponse;
    this.responseModes = this.getResponseModes();
    this.params = [];
    params.forEach((p) => this.addParam(api, p));
    responses.forEach((r) => this.addType(api, r.type));
    if (body) {
      this.addParam(api, body);
    }
    this.activityType = schema['x-looker-activity-type'];
    this.rateLimited = Method.isRateLimited(schema);
  }

  /**
   * Check the many, many ways an endpoint can be flagged as rate-limited
   *
   * Because we LOVE standards. Yes we do.
   *
   * See https://github.com/OAI/OpenAPI-Specification/issues/1539 for more color commentary
   *
   * @param op to check for rate limiting
   * @returns true if any rate limiting attribute is defined for the op
   */
  static isRateLimited(op: OAS.OperationObject): boolean {
    if (op['x-looker-rate-limited']) return true;

    const many = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
    ];
    for (const flag of many) {
      if (flag in op) return true;
    }

    return false;
  }

  eligibleForRequestType(): boolean {
    const [body] = this.bodyParams;
    /**
     * if the body parameter is specified and is optional, at least 2 optional parameters are required
     */
    const offset = body && `required` in body && !body.required ? 1 : 0;
    return this.optionalParams.length - offset > 1;
  }

  makeTypes(api: IApiModel): KeyList {
    if (this.eligibleForRequestType()) {
      api.getRequestType(this);
    }

    Object.entries(this.params).forEach(([, param]) => {
      const writer = api.mayGetWriteableType(param.type);
      if (writer) {
        this.types.add(writer.name);
        this.customTypes.add(writer.name);
      }
    });

    return this.types;
  }

  /**
   * Adds the parameter and registers its type for the method
   * @param api current API model
   * @param {IParameter} param
   */
  addParam(api: IApiModel, param: IParameter) {
    param.owner = this.name;
    this.params.push(param);
    this.addType(api, param.type);
    return this;
  }

  /**
   * Adds the type to the method type xrefs and adds the method to the types xref
   * @param api ApiModel for tracking type
   * @param type Type to add
   */
  addType(api: IApiModel, type: IType) {
    this.types.add(type.name);
    // Add the method xref to the type
    type.methodRefs.add(this.name);

    const custom = type.customType;
    if (custom) {
      this.customTypes.add(custom);
      const customType = api.types[custom];
      customType.methodRefs.add(this.name);
    }
    return this;
  }

  /**
   * Determines which response modes (binary/string) this method supports
   * @returns {Set<string>} Either a set of 'string' or 'binary' or both
   */
  private getResponseModes() {
    const modes = new Set<ResponseMode>();
    for (const resp of this.responses) {
      // TODO should we use one of the mime packages like https://www.npmjs.com/package/mime-types for
      // more thorough/accurate coverage?
      const mode = resp.mode;
      if (mode !== ResponseMode.unknown) modes.add(mode);
    }

    if (modes.size === 0) {
      throw new Error(
        `Is ${this.operationId} ${JSON.stringify(
          this.responses
        )} binary or string?`
      );
    }

    return modes;
  }

  get operationId(): string {
    return this.name;
  }

  get summary(): string {
    return this.schema.summary || '';
  }

  signature() {
    let result = this.operationId + '(';
    const allParams = this.allParams;
    if (allParams) {
      allParams.forEach((param, index) => {
        if (index > 0) result += ', ';
        result += param.signature();
      });
    }
    result += ')';
    return result;
  }

  // all required parameters ordered by location declaration order
  get requiredParams() {
    return this.required('path').concat(
      this.required(strBody),
      this.required('query'),
      this.required('header'),
      this.required('cookie')
    );
  }

  // all required parameters ordered by location declaration order
  get optionalParams() {
    return this.optional('path').concat(
      this.optional(strBody),
      this.optional('query'),
      this.optional('header'),
      this.optional('cookie')
    );
  }

  // all parameters ordered by required, then optional, location declaration order
  get allParams() {
    return this.requiredParams.concat(this.optionalParams);
  }

  get pathParams() {
    return this.getParams('path');
  }

  get bodyParams() {
    return this.getParams(strBody);
  }

  get queryParams() {
    return this.getParams('query');
  }

  get headerParams() {
    return this.getParams('header');
  }

  get cookieParams() {
    return this.getParams('cookie');
  }

  get pathArgs() {
    return this.argumentNames('path');
  }

  get bodyArg() {
    const body = this.argumentNames(strBody);
    if (body.length === 0) return '';
    return body[0];
  }

  get queryArgs() {
    return this.argumentNames('query');
  }

  get headerArgs() {
    return this.argumentNames('header');
  }

  get cookieArgs() {
    return this.argumentNames('cookie');
  }

  get errorResponses() {
    // TODO use lodash?
    const result = [];
    const map = new Map();
    for (const item of this.responses.filter((r) => r.statusCode >= 400)) {
      if (!map.has(item.type.name)) {
        map.set(item.type.name, true);
        result.push(item);
      }
    }
    return result;
  }

  getParams(location?: MethodParameterLocation): IParameter[] {
    if (location) {
      return this.params.filter((p) => p.location === location);
    }
    return this.params;
  }

  responseIsBinary(): boolean {
    return this.responseModes.has(ResponseMode.binary);
  }

  responseIsString(): boolean {
    return this.responseModes.has(ResponseMode.string);
  }

  responseIsBoth(): boolean {
    return this.responseIsBinary() && this.responseIsString();
  }

  /**
   * order parameters in location precedence
   */
  private static locationSorter(a: IParameter, b: IParameter) {
    const remain = 0;
    const before = -1;
    // const after = 1
    // note: "strBody" is an injected location for simplifying method declarations
    // parameters should be sorted in the following location order:
    const locations = ['path', strBody, 'query', 'header', 'cookie'];
    if (a.location === b.location) return remain; // no need to re-order

    for (const location of locations) {
      if (a.location === location) {
        return remain; // first parameter should stay first
      }
      if (b.location === location) {
        return before; // second parameter should move up
      }
    }
    return remain;
  }

  sort(list?: IParameter[]) {
    if (!list) list = this.params;
    return list.sort((a, b) => Method.locationSorter(a, b));
  }

  /**
   * return the list of required parameters, optionally for a specific location
   */
  required(location?: MethodParameterLocation) {
    let list = this.params.filter((i) => i.required);
    if (location) {
      list = list.filter((i) => i.location === location);
    }
    return list;
  }

  // return the list of optional parameters, optionally for a specific location
  optional(location?: MethodParameterLocation) {
    let list = this.params.filter((i) => !i.required);
    if (location) {
      list = list.filter((i) => i.location === location);
    }
    return list;
  }

  hasOptionalParams() {
    return this.optional().length > 0;
  }

  private argumentNames(location?: MethodParameterLocation): string[] {
    return this.getParams(location).map((p) => p.name);
  }

  isMethodSearch(criteria: SearchCriteria): boolean {
    return (
      criteria.has(SearchCriterion.method) ||
      criteria.has(SearchCriterion.status) ||
      criteria.has(SearchCriterion.activityType) ||
      criteria.has(SearchCriterion.name) ||
      criteria.has(SearchCriterion.argument)
    );
  }

  searchString(criteria: SearchCriteria = SearchAll): string {
    // Are we only searching for contained items of the method or not?
    if (!this.isMethodSearch(criteria)) return '';
    let result = super.searchString(criteria);
    result += searchIt(this.summary) + searchIt(this.endpoint);
    if (criteria.has(SearchCriterion.method)) {
      if (criteria.has(SearchCriterion.description)) {
        result += searchIt(this.description);
      }
    }
    if (criteria.has(SearchCriterion.activityType)) {
      if (this.rateLimited) {
        result += searchIt('rate_limited');
      }
      result += searchIt(this.activityType);
    }
    if (criteria.has(SearchCriterion.status)) {
      result += searchIt(this.status) + searchIt(this.deprecation);
    }
    if (criteria.has(SearchCriterion.argument)) {
      this.params.forEach((p) => {
        result += p.searchString(criteria);
      });
    }
    return result;
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    let result =
      rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
    if (!result && criteria.has(SearchCriterion.argument)) {
      for (const a of this.params) {
        if (a.search(rx, criteria)) {
          result = true;
          break;
        }
      }
    }
    if (!result && criteria.has(SearchCriterion.response)) {
      for (const r of this.responses) {
        if (r.search(rx, criteria)) {
          result = true;
          break;
        }
      }
    }
    return result;
  }
}

export class Type implements IType {
  readonly properties: PropertyList = {};
  readonly methodRefs: KeyList = new Set<string>();
  readonly types: KeyList = new Set<string>();
  readonly customTypes: KeyList = new Set<string>();
  readonly parentTypes: KeyList = new Set<string>();
  private _writeable: IProperty[] = [];
  description: string;
  customType: string;
  jsonName = '';
  refCount = 0;

  constructor(
    public schema: OAS.SchemaObject,
    public name: string
  ) {
    this.jsonName = name;
    const snake = safeName(name);
    if (snake !== name) {
      this.name = snake;
    }
    this.customType = name;
    this.description = this.schema.description || '';
  }

  get metaType(): MetaType {
    if (this.intrinsic) return MetaType.Intrinsic;
    if (this instanceof RequestType) return MetaType.Request;
    if (this instanceof WriteType) return MetaType.Write;
    if (this instanceof EnumType) return MetaType.Enumerated;
    return MetaType.Specification;
  }

  get fullName(): string {
    return this.name;
  }

  get owner(): string {
    return '';
  }

  get writeable(): IProperty[] {
    return this._writeable;
  }

  /**
   * This is intended to be a one-time call per type to determine its writeable properties
   * @param api ApiModel for type references
   */
  setWriteable(api: ApiModel) {
    const result: IProperty[] = [];
    Object.values(this.properties)
      .filter((prop) => !(prop.readOnly || prop.type.readOnly))
      .forEach((prop) => {
        const type = prop.type;
        const w = type.intrinsic ? undefined : api.mayGetWriteableType(type);
        if (w) {
          const writeProp = { ...prop, ...{ type: w } };
          result.push(writeProp);
        } else {
          result.push(prop);
        }
      });
    this._writeable = result;
    return this._writeable;
  }

  /**
   * Sets writeable property collection if it's not already set
   * @param api to use for type lookup
   */
  maySetWriteable(api: ApiModel) {
    if (this._writeable.length === 0) {
      this.setWriteable(api);
    }
    return this._writeable;
  }

  get className(): string {
    return this.name;
  }

  get intrinsic(): boolean {
    return false;
  }

  get status(): string {
    return this.schema['x-looker-status'] || '';
  }

  get deprecated(): boolean {
    return (
      this.schema.deprecated || this.schema['x-looker-deprecated'] || false
    );
  }

  get title(): string {
    return this.schema.title || '';
  }

  get default(): string | undefined {
    return this.schema.default || '';
  }

  get readOnly(): boolean {
    return Object.entries(this.properties).every(([, prop]) => prop.readOnly);
  }

  private filterRequiredProps(required: boolean) {
    const filteredProps: PropertyList = {};
    Object.entries(this.properties).forEach(([key, prop]) => {
      const condition = required ? prop.required : !prop.required;
      if (condition) {
        filteredProps[key] = prop;
      }
    });
    return filteredProps;
  }

  get requiredProperties() {
    return this.filterRequiredProps(true);
  }

  get optionalProperties() {
    return this.filterRequiredProps(false);
  }

  get hasSpecialNeeds(): boolean {
    return !!Object.entries(this.properties).find(
      ([, prop]) => prop.hasSpecialNeeds
    );
  }

  load(api: ApiModel): void {
    Object.entries(this.schema.properties || {}).forEach(
      ([propName, propSchema]) => {
        const propType = api.resolveType(
          propSchema,
          undefined,
          propName,
          this.name
        );
        // Using class name instead of instanceof check because TypeScript
        // linting complains about declaration order
        if (propType.instanceOf('EnumType')) {
          api.registerEnum(propType, propName);
        }
        // Track the "parent" reference for this type from the property reference
        propType.parentTypes.add(this.name);
        if (
          propType.instanceOf('ArrayType') ||
          propType.instanceOf('HashType')
        ) {
          propType.elementType?.parentTypes.add(propType.name);
          propType.elementType?.parentTypes.add(this.name);
          propType.parentTypes.add(this.name);
        }
        this.types.add(propType.name);
        const customType = propType.customType;
        if (customType) this.customTypes.add(customType);
        this.properties[safeName(propName)] = new Property(
          propName,
          propType,
          propSchema,
          this.name, // owner name
          this.schema.required
        );
      }
    );
  }

  instanceOf(className: string): boolean {
    return this.className === className;
  }

  asHashString() {
    let result = `${this.name}:`;
    Object.entries(this.properties)
      // put properties in alphabetical order first
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([, prop]) => {
        result += prop.asHashString() + ':';
      });
    return result;
  }

  /**
   * Is this type directly recursive?
   * @returns {boolean} Does this type contain references to itself as a top-level property?
   */
  isRecursive(): boolean {
    const selfType = this.name;
    // test for directly recursive type references
    return Object.entries(this.properties).some(
      ([, prop]) => prop.type.name === selfType
    );
  }

  private static isPropSearch(criteria: SearchCriteria): boolean {
    return (
      criteria.has(SearchCriterion.status) ||
      criteria.has(SearchCriterion.property)
    );
  }

  /**
   * Search this item for a regular expression pattern
   * @param {RegExp} rx regular expression to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(rx: RegExp, criteria: SearchCriteria): boolean {
    if (
      !criteria.has(SearchCriterion.type) &&
      !criteria.has(SearchCriterion.status)
    )
      return false;
    let result = rx.test(this.searchString(criteria));
    if (!result && Type.isPropSearch(criteria)) {
      for (const [, prop] of Object.entries(this.properties)) {
        if (this.name !== prop.type.name) {
          /** Avoiding recursion */
          if (prop.search(rx, criteria)) {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  }

  searchString(criteria: SearchCriteria): string {
    let result = '';
    if (criteria.has(SearchCriterion.name)) result += searchIt(this.name);
    if (criteria.has(SearchCriterion.description))
      result += searchIt(this.description);
    if (criteria.has(SearchCriterion.title)) result += searchIt(this.title);
    if (criteria.has(SearchCriterion.status)) {
      result += searchIt(this.status);
      if (this.deprecated) result += searchIt('deprecated');
    }
    if (criteria.has(SearchCriterion.property)) {
      Object.entries(this.properties).forEach(([, prop]) => {
        if (this.name !== prop.type.name) {
          /** Avoiding recursion */
          result += prop.searchString(criteria);
        }
      });
    }
    return result;
  }
}

export class ArrayType extends Type {
  constructor(
    public elementType: IType,
    schema: OAS.SchemaObject
  ) {
    super(schema, `${elementType.name}[]`);
    this.customType = elementType.customType;
  }

  get className(): string {
    return 'ArrayType';
  }

  get readOnly() {
    return this.elementType.readOnly;
  }
}

export class EnumType extends Type implements IEnumType {
  readonly values: EnumValueType[];

  constructor(
    public elementType: IType,
    schema: OAS.SchemaObject,
    api: ApiModel,
    typeName?: string,
    methodName?: string
  ) {
    super(schema, schema.name);
    this.customType = elementType.customType;
    if (lookerValuesTag in schema) {
      this.values = schema[lookerValuesTag];
    } else if (enumTag in schema) {
      this.values = schema[enumTag] as EnumValueType[];
    } else {
      throw new Error(
        `${schema.name} is an enum but has no defined enum values`
      );
    }
    if (methodName) {
      this.description = `${this.description}${
        this.description ? ' ' : ''
      }(Enum defined in ${methodName})`;
    }

    this.name = this.findName(api, typeName, methodName);
  }

  private findName(api: ApiModel, typeName?: string, methodName?: string) {
    const hash = md5(this.asHashString());
    const enums = api.getEnumList();
    let name = titleCase(this.name || typeName || 'Enum');
    if (name in api.types) {
      const matched = enums[hash];
      if (matched?.name === name) {
        /**
         * this type is the same as the other enum of the same name, although description may vary.
         * The descriptions may vary, but we prioritize type name over description for identical enum values
         * since this has the same name, it will replace the previous version in the keyed collection of types
         */
        return name;
      }

      // Enum values don't match existing enum of this name. Pick a new name
      const baseName = methodName ? titleCase(`${methodName}_${name}`) : name;
      let newName = baseName;
      let i = 0;
      while (newName in api.types) {
        newName = `${baseName}${++i}`;
      }
      name = newName;
    }
    // register the enum hash value
    enums[hash] = this;
    return name;
  }

  searchString(criteria: SearchCriteria): string {
    let result = super.searchString(criteria);
    if (criteria.has(SearchCriterion.property)) {
      for (const val in this.values) {
        result += searchIt(val.toString());
      }
    }
    return result;
  }

  get className(): string {
    return 'EnumType';
  }

  get readOnly() {
    return this.elementType.readOnly;
  }

  asHashString() {
    return this.values.join();
  }
}

export class DelimArrayType extends Type {
  constructor(
    public elementType: IType,
    schema: OAS.SchemaObject
  ) {
    super(schema, `DelimArray<${elementType.name}>`);
    this.elementType = elementType;
    this.customType = elementType.customType;
  }

  get className(): string {
    return 'DelimArrayType';
  }

  get readOnly() {
    return this.elementType.readOnly;
  }
}

export class HashType extends Type {
  elementType: IType;

  constructor(elementType: IType, schema: OAS.SchemaObject) {
    super(schema, `Hash[${elementType.name}]`);
    this.elementType = elementType;
    this.customType = elementType.customType;
  }

  get className(): string {
    return 'HashType';
  }

  get readOnly() {
    return this.elementType.readOnly;
  }
}

export class IntrinsicType extends Type {
  static stringTypes = [
    'string',
    'uri',
    'email',
    'uuid',
    'uri',
    'hostname',
    'ipv4',
    'ipv6',
  ];

  isString = false;

  constructor(name: string) {
    super({}, name);
    this.customType = '';
    this.isString = IntrinsicType.stringTypes.includes(name);
  }

  get className(): string {
    return 'IntrinsicType';
  }

  get intrinsic(): boolean {
    return true;
  }

  get readOnly(): boolean {
    return false;
  }
}

export class RequestType extends Type {
  constructor(
    api: IApiModel,
    name: string,
    params: IParameter[],
    description = ''
  ) {
    super({ description }, name);
    params.forEach((p) => {
      const writeProp = p.asProperty();
      const typeWriter = api.mayGetWriteableType(p.type);
      if (typeWriter) writeProp.type = typeWriter;
      this.properties[p.name] = writeProp;
    });
  }
}

export class WriteType extends Type {
  constructor(api: IApiModel, type: IType) {
    const name = `${strWrite}${type.name}`;
    const roProps = WriteType.readonlyProps(type.properties);
    const description =
      `Dynamic writeable type for ${type.name}` +
      (roProps.length > 0
        ? ` removes:\n` + roProps.map((p) => p.name).join(', ')
        : '');
    super({ description }, name);
    // Cross-reference the two types
    this.types.add(type.name);
    this.customTypes.add(type.name);
    type.types.add(this.name);
    type.customTypes.add(this.name);
    const obj = type as Type;
    const writes = obj.maySetWriteable(api as ApiModel);
    writes.forEach((p) => {
      const writeProp = new Property(
        p.name,
        p.type,
        {
          description: p.description || p.type.description,
          // nullable/optional if property is nullable or property is complex type
          nullable: p.nullable || !p.type.intrinsic,
        },
        this.name, // owner name
        type.schema.required
      );
      this.properties[safeName(p.name)] = writeProp;
    });
  }

  private static readonlyProps = (properties: PropertyList): IProperty[] => {
    const result: IProperty[] = [];
    Object.entries(properties)
      .filter(([, prop]) => prop.readOnly || prop.type.readOnly)
      .forEach(([, prop]) => result.push(prop));
    return result;
  };
}

export interface IApiModel extends IModel {
  version: string;
  description: string;
  spec: OAS.OpenAPIObject;
  methods: MethodList;
  types: TypeList;
  tags: TagList;

  getRequestType(method: IMethod): IType | undefined;

  mayGetWriteableType(type: IType): IType | undefined;

  /**
   * Search this item for a regular expression pattern
   * @param {string} expression text or regex  to match
   * @param {SearchCriteria} criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(expression: string, criteria: SearchCriteria): ISearchResult;
}

export class ApiModel implements ISymbolTable, IApiModel {
  private enumTypes: TypeList = {};
  private refs: TypeList = {};
  methods: MethodList = {};
  types: TypeList = {};
  tags: TagList = {};
  typeTags: TypeTagList = {};

  constructor(public readonly spec: OAS.OpenAPIObject) {
    [
      'string',
      'integer',
      'int64',
      'boolean',
      'object',
      'uri',
      'float',
      'double',
      'void',
      'datetime',
      'email',
      'uuid',
      'uri',
      'hostname',
      'ipv4',
      'ipv6',
      'any',
    ].forEach((name) => (this.types[name] = new IntrinsicType(name)));

    this.load();
  }

  public get version(): string {
    return this.spec?.info.version || '';
  }

  public get description(): string {
    return this.spec?.info?.description?.trim() || '';
  }

  static fromString(specContent: string): ApiModel {
    const json = JSON.parse(specContent);
    return ApiModel.fromJson(json);
  }

  static fromJson(json: any): ApiModel {
    const spec = new OAS.OpenApiBuilder(json).getSpec();
    return new ApiModel(spec);
  }

  private static isMethodSearch(criteria: SearchCriteria): boolean {
    return (
      criteria.has(SearchCriterion.method) ||
      criteria.has(SearchCriterion.argument) ||
      criteria.has(SearchCriterion.response) ||
      criteria.has(SearchCriterion.status) ||
      criteria.has(SearchCriterion.activityType)
    );
  }

  private static isTypeSearch(criteria: SearchCriteria): boolean {
    return (
      criteria.has(SearchCriterion.type) ||
      criteria.has(SearchCriterion.title) ||
      criteria.has(SearchCriterion.status)
    );
  }

  private static addMethodToTags(tags: TagList, method: IMethod): TagList {
    for (const tag of method.schema.tags) {
      let list: MethodList = tags[tag];
      if (!list) {
        list = {};
        tags[tag] = list;
      }
      list[method.name] = method;
    }
    return tags;
  }

  private tagMethod(method: IMethod) {
    return ApiModel.addMethodToTags(this.tags, method);
  }

  /**
   * Search this item for a regular expression pattern
   * @param expression regular expression to match
   * @param criteria items to examine for the search
   * @returns {boolean} true if the pattern is found in the specified criteria
   */
  search(
    expression: string,
    criteria: SearchCriteria = SearchAll
  ): ISearchResult {
    const tags: TagList = {};
    const types: TypeList = {};
    let methodCount = 0;
    let typeCount = 0;
    const result = {
      ok: true,
      message: 'Search done',
      tags,
      types,
    };

    let rx: RegExp;
    try {
      rx = new RegExp(expression, 'mi'); // multi-line case insensitive, not global so first match returns
    } catch (e) {
      result.message = `Invalid search expression ${e}`;
      result.ok = false;
      return result;
    }

    if (ApiModel.isMethodSearch(criteria)) {
      Object.entries(this.methods).forEach(([, method]) => {
        if (method.search(rx, criteria)) {
          methodCount++;
          ApiModel.addMethodToTags(tags, method);
        }
      });
    }
    if (ApiModel.isTypeSearch(criteria)) {
      Object.entries(this.types).forEach(([key, type]) => {
        if (!rx) {
          throw Error(`${key} rx undefined`);
        }
        if (type.search(rx, criteria)) {
          typeCount++;
          types[key] = type;
        }
      });
    }
    result.message = `${methodCount} methods and ${typeCount} types found`;
    return result;
  }

  // TODO replace this with get from underscore?
  jsonPath(path: string | string[], item: any = this.spec, splitter = '/') {
    let keys = path;
    if (!(path instanceof Array)) {
      keys = path.split(splitter);
    }
    for (const key of keys) {
      if (key === '#') continue;
      item = item[key];
      if (item == null) return null;
    }
    return item;
  }

  private schemaHasEnums(schema: OAS.SchemaObject) {
    return lookerValuesTag in schema || enumTag in schema;
  }

  /**
   *   Retrieve an api object via its JSON path
   */
  resolveType(
    schema: string | OAS.SchemaObject | OAS.ReferenceObject,
    style?: string,
    typeName?: string,
    methodName?: string
  ): IType {
    const getRef = (schema: OAS.SchemaObject | OAS.ReferenceObject) => {
      const ref = schema.$ref;
      let result = this.refs[ref];

      if (!result) {
        /** This must be recursive */
        const parts: string[] = ref.split('/');
        const name = parts[parts.length - 1];
        const t = new Type(schema, name);
        this.refs[ref] = t;
        result = t;
      }
      return result;
    };

    if (typeof schema === 'string') {
      if (schema.indexOf('/requestBodies/') < 0)
        return this.types[schema.substr(schema.lastIndexOf('/') + 1)];
      // dereference the request strBody schema reference
      const deref = this.jsonPath(schema);
      if (deref) {
        const ref = this.jsonPath(
          ['content', 'application/json', 'schema', '$ref'],
          deref
        );
        if (ref) return this.resolveType(ref, style, typeName, methodName);
      }
    } else if (OAS.isReferenceObject(schema)) {
      return getRef(schema);
    } else if (schema.type) {
      if (schema.type === 'integer' && schema.format === 'int64') {
        return this.types.int64;
      }
      if (schema.type === 'number' && schema.format) {
        return this.types[schema.format];
      }
      if (schema.type === 'array' && schema.items) {
        const resolved = this.resolveType(schema.items);
        if (!resolved) {
          throw new Error(`Could not resolve ${JSON.stringify(schema)}`);
        }
        if (style === 'simple' || style === 'form') {
          // FKA 'csv' .. OpenAPI converter now uses "form" instead of "simple" for this
          return new DelimArrayType(resolved, schema);
        }
        if (this.schemaHasEnums(schema)) {
          const num = new EnumType(
            resolved,
            schema,
            this,
            typeName,
            methodName
          );
          this.registerEnum(num, methodName);
          const result = new ArrayType(num, schema);
          return result;
        }
        return new ArrayType(resolved, schema);
      }
      if (this.schemaHasEnums(schema)) {
        const resolved = this.resolveType(
          schema.type,
          style,
          typeName,
          methodName
        );
        const result = new EnumType(
          resolved,
          schema,
          this,
          typeName,
          methodName
        );
        if (result) {
          // If defined, it may get reassigned
          return this.registerEnum(result, methodName);
        }
        return result;
      }
      if (schema.type === 'object' && schema.additionalProperties) {
        if (schema.additionalProperties !== true) {
          return new HashType(
            this.resolveType(schema.additionalProperties),
            schema
          );
        }
      }
      if (schema.format === 'date-time') {
        return this.types.datetime;
      }
      if (schema.format && this.types[schema.format]) {
        return this.types[schema.format];
      }
      if (this.types[schema.type]) {
        return this.types[schema.type];
      }
    }
    throw new Error(
      `Schema ${
        typeof schema === 'string' ? schema : JSON.stringify(schema)
      } must have a ref or a type`
    );
  }

  private requestTypeName(method: IMethod) {
    return `${strRequest}${camelCase('_' + method.name)}`;
  }

  // add to this.types collection with name as key
  makeRequestType(method: IMethod) {
    const name = this.requestTypeName(method);
    const request = new RequestType(
      this,
      name,
      method.allParams,
      `Dynamically generated request type for ${method.name}`
    );
    this.types[name] = request;
    method.addType(this, request);
    return request;
  }

  registerEnum(type: IType, methodName?: string) {
    if (!(type instanceof EnumType)) return type;

    if (type.name in this.types) {
      const hash = md5(type.asHashString());
      const matched = this.enumTypes[hash];
      if (matched?.name === type.name) {
        /**
         * this type is the same as the other enum of the same name, although description may vary.
         * The descriptions may vary, but we prioritize type name over description for identical enum values
         */
        return this.enumTypes[hash];
      }
    }

    if (methodName) {
      const method = this.methods[methodName];
      if (method) {
        // add a type reference for the method
        method.types.add(type.name);
        method.customTypes.add(type.name);
      }
    }
    this.types[type.name] = type;
    return type;
  }

  /**
   * only gets the request type if more than one method parameter is optional
   *
   * if needed, create the request type from method parameters
   * add to this.types collection
   *
   * @param method for request type
   * @returns returns type if request type is needed, otherwise it doesn't
   */
  private _getRequestType(method: IMethod) {
    if (method.optionalParams.length <= 1) return undefined;

    let result = this.types[this.requestTypeName(method)];
    if (!result) result = this.makeRequestType(method);
    return result;
  }

  /**
   * only gets the request type if more than one method parameter is optional
   *
   * updates refCount for the method
   *
   * @param method for request type
   * @returns {IType | undefined} returns type if request type is needed, otherwise it doesn't
   */
  getRequestType(method: IMethod) {
    const result = this._getRequestType(method);
    if (result) result.refCount++;
    return result;
  }

  /**
   * Read-only accessor for private enum collection used within this source file as a "friend"
   */
  getEnumList(): TypeList {
    return this.enumTypes;
  }

  makeWriteableType(type: IType) {
    const writer = new WriteType(this, type);
    this.types[writer.name] = writer;
    return writer;
  }

  /**
   * a writeable type will need to be found or created if the passed type has read-only properties
   * and is used by any method that updates the structure
   * @param type to check for read-only properties
   * @returns either writeable type or undefined
   */
  mayGetWriteableType(type: IType) {
    if (type.intrinsic) return undefined;
    if (type.elementType?.intrinsic) return undefined;
    if (type instanceof WriteType) return type;
    if (!anyWriter(this, type)) return undefined;
    const props = Object.entries(type.properties).map(([, prop]) => prop);
    if (props.length === 0) return undefined;
    const obj = type as Type;
    const writes = obj.maySetWriteable(this);
    if (writes.length === 0) {
      // No writeable properties is an error
      const immutable =
        'WARNING: no writeable properties found for POST, PUT, or PATCH';
      if (type.description.indexOf(immutable) < 0) {
        type.description += type.description.length > 0 ? '\n' : '' + immutable;
      }
      return undefined;
    }
    if (
      writes.length === props.length &&
      JSON.stringify(writes) === JSON.stringify(props)
    )
      return undefined; // type is writeable
    const result = this.makeWriteableType(type);
    type.types.add(result.name);
    // Link the writeable type to its source type
    type.customTypes.add(result.name);
    result.parentTypes.add(type.name);
    return result;
  }

  /**
   * establishes any dynamically-generated request or writeable types
   */
  loadDynamicTypes() {
    Object.entries(this.methods).forEach(([, method]) => {
      method.makeTypes(this);
    });
  }

  /**
   * Sort a keyed collection so its keys are in sorted order
   * @param list to sort
   * @returns {KeyedCollection<T>} newly sorted list
   */
  sortList<T>(list: KeyedCollection<T>): KeyedCollection<T> {
    const result: KeyedCollection<T> = {};
    const sortedKeys = Object.keys(list).sort(localeSort);
    for (const key of sortedKeys) {
      result[key] = list[key];
    }
    return result;
  }

  sortLists() {
    this.methods = this.sortList(this.methods);
    this.types = this.sortList(this.types);
    // this.refs = this.sortList(this.refs)
    this.tags = this.sortList(this.tags);
    this.typeTags = this.sortList(this.typeTags);
    const typeKeys = Object.keys(this.typeTags);
    typeKeys.forEach((key) => {
      this.typeTags[key] = this.sortList(this.typeTags[key]);
    });
    // commented out to leave methods in natural order within the tag
    // const keys = Object.keys(this.tags).sort(localeSort)
    // keys.forEach((key) => {
    //   this.tags[key] = this.sortList(this.tags[key])
    // })
  }

  load(): void {
    if (this.spec?.components?.schemas) {
      Object.entries(this.spec.components.schemas).forEach(([name, schema]) => {
        const t = new Type(schema, name);
        // types[n] and corresponding refs[ref] MUST reference the same type instance!
        this.types[name] = t;
        this.refs[`#/components/schemas/${name}`] = t;
      });
      Object.keys(this.spec.components.schemas).forEach((name) => {
        const resolved = this.resolveType(name) as Type;
        resolved.load(this);
      });
      // Ensure all property's nested type references point to the correct full type
      const complex = Object.values(this.types)
        .filter((t) => !t.intrinsic)
        .map((t) => t);
      complex.forEach((type) => {
        const nested = Object.values(type.properties).filter(
          (p) => !p.type.intrinsic
        );
        nested.forEach((p) => {
          const ref = this.types[p.type.name];
          if (ref) {
            // Could be a collection of an intrinsic type, so only assign if
            // there is an explicit type ref
            p.type = ref;
            // Try to get a good description for the property
            p.description = p.description || p.type.description;
          }
        });
      });
    }

    if (this.spec?.paths) {
      Object.entries(this.spec.paths).forEach(([path, schema]) => {
        const methods = this.loadMethods(path, schema);
        methods.forEach((method) => {
          this.methods[method.name] = method;
        });
      });
    }
    this.loadDynamicTypes();
    this.typeTags = tagTypes(this, this.types);
    this.sortLists();
  }

  private loadMethods(endpoint: string, schema: OAS.PathItemObject): Method[] {
    const methods: Method[] = [];

    const addIfPresent = (
      httpMethod: HttpMethod,
      opSchema: OAS.OperationObject | undefined
    ) => {
      if (opSchema) {
        const responses = this.methodResponses(opSchema);
        const params = this.methodParameters(opSchema);
        const body = this.requestBody(opSchema.requestBody);
        const method = new Method(
          this,
          httpMethod,
          endpoint,
          opSchema,
          params,
          responses,
          body
        );
        methods.push(method);
        this.tagMethod(method);
      }
    };

    addIfPresent('GET', schema.get);
    addIfPresent('PUT', schema.put);
    addIfPresent('POST', schema.post);
    addIfPresent('PATCH', schema.patch);
    addIfPresent('DELETE', schema.delete);
    // options?: OperationObject;
    // head?: OperationObject;
    // trace?: OperationObject;
    return methods;
  }

  private methodResponses(schema: OAS.OperationObject): IMethodResponse[] {
    const responses: IMethodResponse[] = [];
    Object.entries(schema.responses).forEach(([statusCode, contentSchema]) => {
      const desc = contentSchema.description || '';
      if (contentSchema.content) {
        Object.entries(contentSchema.content).forEach(
          ([mediaType, response]) => {
            responses.push(
              new MethodResponse(
                parseInt(statusCode, 10),
                mediaType,
                this.resolveType(
                  (response as OAS.MediaTypeObject).schema || {}
                ),
                desc
              )
            );
          }
        );
      } else if (statusCode === '204') {
        // no content - returns void
        responses.push(
          new MethodResponse(204, '', this.types.void, desc || 'No content')
        );
      }
    });
    return responses;
  }

  private methodParameters(schema: OAS.OperationObject): IParameter[] {
    const params: IParameter[] = [];
    if (schema.parameters) {
      for (const p of schema.parameters) {
        let type: IType;
        let param: OAS.ParameterObject;
        if (OAS.isReferenceObject(p)) {
          // TODO make this work correctly for reference objects at the parameter level
          // TODO is style resolution like below required here?
          type = this.resolveType(p);
          param = {
            in: 'query',
            name: type.name,
          };
        } else {
          type = this.resolveType(p.schema || {}, p.style);
          param = p;
        }
        // Method parameters are a chicken/egg situation and ownership will be established in the Method constructor
        const mp = new Parameter(param, type);
        params.push(mp);
      }
    }
    return params;
  }

  private requestBody(
    obj: OAS.RequestBodyObject | OAS.ReferenceObject | undefined
  ) {
    if (!obj) return undefined;

    let required = true;
    if (!OAS.isReferenceObject(obj)) {
      const req = obj as OAS.RequestBodyObject;
      if ('required' in req) {
        required = req.required!;
      }
    }

    const typeSchema: OAS.SchemaObject = {
      deprecated: false,
      description: '',
      nullable: false,
      readOnly: false,
      required: required ? [strBody] : [],
      writeOnly: false,
    };

    // default the type to a plain body
    let type: IType = new Type(typeSchema, strBody);

    if (OAS.isReferenceObject(obj)) {
      // get the type directly from the ref object
      type = this.resolveType(obj.$ref);
    } else if (obj.content) {
      // determine type from content
      const content = obj.content;
      // TODO need to understand headers or links
      Object.keys(content).forEach((key) => {
        const media = content[key];
        const schema = media.schema!;
        if (OAS.isReferenceObject(schema)) {
          type = this.resolveType(schema.$ref);
        } else {
          type = this.resolveType(schema);
        }
      });
    } else {
      // TODO must be dynamic, create type
    }

    return new Parameter(
      {
        description: '',
        location: strBody,
        name: strBody,
        required: required, // TODO capture description
      } as Partial<IParameter>,
      type
    );
  }
}
