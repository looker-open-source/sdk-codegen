"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var OAS = __importStar(require("openapi3-ts"));
var blueimp_md5_1 = __importDefault(require("blueimp-md5"));
// @ts-ignore
var transport_1 = require("../../../typescript/looker/rtl/transport");
exports.strBody = 'body';
exports.strRequest = 'Request';
exports.strWrite = 'Write';
// handy refs
// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schema-object
// https://swagger.io/docs/specification/data-models/data-types/
/**
 * convert kebab-case or snake_case to camelCase
 * @param value string value to convert to camelCase
 */
exports.camelCase = function (value) {
    return value.replace(/([-_][a-z])/ig, function ($1) {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};
/**
 * create a "searchable" string that can be concatenated to a larger search string
 * @param {string} value to search
 * @returns {string} value plus search delimiter
 */
var searchIt = function (value) { return value ? value + '\n' : ''; };
/**
 * Returns sorted string array for IKeylist type
 * @param {IKeyList} keys Set of values
 * @returns {string[]} sorted string array of keys
 */
exports.keyValues = function (keys) {
    return Array.from(keys.values()).sort();
};
/**
 * Resolve a list of method keys into an IMethod[] in alphabetical order by name
 * @param {IApiModel} api model to use
 * @param {IKeyList} refs references to models
 * @returns {IMethod[]} Populated method list. Anything not matched is skipped
 */
exports.methodRefs = function (api, refs) {
    var keys = exports.keyValues(refs);
    var result = [];
    keys.forEach(function (k) {
        if (k in api.methods) {
            result.push(api.methods[k]);
        }
    });
    return result;
};
/**
 * Resolve a list of method keys into an IType[] in alphabetical order by name
 * @param {IApiModel} api model to use
 * @param {IKeyList} refs references to models
 * @returns {IMethod[]} Populated method list. Anything not matched is skipped
 */
exports.typeRefs = function (api, refs) {
    var keys = exports.keyValues(refs);
    var result = [];
    keys.forEach(function (k) {
        if (k in api.types) {
            result.push(api.types[k]);
        }
    });
    return result;
};
var SearchCriterion;
(function (SearchCriterion) {
    SearchCriterion[SearchCriterion["method"] = 0] = "method";
    SearchCriterion[SearchCriterion["type"] = 1] = "type";
    SearchCriterion[SearchCriterion["name"] = 2] = "name";
    SearchCriterion[SearchCriterion["description"] = 3] = "description";
    SearchCriterion[SearchCriterion["argument"] = 4] = "argument";
    SearchCriterion[SearchCriterion["property"] = 5] = "property";
    SearchCriterion[SearchCriterion["title"] = 6] = "title";
    SearchCriterion[SearchCriterion["activityType"] = 7] = "activityType";
    SearchCriterion[SearchCriterion["status"] = 8] = "status";
    SearchCriterion[SearchCriterion["response"] = 9] = "response";
})(SearchCriterion = exports.SearchCriterion || (exports.SearchCriterion = {}));
exports.SearchAll = new Set([
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
exports.CriteriaToSet = function (criteria) {
    var result = new Set();
    criteria.forEach(function (name) { return result.add(SearchCriterion[name.toLowerCase()]); });
    return result;
};
exports.SetToCriteria = function (criteria) {
    var result = [];
    criteria.forEach(function (value) { return result.push(SearchCriterion[value]); });
    return result;
};
var MethodResponse = /** @class */ (function () {
    function MethodResponse(statusCode, mediaType, type, description) {
        this.statusCode = statusCode;
        this.mediaType = mediaType;
        this.type = type;
        this.description = description;
    }
    Object.defineProperty(MethodResponse.prototype, "mode", {
        get: function () {
            return transport_1.responseMode(this.mediaType);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    MethodResponse.prototype.search = function (rx, criteria) {
        if (!criteria.has(SearchCriterion.response))
            return false;
        return rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
    };
    MethodResponse.prototype.searchString = function (criteria) {
        var result = searchIt("" + this.statusCode) + searchIt("" + transport_1.ResponseMode[this.mode]);
        if (criteria.has(SearchCriterion.name))
            result += searchIt(this.mediaType);
        if (criteria.has(SearchCriterion.type))
            result += searchIt(this.mediaType);
        return result;
    };
    return MethodResponse;
}());
var Symbol = /** @class */ (function () {
    function Symbol(name, type) {
        this.name = name;
        this.type = type;
    }
    Symbol.prototype.asHashString = function () {
        return this.name + ":" + this.type.name;
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    Symbol.prototype.search = function (rx, criteria) {
        return rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
    };
    Symbol.prototype.searchString = function (criteria) {
        var result = '';
        if (criteria.has(SearchCriterion.name))
            result += searchIt(this.name);
        return result;
    };
    return Symbol;
}());
var SchemadSymbol = /** @class */ (function (_super) {
    __extends(SchemadSymbol, _super);
    function SchemadSymbol(name, type, schema) {
        var _this = _super.call(this, name, type) || this;
        _this.schema = schema;
        return _this;
    }
    Object.defineProperty(SchemadSymbol.prototype, "status", {
        get: function () {
            return this.schema['x-looker-status'] || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SchemadSymbol.prototype, "description", {
        get: function () {
            return this.schema.description || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SchemadSymbol.prototype, "deprecated", {
        get: function () {
            return this.schema.deprecated || this.schema['x-looker-deprecated'] || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SchemadSymbol.prototype, "deprecation", {
        get: function () {
            return this.deprecated ? 'deprecated' : '';
        },
        enumerable: true,
        configurable: true
    });
    return SchemadSymbol;
}(Symbol));
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property(name, type, schema, required) {
        if (required === void 0) { required = []; }
        var _a;
        var _this = _super.call(this, name, type, schema) || this;
        _this.required = false;
        _this.required = !!(required.includes(name) || ((_a = schema.required) === null || _a === void 0 ? void 0 : _a.includes(name)));
        return _this;
    }
    Object.defineProperty(Property.prototype, "nullable", {
        get: function () {
            // TODO determine cascading nullable options
            return this.schema.nullable || this.schema['x-looker-nullable'] || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "readOnly", {
        get: function () {
            return this.schema.readOnly || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "writeOnly", {
        get: function () {
            return this.schema.writeOnly || false;
        },
        enumerable: true,
        configurable: true
    });
    Property.prototype.asHashString = function () {
        return _super.prototype.asHashString.call(this)
            + this.nullable ? '?' : ''
            + this.readOnly ? ' ro' : ''
            + this.required ? ' req' : ''
            + this.writeOnly ? ' wo' : '';
    };
    Property.prototype.searchString = function (criteria) {
        var result = _super.prototype.searchString.call(this, criteria);
        if (criteria.has(SearchCriterion.description))
            result += searchIt(this.description);
        if (criteria.has(SearchCriterion.status))
            result += searchIt(this.status) + searchIt(this.deprecation);
        return result;
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    Property.prototype.search = function (rx, criteria) {
        return rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
    };
    return Property;
}(SchemadSymbol));
var Parameter = /** @class */ (function () {
    function Parameter(param, type) {
        this.description = '';
        this.location = 'query';
        this.required = false;
        this.name = param.name;
        this.type = type;
        this.description = param.description || '';
        if ('in' in param) {
            this.location = param.in;
        }
        else {
            this.location = param.location || exports.strBody;
        }
        // TODO deal with the required value being the names of the columns that are required
        this.required = param.required || false;
    }
    Parameter.prototype.asSchemaObject = function () {
        return {
            nullable: !(this.required),
            required: this.required ? [this.name] : undefined,
            readOnly: false,
            writeOnly: false,
            deprecated: false,
            description: this.description,
            type: this.type.name
        };
    };
    Parameter.prototype.asProperty = function () {
        return new Property(this.name, this.type, this.asSchemaObject());
    };
    Parameter.prototype.asHashString = function () {
        return this.name + ":" + this.type.name + (this.required ? '' : '?') + this.location;
    };
    Parameter.prototype.doEncode = function () {
        return this.type.name === 'string' || this.type.name === 'datetime' || this.type.name === 'date';
    };
    Parameter.prototype.searchString = function (criteria) {
        var result = '';
        if (criteria.has(SearchCriterion.name))
            result += searchIt(this.name);
        if (criteria.has(SearchCriterion.description))
            result += searchIt(this.description);
        return result;
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    Parameter.prototype.search = function (rx, criteria) {
        return rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
    };
    return Parameter;
}());
exports.Parameter = Parameter;
var Method = /** @class */ (function (_super) {
    __extends(Method, _super);
    function Method(api, httpMethod, endpoint, schema, params, responses, body) {
        var _this = this;
        if (!schema.operationId) {
            throw new Error('Missing operationId');
        }
        var primaryResponse = responses.find(function (response) {
            // prefer json response over all other 200s
            return response.statusCode === transport_1.StatusCode.OK && response.mediaType === 'application/json';
        }) || responses.find(function (response) {
            return response.statusCode === transport_1.StatusCode.OK; // accept any mediaType for 200 if none are json
        }) || responses.find(function (response) {
            return response.statusCode === transport_1.StatusCode.NoContent;
        });
        if (!primaryResponse) {
            throw new Error("Missing 2xx + application/json response in " + endpoint);
        }
        _this = _super.call(this, schema.operationId, primaryResponse.type, schema) || this;
        _this.customTypes = new Set();
        _this.types = new Set();
        _this.httpMethod = httpMethod;
        _this.endpoint = endpoint;
        _this.responses = responses;
        _this.primaryResponse = primaryResponse;
        _this.responseModes = _this.getResponseModes();
        _this.params = [];
        params.forEach(function (p) { return _this.addParam(api, p); });
        responses.forEach(function (r) { return _this.addType(api, r.type); });
        if (body) {
            _this.addParam(api, body);
        }
        _this.activityType = schema["x-looker-activity-type"];
        return _this;
    }
    /**
     * Adds the parameter and registers its type for the method
     * @param {IParameter} param
     */
    Method.prototype.addParam = function (api, param) {
        this.params.push(param);
        this.addType(api, param.type);
        return this;
    };
    /**
     * Adds the type to the method type xrefs and adds the method to the types xref
     * @param {IType} type
     */
    Method.prototype.addType = function (api, type) {
        this.types.add(type.name);
        // Add the method xref to the type
        type.methodRefs.add(this.name);
        var custom = type.customType;
        if (custom) {
            this.customTypes.add(custom);
            var customType = api.types[custom];
            customType.methodRefs.add(this.name);
        }
        return this;
    };
    /**
     * Determines which response modes (binary/string) this method supports
     * @returns {Set<string>} Either a set of 'string' or 'binary' or both
     */
    Method.prototype.getResponseModes = function () {
        var modes = new Set();
        for (var _i = 0, _a = this.responses; _i < _a.length; _i++) {
            var resp = _a[_i];
            // TODO should we use one of the mime packages like https://www.npmjs.com/package/mime-types for
            // more thorough/accurate coverage?
            var mode = resp.mode;
            if (mode !== transport_1.ResponseMode.unknown)
                modes.add(mode);
        }
        if (modes.size === 0) {
            throw new Error("Is " + this.operationId + " " + JSON.stringify(this.responses) + " binary or string?");
        }
        return modes;
    };
    Object.defineProperty(Method.prototype, "resultType", {
        get: function () {
            return this.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "operationId", {
        get: function () {
            return this.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "summary", {
        get: function () {
            return this.schema.summary || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "requiredParams", {
        // all required parameters ordered by location declaration order
        get: function () {
            return this.required('path')
                .concat(this.required(exports.strBody), this.required('query'), this.required('header'), this.required('cookie'));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "optionalParams", {
        // all required parameters ordered by location declaration order
        get: function () {
            return this.optional('path')
                .concat(this.optional(exports.strBody), this.optional('query'), this.optional('header'), this.optional('cookie'));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "allParams", {
        // all parameters ordered by required, then optional, location declaration order
        get: function () {
            return this.requiredParams.concat(this.optionalParams);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "pathParams", {
        get: function () {
            return this.getParams('path');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "bodyParams", {
        get: function () {
            return this.getParams(exports.strBody);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "queryParams", {
        get: function () {
            return this.getParams('query');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "headerParams", {
        get: function () {
            return this.getParams('header');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "cookieParams", {
        get: function () {
            return this.getParams('cookie');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "pathArgs", {
        get: function () {
            return this.argumentNames('path');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "bodyArg", {
        get: function () {
            var body = this.argumentNames(exports.strBody);
            if (body.length === 0)
                return '';
            return body[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "queryArgs", {
        get: function () {
            return this.argumentNames('query');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "headerArgs", {
        get: function () {
            return this.argumentNames('header');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "cookieArgs", {
        get: function () {
            return this.argumentNames('cookie');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Method.prototype, "errorResponses", {
        get: function () {
            // TODO use lodash or underscore?
            var result = [];
            var map = new Map();
            for (var _i = 0, _a = this.responses.filter(function (r) { return r.statusCode >= 400; }); _i < _a.length; _i++) {
                var item = _a[_i];
                if (!map.has(item.type.name)) {
                    map.set(item.type.name, true);
                    result.push(item);
                }
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Method.prototype.getParams = function (location) {
        if (location) {
            return this.params.filter(function (p) { return p.location === location; });
        }
        return this.params;
    };
    Method.prototype.responseIsBinary = function () {
        return this.responseModes.has(transport_1.ResponseMode.binary);
    };
    Method.prototype.responseIsString = function () {
        return this.responseModes.has(transport_1.ResponseMode.string);
    };
    Method.prototype.responseIsBoth = function () {
        return this.responseIsBinary() && this.responseIsString();
    };
    /**
     * order parameters in location precedence
     */
    Method.prototype.locationSorter = function (a, b) {
        var remain = 0;
        var before = -1;
        // const after = 1
        // note: "strBody" is an injected location for simplifying method declarations
        // parameters should be sorted in the following location order:
        var locations = ['path', exports.strBody, 'query', 'header', 'cookie'];
        if (a.location === b.location)
            return remain; // no need to re-order
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var location_1 = locations_1[_i];
            if (a.location === location_1) {
                return remain; // first parameter should stay first
            }
            if (b.location === location_1) {
                return before; // second parameter should move up
            }
        }
        return remain;
    };
    Method.prototype.sort = function (list) {
        var _this = this;
        if (!list)
            list = this.params;
        return list
            .sort(function (a, b) { return _this.locationSorter(a, b); });
    };
    /**
     * return the list of required parameters, optionally for a specific location
     */
    Method.prototype.required = function (location) {
        var list = this.params
            .filter(function (i) { return i.required; });
        if (location) {
            list = list.filter(function (i) { return i.location === location; });
        }
        return list;
    };
    // return the list of optional parameters, optionally for a specific location
    Method.prototype.optional = function (location) {
        var list = this.params
            .filter(function (i) { return !i.required; });
        if (location) {
            list = list.filter(function (i) { return i.location === location; });
        }
        return list;
    };
    Method.prototype.hasOptionalParams = function () {
        return this.optional().length > 0;
    };
    Method.prototype.argumentNames = function (location) {
        return this
            .getParams(location)
            .map(function (p) { return p.name; });
    };
    Method.prototype.isMethodSearch = function (criteria) {
        return criteria.has(SearchCriterion.method)
            || criteria.has(SearchCriterion.status)
            || criteria.has(SearchCriterion.activityType);
    };
    Method.prototype.searchString = function (criteria) {
        // Are we only searching for contained items of the method or not?
        if (!this.isMethodSearch(criteria))
            return '';
        var result = _super.prototype.searchString.call(this, criteria);
        if (criteria.has(SearchCriterion.method) && criteria.has(SearchCriterion.description)) {
            result += searchIt(this.description);
        }
        if (criteria.has(SearchCriterion.activityType))
            result += searchIt(this.activityType);
        if (criteria.has(SearchCriterion.status)) {
            result += searchIt(this.status) + searchIt(this.deprecation);
        }
        return result;
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    Method.prototype.search = function (rx, criteria) {
        var result = rx.test(this.searchString(criteria)) || this.type.search(rx, criteria);
        if (!result && criteria.has(SearchCriterion.argument)) {
            for (var _i = 0, _a = this.params; _i < _a.length; _i++) {
                var a = _a[_i];
                if (a.search(rx, criteria)) {
                    result = true;
                    break;
                }
            }
        }
        if (!result && criteria.has(SearchCriterion.response)) {
            for (var _b = 0, _c = this.responses; _b < _c.length; _b++) {
                var r = _c[_b];
                if (r.search(rx, criteria)) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    };
    return Method;
}(SchemadSymbol));
exports.Method = Method;
var Type = /** @class */ (function () {
    function Type(schema, name) {
        this.properties = {};
        this.methodRefs = new Set();
        this.types = new Set();
        this.customTypes = new Set();
        this.refCount = 0;
        this.schema = schema;
        this.name = name;
        this.customType = name;
    }
    Object.defineProperty(Type.prototype, "writeable", {
        get: function () {
            var result = [];
            Object.entries(this.properties)
                .filter(function (_a) {
                var _ = _a[0], prop = _a[1];
                return !(prop.readOnly || prop.type.readOnly);
            })
                .forEach(function (_a) {
                var _ = _a[0], prop = _a[1];
                return result.push(prop);
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "status", {
        get: function () {
            return this.schema['x-looker-status'] || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "deprecated", {
        get: function () {
            return this.schema.deprecated || this.schema['x-looker-deprecated'] || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "description", {
        get: function () {
            return this.schema.description || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "title", {
        get: function () {
            return this.schema.title || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "default", {
        get: function () {
            return this.schema.default || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "readOnly", {
        get: function () {
            return Object.entries(this.properties).every(function (_a) {
                var _ = _a[0], prop = _a[1];
                return prop.readOnly;
            });
        },
        enumerable: true,
        configurable: true
    });
    Type.prototype.load = function (symbols) {
        var _this = this;
        Object.entries(this.schema.properties || {}).forEach(function (_a) {
            var propName = _a[0], propSchema = _a[1];
            var propType = symbols.resolveType(propSchema);
            _this.types.add(propType.name);
            var customType = propType.customType;
            if (customType)
                _this.customTypes.add(customType);
            _this.properties[propName] = new Property(propName, propType, propSchema, _this.schema.required);
        });
    };
    Type.prototype.asHashString = function () {
        var result = this.name + ":";
        Object.entries(this.properties)
            // put properties in alphabetical order first
            .sort(function (_a, _b) {
            var a = _a[0], _ = _a[1];
            var b = _b[0], __ = _b[1];
            return a.localeCompare(b);
        })
            .forEach(function (_a) {
            var _ = _a[0], prop = _a[1];
            result += prop.asHashString() + ':';
        });
        return result;
    };
    /**
     * Is this type directly recursive?
     * @returns {boolean} Does this type contain references to itself as a top-level property?
     */
    Type.prototype.isRecursive = function () {
        var selfType = this.name;
        // test for directly recursive type references
        return Object.entries(this.properties)
            .some(function (_a) {
            var _ = _a[0], prop = _a[1];
            return prop.type.name === selfType;
        });
    };
    Type.isPropSearch = function (criteria) {
        return criteria.has(SearchCriterion.status)
            || criteria.has(SearchCriterion.property);
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    Type.prototype.search = function (rx, criteria) {
        if (!criteria.has(SearchCriterion.type) && !criteria.has(SearchCriterion.status))
            return false;
        var result = rx.test(this.searchString(criteria));
        if (!result && Type.isPropSearch(criteria)) {
            for (var _i = 0, _a = Object.entries(this.properties); _i < _a.length; _i++) {
                var _b = _a[_i], p = _b[1];
                if (p.search(rx, criteria)) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    };
    Type.prototype.searchString = function (criteria) {
        var result = '';
        if (criteria.has(SearchCriterion.name))
            result += searchIt(this.name);
        if (criteria.has(SearchCriterion.description))
            result += searchIt(this.description);
        if (criteria.has(SearchCriterion.title))
            result += searchIt(this.title);
        if (criteria.has(SearchCriterion.status)) {
            result += searchIt(this.status);
            if (this.deprecated)
                result += searchIt('deprecated');
        }
        return result;
    };
    return Type;
}());
exports.Type = Type;
var ArrayType = /** @class */ (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(elementType, schema) {
        var _this = _super.call(this, schema, elementType.name + "[]") || this;
        _this.elementType = elementType;
        _this.customType = elementType.customType;
        return _this;
    }
    Object.defineProperty(ArrayType.prototype, "readOnly", {
        get: function () {
            return this.elementType.readOnly;
        },
        enumerable: true,
        configurable: true
    });
    return ArrayType;
}(Type));
exports.ArrayType = ArrayType;
var DelimArrayType = /** @class */ (function (_super) {
    __extends(DelimArrayType, _super);
    function DelimArrayType(elementType, schema) {
        var _this = _super.call(this, schema, "DelimArray<" + elementType.name + ">") || this;
        _this.elementType = elementType;
        _this.elementType = elementType;
        _this.customType = elementType.customType;
        return _this;
    }
    Object.defineProperty(DelimArrayType.prototype, "readOnly", {
        get: function () {
            return this.elementType.readOnly;
        },
        enumerable: true,
        configurable: true
    });
    return DelimArrayType;
}(Type));
exports.DelimArrayType = DelimArrayType;
var HashType = /** @class */ (function (_super) {
    __extends(HashType, _super);
    function HashType(elementType, schema) {
        var _this = _super.call(this, schema, "Hash[" + elementType.name) || this;
        _this.elementType = elementType;
        _this.customType = elementType.customType;
        return _this;
    }
    Object.defineProperty(HashType.prototype, "readOnly", {
        get: function () {
            return this.elementType.readOnly;
        },
        enumerable: true,
        configurable: true
    });
    return HashType;
}(Type));
exports.HashType = HashType;
var IntrinsicType = /** @class */ (function (_super) {
    __extends(IntrinsicType, _super);
    function IntrinsicType(name) {
        var _this = _super.call(this, {}, name) || this;
        _this.customType = '';
        return _this;
    }
    Object.defineProperty(IntrinsicType.prototype, "readOnly", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return IntrinsicType;
}(Type));
exports.IntrinsicType = IntrinsicType;
var RequestType = /** @class */ (function (_super) {
    __extends(RequestType, _super);
    function RequestType(api, name, params, description) {
        if (description === void 0) { description = ''; }
        var _this = _super.call(this, { description: description }, name) || this;
        // params.forEach(p => this.properties[p.name] = p.asProperty())
        params.forEach(function (p) {
            var writeProp = p.asProperty();
            var typeWriter = api.getWriteableType(p.type);
            if (typeWriter)
                writeProp.type = typeWriter;
            _this.properties[p.name] = writeProp;
        });
        return _this;
    }
    return RequestType;
}(Type));
exports.RequestType = RequestType;
var WriteType = /** @class */ (function (_super) {
    __extends(WriteType, _super);
    function WriteType(api, type) {
        var _this = this;
        var name = "" + exports.strWrite + type.name;
        var description = "Dynamically generated writeable type for " + type.name;
        _this = _super.call(this, { description: description }, name) || this;
        type.writeable
            .filter(function (p) { return (!p.readOnly) && (!p.type.readOnly); })
            .forEach(function (p) {
            var writeProp = new Property(p.name, p.type, {
                description: p.description,
                // nullable/optional if property is nullable or property is complex type
                nullable: p.nullable || !(p.type instanceof IntrinsicType)
            }, type.schema.required);
            var typeWriter = api.getWriteableType(p.type);
            if (typeWriter)
                writeProp.type = typeWriter;
            _this.properties[p.name] = writeProp;
        });
        return _this;
    }
    return WriteType;
}(Type));
exports.WriteType = WriteType;
var ApiModel = /** @class */ (function () {
    function ApiModel(spec) {
        var _this = this;
        this.methods = {};
        this.types = {};
        this.requestTypes = {};
        this.tags = {};
        this.refs = {};
        ['string', 'integer', 'int64', 'boolean', 'object',
            'uri', 'float', 'double', 'void', 'datetime', 'email',
            'uuid', 'uri', 'hostname', 'ipv4', 'ipv6',
        ].forEach(function (name) { return _this.types[name] = new IntrinsicType(name); });
        this.schema = spec;
        this.load();
    }
    Object.defineProperty(ApiModel.prototype, "version", {
        get: function () {
            var _a;
            return ((_a = this.schema) === null || _a === void 0 ? void 0 : _a.info.version) || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApiModel.prototype, "description", {
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.schema) === null || _a === void 0 ? void 0 : _a.decription) === null || _b === void 0 ? void 0 : _b.trim()) || '';
        },
        enumerable: true,
        configurable: true
    });
    ApiModel.fromString = function (specContent) {
        var json = JSON.parse(specContent);
        return this.fromJson(json);
    };
    ApiModel.fromJson = function (json) {
        var spec = new OAS.OpenApiBuilder(json).getSpec();
        return new ApiModel(spec);
    };
    ApiModel.isModelSearch = function (criteria) {
        return criteria.has(SearchCriterion.method)
            || criteria.has(SearchCriterion.argument)
            || criteria.has(SearchCriterion.response)
            || criteria.has(SearchCriterion.status)
            || criteria.has(SearchCriterion.activityType);
    };
    ApiModel.isTypeSearch = function (criteria) {
        return criteria.has(SearchCriterion.type)
            || criteria.has(SearchCriterion.title)
            || criteria.has(SearchCriterion.status);
    };
    ApiModel.addMethodToTags = function (tags, method) {
        for (var _i = 0, _a = method.schema.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            var list = tags[tag];
            if (!list) {
                list = {};
                list[method.name] = method;
                tags[tag] = list;
            }
            else {
                list[method.name] = method;
            }
        }
        return tags;
    };
    ApiModel.prototype.tagMethod = function (method) {
        return ApiModel.addMethodToTags(this.tags, method);
    };
    /**
     * Search this item for a regular expression pattern
     * @param {RegExp} rx regular expression to match
     * @param {SearchCriteria} criteria items to examine for the search
     * @returns {boolean} true if the pattern is found in the specified criteria
     */
    ApiModel.prototype.search = function (expression, criteria) {
        if (criteria === void 0) { criteria = exports.SearchAll; }
        var tags = {};
        var types = {};
        var result = {
            tags: tags,
            types: types,
            message: 'Search done'
        };
        var rx;
        try {
            rx = new RegExp(expression, "mi"); // multi-line case insensitive, not global so first match returns
        }
        catch (e) {
            result.message = "Error: Invalid search expression " + e;
            return result;
        }
        if (ApiModel.isModelSearch(criteria)) {
            Object.entries(this.methods).forEach(function (_a) {
                var method = _a[1];
                if (method.search(rx, criteria)) {
                    ApiModel.addMethodToTags(tags, method);
                }
            });
        }
        if (ApiModel.isTypeSearch(criteria)) {
            Object.entries(this.types).forEach(function (_a) {
                var key = _a[0], type = _a[1];
                if (type.search(rx, criteria)) {
                    types[key] = type;
                }
            });
        }
        return result;
    };
    // TODO replace this with get from underscore?
    ApiModel.prototype.jsonPath = function (path, item, splitter) {
        if (item === void 0) { item = this.schema; }
        if (splitter === void 0) { splitter = '/'; }
        var keys = path;
        if (!(path instanceof Array)) {
            keys = path.split(splitter);
        }
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (key === '#')
                continue;
            item = item[key];
            if (item == null)
                return null;
        }
        return item;
    };
    /**
     *   Retrieve an api object via its JSON path
     */
    ApiModel.prototype.resolveType = function (schema, style) {
        if (typeof schema === 'string') {
            if (schema.indexOf('/requestBodies/') < 0)
                return this.types[schema.substr(schema.lastIndexOf('/') + 1)];
            // dereference the request strBody schema reference
            var deref = this.jsonPath(schema);
            if (deref) {
                var ref = this.jsonPath(['content', 'application/json', 'schema', '$ref'], deref);
                if (ref)
                    return this.resolveType(ref);
            }
        }
        else if (OAS.isReferenceObject(schema)) {
            return this.refs[schema.$ref];
        }
        else if (schema.type) {
            if (schema.type === 'integer' && schema.format === 'int64') {
                return this.types['int64'];
            }
            if (schema.type === 'number' && schema.format) {
                return this.types[schema.format];
            }
            if (schema.type === 'array' && schema.items) {
                if (style === 'simple') {
                    // FKA 'csv'
                    return new DelimArrayType(this.resolveType(schema.items), schema);
                }
                return new ArrayType(this.resolveType(schema.items), schema);
            }
            if (schema.type === 'object' && schema.additionalProperties) {
                if (schema.additionalProperties !== true) {
                    return new HashType(this.resolveType(schema.additionalProperties), schema);
                }
            }
            if (schema.format === 'date-time') {
                return this.types['datetime'];
            }
            if (schema.format && this.types[schema.format]) {
                return this.types[schema.format];
            }
            if (this.types[schema.type]) {
                return this.types[schema.type];
            }
        }
        throw new Error('Schema must have a ref or a type');
    };
    // add to this.requestTypes collection with hash as key
    ApiModel.prototype.makeRequestType = function (hash, method) {
        var name = "" + exports.strRequest + exports.camelCase('_' + method.name);
        var request = new RequestType(this, name, method.allParams, "Dynamically generated request type for " + method.name);
        this.types[name] = request;
        this.requestTypes[hash] = request;
        return request;
    };
    // create request type from method parameters
    // add to this.types collection with name as key
    // only gets the request type if more than one method parameter is optional
    ApiModel.prototype.getRequestType = function (method) {
        if (method.optionalParams.length <= 1)
            return undefined;
        // matches method params hash against current request types
        var paramHash = '';
        method.allParams.forEach(function (p) { return paramHash += p.asHashString(); });
        var hash = blueimp_md5_1.default(paramHash);
        // if no match, creates the request type and increments its refCount for inclusion
        // in generated imports
        var result = this.requestTypes[hash];
        if (!result)
            result = this.makeRequestType(hash, method);
        if (result)
            result.refCount++;
        return result;
    };
    ApiModel.prototype.makeWriteableType = function (hash, type) {
        var writer = new WriteType(this, type);
        this.types[writer.name] = writer;
        this.requestTypes[hash] = writer;
        return writer;
    };
    // a writeable type will need to be found or created
    ApiModel.prototype.getWriteableType = function (type) {
        var props = Object.entries(type.properties).map(function (_a) {
            var _ = _a[0], prop = _a[1];
            return prop;
        });
        var writes = type.writeable;
        // do we have any readOnly properties?
        if (writes.length === 0 || writes.length === props.length)
            return undefined;
        var hash = blueimp_md5_1.default(type.asHashString());
        var result = this.requestTypes[hash];
        if (!result)
            result = this.makeWriteableType(hash, type);
        return result;
    };
    // if any properties of the parameter type are readOnly (including in subtypes)
    ApiModel.prototype.sortedTypes = function () {
        return Object.values(this.types)
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
    };
    ApiModel.prototype.sortedMethods = function () {
        return Object.values(this.methods)
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
    };
    ApiModel.prototype.load = function () {
        var _this = this;
        var _a, _b, _c;
        if ((_b = (_a = this.schema) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.schemas) {
            Object.entries(this.schema.components.schemas).forEach(function (_a) {
                var name = _a[0], schema = _a[1];
                var t = new Type(schema, name);
                // types[n] and corresponding refs[ref] MUST reference the same type instance!
                _this.types[name] = t;
                _this.refs["#/components/schemas/" + name] = t;
            });
            Object.keys(this.schema.components.schemas).forEach(function (name) {
                _this.resolveType(name).load(_this);
            });
        }
        if ((_c = this.schema) === null || _c === void 0 ? void 0 : _c.paths) {
            Object.entries(this.schema.paths).forEach(function (_a) {
                var path = _a[0], schema = _a[1];
                var methods = _this.loadMethods(path, schema);
                methods.forEach(function (method) {
                    _this.methods[method.name] = method;
                });
            });
        }
    };
    ApiModel.prototype.loadMethods = function (endpoint, schema) {
        var _this = this;
        var methods = [];
        var addIfPresent = function (httpMethod, opSchema) {
            if (opSchema) {
                var responses = _this.methodResponses(opSchema);
                var params = _this.methodParameters(opSchema);
                var body = _this.requestBody(opSchema.requestBody);
                var method = new Method(_this, httpMethod, endpoint, opSchema, params, responses, body);
                methods.push(method);
                _this.tagMethod(method);
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
    };
    ApiModel.prototype.methodResponses = function (schema) {
        var _this = this;
        var responses = [];
        Object.entries(schema.responses).forEach(function (_a) {
            var statusCode = _a[0], contentSchema = _a[1];
            var desc = contentSchema.description || '';
            if (contentSchema.content) {
                Object.entries(contentSchema.content).forEach(function (_a) {
                    var mediaType = _a[0], response = _a[1];
                    responses.push(new MethodResponse(parseInt(statusCode, 10), mediaType, _this.resolveType(response.schema || {}), desc));
                });
            }
            else if (statusCode === '204') {
                // no content - returns void
                responses.push(new MethodResponse(204, '', _this.types['void'], desc || 'No content'));
            }
        });
        return responses;
    };
    ApiModel.prototype.methodParameters = function (schema) {
        var params = [];
        if (schema.parameters) {
            for (var _i = 0, _a = schema.parameters; _i < _a.length; _i++) {
                var p = _a[_i];
                var type = void 0;
                var param = void 0;
                if (OAS.isReferenceObject(p)) {
                    // TODO make this work correctly for reference objects at the parameter level
                    // TODO is style resolution like below required here?
                    type = this.resolveType(p);
                    param = {
                        name: type.name,
                        in: 'query',
                    };
                }
                else {
                    type = this.resolveType(p.schema || {}, p.style);
                    param = p;
                }
                var mp = new Parameter(param, type);
                params.push(mp);
            }
        }
        return params;
    };
    ApiModel.prototype.requestBody = function (obj) {
        var _this = this;
        if (!obj)
            return undefined;
        var required = true;
        if (!OAS.isReferenceObject(obj)) {
            var req = obj;
            if ('required' in req) {
                required = req.required;
            }
        }
        var typeSchema = {
            nullable: false,
            required: required ? [exports.strBody] : [],
            readOnly: false,
            writeOnly: false,
            deprecated: false,
            description: ''
        };
        // default the type to a plain body
        var type = new Type(typeSchema, exports.strBody);
        if (OAS.isReferenceObject(obj)) {
            // get the type directly from the ref object
            type = this.resolveType(obj.$ref);
        }
        else if (obj.content) {
            // determine type from content
            var content_1 = obj.content;
            // TODO need to understand headers or links
            Object.keys(content_1).forEach(function (key) {
                var media = content_1[key];
                var schema = media.schema;
                if (OAS.isReferenceObject(schema)) {
                    type = _this.resolveType(schema.$ref);
                }
                else {
                    type = _this.resolveType(schema);
                }
            });
        }
        else {
            // TODO must be dynamic, create type
        }
        var result = new Parameter({
            name: exports.strBody,
            location: exports.strBody,
            required: required,
            description: '',
        }, type);
        return result;
    };
    return ApiModel;
}());
exports.ApiModel = ApiModel;
