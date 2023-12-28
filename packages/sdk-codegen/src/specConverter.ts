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

import isEmpty from 'lodash/isEmpty';
import type { APIMethods } from '@looker/sdk-rtl';
import type { ArgValues, IApiModel, KeyedCollection } from './sdkModels';
import { ApiModel } from './sdkModels';

const warn = (warning: string) => {
  throw new Error(warning);
};

const appJson = 'application/json';

/** This declaration is duplicated DIRECTLY from @looker/sdk API 4.0 models to detach dependency */
export interface IApiVersion {
  /**
   * Current Looker release version number (read-only)
   */
  looker_release_version?: string;
  current_version?: IApiVersionElement;
  /**
   * Array of versions supported by this Looker instance (read-only)
   */
  supported_versions?: IApiVersionElement[];
  /**
   * API server base url (read-only)
   */
  api_server_url?: string;
  /**
   * Web server base url (read-only)
   */
  web_server_url?: string;
}

/** This declaration is duplicated DIRECTLY from @looker/sdk API 4.0 models to detach dependency */
export interface IApiVersionElement {
  /**
   * Version number as it appears in '/api/xxx/' urls (read-only)
   */
  version?: string | null;
  /**
   * Full version number including minor version (read-only)
   */
  full_version?: string | null;
  /**
   * Status of this version (read-only)
   */
  status?: string | null;
  /**
   * Url for swagger.json for this version (read-only)
   */
  swagger_url?: string | null;
}

/**
 * Describes the mime types supported by an operation
 */
export interface MimeFormats {
  /**
   * Output types produced by an operation
   */
  produces: string[];
  /**
   * Input types accepted by an operation
   */
  consumes: string[];
}

/** codegen specification item */
export interface SpecItem {
  /** Key for specification in collection. Duplicated for atomic passing */
  key: string;
  /** API version status */
  status: string; // 'current' | 'deprecated' | 'experimental' | 'stable'
  /** API version of spec */
  version: string;
  /** true if this is the default spec */
  isDefault: boolean;
  /** Compiled version of spec */
  api?: ApiModel;
  /** URL for retrieving spec */
  specURL?: string;
  /** string content of spec */
  specContent?: string;
}

/** Keyed collection of specification items */
export type SpecList = KeyedCollection<SpecItem>;

/**
 * Looker specification version item from versions payload
 */
export interface ISpecItem {
  /** Abbreviated version of the API */
  version: string;
  /** Semantic version of the API */
  full_version: string;
  /** Usually legacy, stable, experimental, current */
  status: string;
  /** Link to the swagger specification */
  swagger_url: string;
}

/**
 * Callback for fetching and compiling specification to ApiModel
 */
export type SpecFetcher = (spec: SpecItem) => Promise<ApiModel | undefined>;
export type IncludeVersion = (version: IApiVersionElement) => boolean;

/**
 * Should this specification version be included?
 * @param ver to check
 */
export const include31 = (ver: IApiVersionElement) => {
  return (
    (ver.status &&
      ver.version &&
      ver.swagger_url &&
      ver.status !== 'internal_test' &&
      ver.status !== 'deprecated' &&
      ver.status !== 'legacy') ||
    /\b3.1\b/.test(ver.version || '') // unfortunately, need to hard-code this for API Explorer's spec selector
  );
};

/**
 * Return all public API specifications from an ApiVersion payload
 * @param versions payload from a Looker server
 * @param fetcher fetches and compiles spec to ApiModel
 * @param include test for specification version inclusion
 */
