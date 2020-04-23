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
Object.defineProperty(exports, "__esModule", { value: true });
var sdkModels_1 = require("./sdkModels");
var codeGen_1 = require("./codeGen");
var utils_1 = require("./utils");
/**
 * TypeScript code generator
 */
var TypescriptGen = /** @class */ (function (_super) {
    __extends(TypescriptGen, _super);
    function TypescriptGen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.codePath = './typescript/';
        _this.packagePath = 'looker';
        _this.itself = 'this';
        _this.fileExtension = '.ts';
        _this.commentStr = '// ';
        _this.nullStr = 'null';
        _this.transport = 'transport';
        _this.argDelimiter = ', ';
        _this.paramDelimiter = ',\n';
        _this.propDelimiter = '\n';
        _this.indentStr = '  ';
        _this.endTypeStr = '\n}';
        _this.needsRequestTypes = true;
        _this.willItStream = true;
        return _this;
    }
    // @ts-ignore
    TypescriptGen.prototype.methodsPrologue = function (indent) {
        // TODO get the rtl path alias to work correctly in all scenarios! !!
        return "\n// " + this.warnEditing() + "\nimport { APIMethods } from '../../rtl/apiMethods'\nimport { IAuthSession } from '../../rtl/authSession'\nimport { ITransportSettings, encodeParam } from '../../rtl/transport'\n/**\n * DelimArray is primarily used as a self-documenting format for csv-formatted array parameters\n */\nimport { DelimArray } from '../../rtl/delimArray'\nimport { " + this.packageName + "Stream } from './streams'\nimport { IDictionary, " + this.typeNames().join(', ') + " } from './models'\n\nexport class " + this.packageName + " extends APIMethods {\n\n  public stream: " + this.packageName + "Stream\n  \n  constructor(authSession: IAuthSession) {\n    super(authSession, '" + this.apiVersion + "')\n    this.stream = new " + this.packageName + "Stream(authSession)  \n  }\n  \n";
    };
    // @ts-ignore
    TypescriptGen.prototype.streamsPrologue = function (indent) {
        return "\n// " + this.warnEditing() + "\nimport { Readable } from 'readable-stream'\nimport { APIMethods } from '../../rtl/apiMethods'\nimport { IAuthSession } from '../../rtl/authSession'\nimport { ITransportSettings, encodeParam } from '../../rtl/transport'\n/**\n * DelimArray is primarily used as a self-documenting format for csv-formatted array parameters\n */\nimport { DelimArray } from '../../rtl/delimArray'\nimport { IDictionary, " + this.typeNames(false).join(', ') + " } from './models'\n\nexport class " + this.packageName + "Stream extends APIMethods {\n  constructor(authSession: IAuthSession) {\n    super(authSession, '" + this.apiVersion + "')\n  }\n";
    };
    // @ts-ignore
    TypescriptGen.prototype.methodsEpilogue = function (indent) {
        return '\n}';
    };
    // @ts-ignore
    TypescriptGen.prototype.modelsPrologue = function (indent) {
        return "\n// " + this.warnEditing() + "\n\nimport { Url } from '../../rtl/constants'\nimport { DelimArray } from '../../rtl/delimArray'\n\nexport interface IDictionary<T> {\n  [key: string]: T\n}\n\n";
    };
    // @ts-ignore
    TypescriptGen.prototype.modelsEpilogue = function (indent) {
        return '';
    };
    TypescriptGen.prototype.commentHeader = function (indent, text) {
        return text ? indent + "/**\n" + utils_1.commentBlock(text, indent, ' * ') + "\n" + indent + " */\n" : '';
    };
    TypescriptGen.prototype.declareProperty = function (indent, property) {
        var optional = !property.required ? '?' : '';
        if (property.name === sdkModels_1.strBody) {
            // TODO refactor this hack to track context when the body parameter is created for the request type
            property.type.refCount++;
            // No longer using Partial<T> because required and optional are supposed to be accurate
            return this.commentHeader(indent, property.description || 'body parameter for dynamically created request type')
                + ("" + indent + property.name + optional + ": I" + property.type.name);
        }
        var type = this.typeMap(property.type);
        return this.commentHeader(indent, this.describeProperty(property))
            + ("" + indent + property.name + optional + ": " + type.name);
    };
    TypescriptGen.prototype.paramComment = function (param, mapped) {
        return "@param {" + mapped.name + "} " + param.name + " " + param.description;
    };
    TypescriptGen.prototype.declareParameter = function (indent, param) {
        var type = (param.location === sdkModels_1.strBody)
            ? this.writeableType(param.type) || param.type
            : param.type;
        var mapped = this.typeMap(type);
        var pOpt = '';
        if (param.location === sdkModels_1.strBody) {
            mapped.name = "Partial<" + mapped.name + ">";
        }
        if (!param.required) {
            pOpt = mapped.default ? '' : '?';
        }
        return this.commentHeader(indent, this.paramComment(param, mapped))
            + ("" + indent + param.name + pOpt + ": " + mapped.name)
            + (param.required ? '' : (mapped.default ? " = " + mapped.default : ''));
    };
    // @ts-ignore
    TypescriptGen.prototype.initArg = function (indent, property) {
        return '';
    };
    // @ts-ignore
    TypescriptGen.prototype.construct = function (indent, type) {
        return '';
    };
    TypescriptGen.prototype.methodHeaderDeclaration = function (indent, method, streamer) {
        var _this = this;
        if (streamer === void 0) { streamer = false; }
        var _a;
        var type = this.typeMap(method.type);
        var head = (_a = method.description) === null || _a === void 0 ? void 0 : _a.trim();
        var headComment = (head ? head + "\n\n" : '')
            + (method.httpMethod + " " + method.endpoint + " -> " + type.name);
        var fragment = '';
        var requestType = this.requestTypeName(method);
        var bump = indent + this.indentStr;
        if (requestType) {
            // use the request type that will be generated in models.ts
            // No longer using Partial<T> by default here because required and optional are supposed to be accurate
            // However, for update methods (iow, patch) Partial<T> is still necessary since only the delta gets set
            fragment = method.httpMethod === 'PATCH' ? "request: Partial<I" + requestType + ">" : "request: I" + requestType;
        }
        else {
            var params_1 = [];
            var args = method.allParams; // get the params in signature order
            if (args && args.length > 0)
                args.forEach(function (p) { return params_1.push(_this.declareParameter(bump, p)); });
            fragment = params_1.length > 0 ? "\n" + params_1.join(this.paramDelimiter) : '';
        }
        if (method.responseIsBoth()) {
            headComment += "\n\n**Note**: Binary content may be returned by this method.";
        }
        else if (method.responseIsBinary()) {
            headComment += "\n\n**Note**: Binary content is returned by this method.\n";
        }
        var callback = "callback: (readable: Readable) => Promise<" + type.name + ">,";
        var header = this.commentHeader(indent, headComment)
            + (indent + "async " + method.name + "(")
            + (streamer ? "\n" + bump + callback : '');
        return header + fragment
            + ((fragment ? ',' : '') + "\n" + bump + "options?: Partial<ITransportSettings>) {\n");
    };
    TypescriptGen.prototype.methodSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, false);
    };
    TypescriptGen.prototype.encodePathParams = function (indent, method) {
        var bump = indent + this.indentStr;
        var encodings = '';
        if (method.pathParams.length > 0) {
            for (var _i = 0, _a = method.pathParams; _i < _a.length; _i++) {
                var param = _a[_i];
                if (param.doEncode()) {
                    var name_1 = this.useRequest(method) ? "request." + param.name : param.name;
                    encodings += "" + bump + name_1 + " = encodeParam(" + name_1 + ")\n";
                }
            }
        }
        return encodings;
    };
    TypescriptGen.prototype.declareMethod = function (indent, method) {
        var bump = this.bumper(indent);
        return this.methodSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.httpCall(bump, method)
            + ("\n" + indent + "}");
    };
    TypescriptGen.prototype.streamerSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, true);
    };
    TypescriptGen.prototype.declareStreamer = function (indent, method) {
        var bump = this.bumper(indent);
        return this.streamerSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.streamCall(bump, method)
            + ("\n" + indent + "}");
    };
    TypescriptGen.prototype.typeSignature = function (indent, type) {
        return this.commentHeader(indent, type.description) +
            (indent + "export interface I" + type.name + "{\n");
    };
    // @ts-ignore
    TypescriptGen.prototype.errorResponses = function (indent, method) {
        var results = method.errorResponses
            .map(function (r) { return "I" + r.type.name; });
        return results.join(' | ');
    };
    TypescriptGen.prototype.httpPath = function (path, prefix) {
        prefix = prefix || '';
        if (path.indexOf('{') >= 0)
            return "`" + path.replace(/{/gi, '${' + prefix) + "`";
        return "'" + path + "'";
    };
    // @ts-ignore
    TypescriptGen.prototype.argGroup = function (indent, args, prefix) {
        if ((!args) || args.length === 0)
            return this.nullStr;
        var hash = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (prefix) {
                hash.push(arg + ": " + prefix + arg);
            }
            else {
                hash.push(arg);
            }
        }
        return "\n" + indent + "{" + hash.join(this.argDelimiter) + "}";
    };
    // @ts-ignore
    TypescriptGen.prototype.argList = function (indent, args, prefix) {
        prefix = prefix || '';
        return args && args.length !== 0
            ? "\n" + indent + prefix + args.join(this.argDelimiter + prefix)
            : this.nullStr;
    };
    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    TypescriptGen.prototype.argFill = function (current, args) {
        if ((!current) && args.trim() === this.nullStr) {
            // Don't append trailing optional arguments if none have been set yet
            return '';
        }
        return "" + args + (current ? this.argDelimiter : '') + current;
    };
    // build the http argument list from back to front, so trailing undefined arguments
    // can be omitted. Path arguments are resolved as part of the path parameter to general
    // purpose API method call
    // e.g.
    //   {queryArgs...}, bodyArg, {headerArgs...}, {cookieArgs...}
    //   {queryArgs...}, null, null, {cookieArgs...}
    //   null, bodyArg
    //   {queryArgs...}
    TypescriptGen.prototype.httpArgs = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        // add options at the end of the request calls. this will cause all other arguments to be
        // filled in but there's no way to avoid this for passing in the last optional parameter.
        // Fortunately, this code bloat is minimal and also hidden from the consumer.
        var result = this.argFill('', 'options');
        // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
        // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
        result = this.argFill(result, method.bodyArg ? "" + request + method.bodyArg : this.nullStr);
        result = this.argFill(result, this.argGroup(indent, method.queryArgs, request));
        return result;
    };
    TypescriptGen.prototype.httpCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        var type = this.typeMap(method.type);
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        var errors = this.errorResponses(indent, method);
        return indent + "return " + this.it(method.httpMethod.toLowerCase()) + "<" + type.name + ", " + errors + ">(" + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")";
    };
    TypescriptGen.prototype.streamCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        var type = this.typeMap(method.type);
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        // const errors = this.errorResponses(indent, method)
        return indent + "return " + this.it('authStream') + "<" + type.name + ">(callback, '" + method.httpMethod.toUpperCase() + "', " + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")";
    };
    TypescriptGen.prototype.summary = function (indent, text) {
        return this.commentHeader(indent, text);
    };
    TypescriptGen.prototype.typeNames = function (countError) {
        if (countError === void 0) { countError = true; }
        var names = [];
        if (!this.api)
            return names;
        if (countError) {
            this.api.types['Error'].refCount++;
        }
        else {
            this.api.types['Error'].refCount = 0;
        }
        var types = this.api.sortedTypes();
        Object.values(types)
            .filter(function (type) { return (type.refCount > 0) && !(type instanceof sdkModels_1.IntrinsicType); })
            .forEach(function (type) { return names.push("I" + type.name); });
        // TODO import default constants if necessary
        // Object.values(types)
        //   .filter(type => type instanceof RequestType)
        //   .forEach(type => names.push(`${strDefault}${type.name.substring(strRequest.length)}`))
        return names;
    };
    TypescriptGen.prototype.typeMap = function (type) {
        _super.prototype.typeMap.call(this, type);
        var mt = '';
        var tsTypes = {
            'number': { name: 'number', default: mt },
            'float': { name: 'number', default: mt },
            'double': { name: 'number', default: mt },
            'integer': { name: 'number', default: mt },
            'int32': { name: 'number', default: mt },
            'int64': { name: 'number', default: mt },
            'string': { name: 'string', default: mt },
            'password': { name: 'Password', default: mt },
            // TODO can we use blob for binary somehow? https://developer.mozilla.org/en-US/docs/Web/API/Blob
            'byte': { name: 'binary', default: mt },
            'boolean': { name: 'boolean', default: mt },
            'uri': { name: 'Url', default: mt },
            'url': { name: 'Url', default: mt },
            'datetime': { name: 'Date', default: mt },
            'date': { name: 'Date', default: mt },
            'object': { name: 'any', default: mt },
            'void': { name: 'void', default: mt }
        };
        if (type.elementType) {
            // This is a structure with nested types
            var map = this.typeMap(type.elementType);
            if (type instanceof sdkModels_1.ArrayType) {
                return { name: map.name + "[]", default: '[]' };
            }
            else if (type instanceof sdkModels_1.HashType) {
                return { name: "IDictionary<" + map.name + ">", default: '{}' };
            }
            else if (type instanceof sdkModels_1.DelimArrayType) {
                return { name: "DelimArray<" + map.name + ">", default: '' };
            }
            throw new Error("Don't know how to handle: " + JSON.stringify(type));
        }
        if (type.name) {
            return tsTypes[type.name] || { name: "I" + type.name, default: '' }; // No null default for complex types
        }
        else {
            throw new Error('Cannot output a nameless type.');
        }
    };
    return TypescriptGen;
}(codeGen_1.CodeGen));
exports.TypescriptGen = TypescriptGen;