export const getSpecsFromVersions = async (
  versions: IApiVersion,
  fetcher: SpecFetcher | undefined = undefined,
  include: IncludeVersion = include31
): Promise<SpecList> => {
  const items = {};

  /**
   * Create a unique spec key for this version
   * @param v version to identify
   */
  const uniqueId = (v: IApiVersionElement) => {
    let specKey = v.version || 'api';
    const max = v.status?.length || 0;
    let frag = 1;
    while (items[specKey]) {
      if (frag <= max) {
        // More than one spec for this version
        specKey = `${v.version}${v.status?.substr(0, frag)}`;
      } else {
        specKey = `${v.version}${v.status}${frag}`;
      }
      frag++;
    }
    return specKey;
  };

  if (versions.supported_versions) {
    for (const v of versions.supported_versions) {
      // Tell TypeScript these are all defined because IApiVersion definition is lax
      if (v.status && v.version && v.swagger_url) {
        if (include(v)) {
          const spec: SpecItem = {
            key: uniqueId(v),
            status: v.status,
            version: v.version,
            isDefault: v.status === 'current',
            specURL: v.swagger_url,
          };
          if (fetcher) {
            spec.api = await fetcher(spec);
          }
          items[spec.key] = spec;
        }
      }
    }
  }
  return items;
};

/**
 * Payload returned by the Looker /versions endpoint
 */
export interface ILookerVersions {
  /** This Looker version */
  looker_release_version: string;
  /** The current/default API version */
  current_version: ISpecItem;
  /** All API versions */
  supported_versions: ISpecItem[];
  /** API server url */
  api_server_url: string;
  /** Web server url */
  web_server_url: string;
}

// TODO this work was duplicated in API Explorer. Need to merge and use one version.

/**
 * Api Specification with on-demand determination of values
 */
export interface IApiSpecLink {
  /** Name of the specification */
  name: string;
  /** API version */
  version: string;
  /** API version status */
  status: string;
  /** Location of the specification */
  url: string;
  /** Parsed content. Will be loaded on demand but is assigned to an empty object by default. */
  api: IApiModel;
}

// TODO this work was duplicated in API Explorer. Need to merge and use one version.
export type SpecLinks = IApiSpecLink[];

/**
 * Defaults the mime formats for producing and consuming
 */
export const defaultMimeFormats: MimeFormats = {
  produces: [appJson],
  consumes: [appJson],
};
/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
 */
type OpenApiParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject'
  | undefined;

/**
 * Replaces x-looker-nullable with nullable for parameters and properties in a string
 * @param {string} spec
 * @returns {Promise<string>} name of the file written
 */
export const swapXLookerTags = (spec: string) => {
  const swaps = [
    { pattern: /x-looker-nullable/gi, replacement: 'nullable' },
    { pattern: /x-looker-values/gi, replacement: 'enum' },
    { pattern: /x-looker-deprecated/gi, replacement: 'deprecated' },
  ];
  swaps.forEach((swap) => {
    spec = spec.replace(swap.pattern, swap.replacement);
  });
  return spec;
};

/**
 * Convert OpenAPI 2 collectionFormat to OpenApi 3 style
 *
 * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#style-values for
 * conversion guidelines
 *
 * @param collectionFormat string
 * @returns the converted style, or undefined
 */
export const openApiStyle = (
  collectionFormat: string
): OpenApiParameterStyle => {
  if (!collectionFormat) return undefined;
  const styles: { [key: string]: OpenApiParameterStyle } = {
    csv: 'simple',
    pipes: 'pipeDelimited',
    ssv: 'spaceDelimited',
  };
  if (collectionFormat in styles) {
    return styles[collectionFormat];
  }
  return undefined;
};

/**
 * Utility function to find the named parameter for an OpenAPI endpoint
 * @param api JSON structure of OpenAPI spec
 * @param endpoint url pattern for endpoint
 * @param verb HTTP method to locate
 * @param name name of parameter to find
 * @returns the matched parameter, or undefined
 */
const findOpenApiParam = (
  api: any,
  endpoint: string,
  verb: string,
  name: string
) => {
  const result = api.paths[endpoint][verb].parameters.find(
    (p: { name: string }) => p.name === name
  );
  if (!result) {
    warn(`Missing parameter: ${endpoint} ${verb} parameter ${name}`);
  }
  return result;
};

/**
 * Results of the spec conversion
 */
export interface IConversionResults {
  /**
   * JSON.stringify of the spec
   */
  spec: string;
  /**
   * List of fixes to the spec
   */
  fixes: string[];
}

export const fixConversionObjects = (api: any, swagger: any) => {
  const paths = swagger.paths;
  const fixes: string[] = [];
  Object.entries(paths).forEach(([endpoint, op]) => {
    Object.entries(op as any).forEach(([httpMethod, method]) => {
      const operation = method as any;
      const params = operation.parameters;
      if (params) {
        Object.entries(params).forEach(([, p]) => {
          const param = p as any;
          if (param.name === 'body' && param.in === 'body') {
            // Set `required` in requestBody
            if ('required' in param) {
              //  explicitly setting required value
              const required = param.required;
              const fix = `${endpoint}::${operation.operationId} setting requestBody.required to ${required}`;
              const requestBody = api.paths[endpoint][httpMethod].requestBody;
              if (!requestBody) {
                warn(
                  `Failed to find "requestBody" in OAS for swagger "body param" fix: ${fix}`
                );
              } else {
                if (requestBody.required !== required) {
                  fixes.push(fix);
                }
                requestBody.required = required;
              }
            }
          }

          if (param.collectionFormat) {
            // Set style from collectionFormat if it's not set
            const format = param.collectionFormat;
            const style = openApiStyle(format);
            if (style === undefined) {
              warn(
                `OAS style conversion failed: collectionFormat '${param.collectionFormat}' is unknown`
              );
            } else {
              const fix = `${endpoint}::${operation.operationId} ${param.name} '${format}' -> '${style}'`;
              const newParam = findOpenApiParam(
                api,
                endpoint,
                httpMethod,
                param.name
              );
              if (newParam && newParam.style !== style) {
                newParam.style = style;
                fixes.push(fix);
              }
            }
          }
        });
      }
    });
  });

  return { fixes, spec: JSON.stringify(api) };
};

/**
 * Returns true if this spec is a swagger specification
 * @param spec to check
 */
export const isSwagger = (spec: any) => spec.swagger !== undefined;

/**
 * Returns true spec is an OpenAPI specification
 * @param spec to check
 */
export const isOpenApi = (spec: any) => spec.openapi !== undefined;

/**
 * This is a post-fix operation for the OpenAPI converter which currently misses this type of conversion
 *
 * - Converts missing swagger collectionFormat values to OpenAPI styles
 * - Flags OAS.requestBody as required or optional
 *
 * @param openApiSpec converted OpenAPI spec
 * @param swaggerSpec original swagger spec that may contain missed conversions
 * @returns modified openApiSpec and fix log in IConversionResults
 */
export const fixConversion = (
  openApiSpec: string,
  swaggerSpec: string
): IConversionResults => {
  return fixConversionObjects(JSON.parse(openApiSpec), JSON.parse(swaggerSpec));
};

/**
 * Convert a swagger structure ref to an OpenAPI structure ref
 *
 * TODO update this to the typescript that understands replaceAll
 * @param ref string reference to convert
 */
export const swapRef = (ref: string) =>
  ref.replace(/#\/definitions\//g, '#/components/schemas/');

/**
 * Get the name of the structure from the reference string
 * @param ref to partse
 */
export const structName = (ref: string) => {
  if (!ref) return undefined;
  const parts = ref.split('/');
  return parts[parts.length - 1];
};

/**
 * Moves type, format, items to schema
 * Converts collectionFormat to style
 * @param param to convert
 */
export const convertParam = (param: any) => {
  const schema: any = { type: param.type };
  const result = { ...param };
  delete result.type;
  if (param.format) {
    schema.format = param.format;
    delete result.format;
  }
  if (param.collectionFormat) {
    result.style = openApiStyle(param.collectionFormat);
    delete result.collectionFormat;
  }
  if (param.items) {
    schema.items = param.items;
    result.explode = false;
    delete result.items;
  }
  result.schema = schema;
  return result;
};

/**
 * Convert responses for the right response formats
 * @param responses response to convert
 * @param formats mime formats
 */
export const convertResponses = (
  responses: ArgValues,
  formats = defaultMimeFormats
) => {
  Object.entries(responses).forEach(([code, response]) => {
    responses[code] = {
      description: response.description,
    };
    if (response.schema) {
      const content = {};
      formats.produces.forEach(
        (format) => (content[format] = { schema: response.schema })
      );
      responses[code].content = content;
    }
  });
  return responses;
};

/**
 * Convert an operation
 * Assign schemas in params, create request bodies, update $refs
 * @param op operation to convert
 * @param formats mime format consumer and producer
 * @param moveKeys true to move keys for reference OAS comparison
 */
export const convertOp = (
  op: ArgValues,
  formats = defaultMimeFormats,
  moveKeys = false
) => {
  // If keys need to be shuffled for file comparison reasons, uncomment this function
  const moveKey = (key: string, value?: any) => {
    if (!moveKeys || !(key in op)) return value;
    if (!value) value = op[key];
    if (value) {
      delete op[key];
      op[key] = value;
    }
    return value;
  };

  let { produces, consumes } = formats;
  const body = {};
  if (op.produces) {
    produces = op.produces;
    delete op.produces;
  }
  if (op.consumes) {
    consumes = op.consumes;
    delete op.consumes;
  }
  if (op.parameters) {
    // Copy parameters before rebuilding
    const params = { ...op.parameters };
    op.parameters = [];
    Object.values(params).forEach((p: any) => {
      if (p.in === 'body') {
        // const struct = structName(p.schema?.$ref)
        op.requestBody = {};
        // if (struct) {
        //   op.requestBody.$ref = `#/components/requestBodies/${struct}`
        // }
        if (p.schema) {
          op.requestBody.content = { [consumes[0]]: { schema: p.schema } };
        }
        op.requestBody.description = p.description;
        if ('required' in p) op.requestBody.required = p.required;
        // if (struct) {
        //   body[struct] = { ...op.requestBody }
        //   body[struct].$ref = `#/components/schema/${struct}`
        // }
      } else {
        op.parameters.push(convertParam(p));
      }
    });
    if (op.parameters.length === 0) delete op.parameters;
  }
  moveKey('responses', convertResponses(op.responses, { produces, consumes }));
  moveKey('deprecated');
  const xdep = 'x-looker-deprecated';
  if (xdep in op) {
    op.deprecated = op[xdep];
    delete op[xdep];
  }
  moveKey('x-looker-status');
  moveKey('x-looker-activity-type');
  moveKey('x-looker-rate-limited');
  return { op, body };
};

/**
 * Assign schemas and request bodies
 * @param paths to process
 * @param formats mime response types
 */
export const convertPathsAndBodies = (
  paths: ArgValues,
  formats = defaultMimeFormats
) => {
  const result = { paths: {}, requestBodies: {} };
  Object.entries(paths).forEach(([path, entry]) => {
    result.paths[path] = {};
    // Hack to accommodate linting limitations
    const endpoint: ArgValues = entry;
    Object.entries(endpoint).forEach(([verb, op]) => {
      const ep = convertOp(op, formats);
      result.paths[path][verb] = ep.op;
      Object.entries(ep.body as ArgValues).forEach(([name, body]) => {
        result.requestBodies[name] = body;
      });
    });
  });
  return result;
};

/**
 * Convert structure definitions
 * @param defs to convert
 */
export const convertDefs = (defs: ArgValues): ArgValues => {
  Object.entries(defs).forEach(([_, struct]) => {
    Object.entries(struct.properties as ArgValues).forEach(([name, prop]) => {
      if (prop.$ref) {
        // Evidently OAS only wants the ref for the property type
        struct.properties[name] = { $ref: prop.$ref };
      }
    });
  });
  return defs;
};

/**
 * On-demand conversion of swagger to openAPI specification
 * @param spec to possibly convert
 * @returns OpenAPI version of the specification or throws error if not Swagger or OpenAPI
 */
export const upgradeSpecObject = (spec: any) => {
  if (isOpenApi(spec)) {
    return JSON.parse(swapXLookerTags(JSON.stringify(spec)));
  }
  if (!isSwagger(spec)) {
    throw new Error('Input is not a Swagger or OpenAPI specification');
  }
  const cleanup = swapRef(swapXLookerTags(JSON.stringify(spec)));
  spec = JSON.parse(cleanup);
  const consumes = spec.consumes || [appJson];
  const produces = spec.produces || [appJson];
  const formats = { produces, consumes };
  const { paths, requestBodies } = convertPathsAndBodies(spec.paths, formats);
  // TODO create a requestBodies entry for every struct used > 1x?
  // TODO reassign op.requestBody for all requestBodies entries?
  const schemas = convertDefs(spec.definitions);
  const api = {
    openapi: '3.0.0',
    info: spec.info,
    tags: spec.tags,
    paths,
    servers: [{ url: `${spec.schemes[0]}://${spec.host}${spec.basePath}` }],
    components: {
      requestBodies,
      schemas: schemas,
    },
  };
  // const result = fixConversionObjects(api, spec)
  return api;
};

/**
 * Upgrade a spec to OpenAPI if it's not already an OpenAPI spec
 * @param spec to upgrade
 */
export const upgradeSpec = (spec: string | Record<string, unknown>) => {
  if (typeof spec === 'string') spec = JSON.parse(spec);
  return JSON.stringify(upgradeSpecObject(spec));
};

/**
 * Fetches specs via /versions payload from the API server url
 * @param sdk APIMethods implementation that supports authenticating a request
 * @param serverUrl base url of the /versions server. Typically something like https://my.looker.com:19999 or https://my.looker.com
 */
export const getLookerSpecs = async (sdk: APIMethods, serverUrl: string) => {
  const versionUrl = `${serverUrl}/versions`;
  const versions = await sdk.ok(sdk.get<ILookerVersions, Error>(versionUrl));
  return versions;
};

// TODO this work was duplicated in API Explorer. Need to merge and use one version.
/**
 * Convert a Looker versions payload into API specification links
 * @param versions
 * @param include lambda that returns true to include a spec item in the list
 */
export const getSpecLinks = (
  versions: ILookerVersions,
  include = (spec: ISpecItem) => spec.version > '2.99'
) => {
  const prefix = `Release ${versions.looker_release_version} API `;
  const deriveSpec = (spec: ISpecItem): IApiSpecLink => {
    const status =
      spec.swagger_url === versions.current_version.swagger_url
        ? 'current'
        : spec.status;
    return {
      name: `${prefix}${spec.version}`,
      version: spec.version,
      status,
      url: spec.swagger_url,
      api: {} as IApiModel,
    };
  };
  const specs = versions.supported_versions
    .filter((v) => include(v))
    .map((v) => deriveSpec(v));
  return specs;
};

/**
 * Fetch and parse API specifications from the established links
 * @param sdk APIMethods implementation that supports authenticating a request
 * @param links list of specifications to load
 */
export const loadSpecs = async (sdk: APIMethods, links: SpecLinks) => {
  for (const spec of links) {
    if (isEmpty(spec.api)) {
      // Not parsed yet
      const content = await sdk.ok<string, Error>(sdk.get(spec.url));
      const json = typeof content === 'string' ? JSON.parse(content) : content;
      spec.api = ApiModel.fromJson(upgradeSpecObject(json));
    }
  }
  return links;
};
