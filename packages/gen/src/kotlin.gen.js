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
// Kotlin code generator
var sdkModels_1 = require("./sdkModels");
var codeGen_1 = require("./codeGen");
var utils_1 = require("./utils");
var KotlinGen = /** @class */ (function (_super) {
    __extends(KotlinGen, _super);
    function KotlinGen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.codePath = './kotlin/src/main/com/';
        _this.packagePath = 'looker';
        _this.itself = 'this';
        _this.fileExtension = '.kt';
        _this.commentStr = '// ';
        _this.nullStr = 'null';
        _this.transport = 'transport';
        _this.argDelimiter = ', ';
        _this.paramDelimiter = ',\n';
        _this.propDelimiter = ',\n';
        _this.indentStr = '  ';
        _this.endTypeStr = '\n) : Serializable';
        _this.needsRequestTypes = false;
        _this.willItStream = true;
        _this.defaultApi = '4.0';
        return _this;
    }
    KotlinGen.prototype.isDefaultApi = function () {
        return this.apiVersion === this.defaultApi;
    };
    // TODO create `defaultPackageName` property in CodeGen
    KotlinGen.prototype.sdkClassName = function () {
        return this.isDefaultApi() ? 'LookerSDK' : "Looker" + this.apiRef + "SDK";
    };
    /**
     * Return either api versioned namespace text or empty string if current API is the default
     * @returns {string} 'api31' or '', for example
     */
    KotlinGen.prototype.apiNamespace = function () {
        if (this.apiVersion === this.defaultApi)
            return '';
        return ".api" + this.apiRef;
    };
    // @ts-ignore
    KotlinGen.prototype.methodsPrologue = function (indent) {
        return "\n// " + this.warnEditing() + "\npackage com.looker.sdk" + this.apiNamespace() + "\n\nimport com.looker.rtl.*\nimport java.util.*\n\nclass " + this.sdkClassName() + "(authSession: AuthSession) : APIMethods(authSession) {\n\n  val stream by lazy { " + this.sdkClassName() + "Stream(this.authSession) }\n";
    };
    // @ts-ignore
    KotlinGen.prototype.streamsPrologue = function (indent) {
        return "\n// " + this.warnEditing() + "\npackage com.looker.sdk" + this.apiNamespace() + "\n\nimport com.looker.rtl.*\nimport java.util.*\n\nclass " + this.sdkClassName() + "Stream(authSession: AuthSession) : APIMethods(authSession) {\n\n";
    };
    // @ts-ignore
    KotlinGen.prototype.methodsEpilogue = function (indent) {
        return '\n}';
    };
    // @ts-ignore
    KotlinGen.prototype.modelsPrologue = function (indent) {
        return "\n// " + this.warnEditing() + "\n\npackage com.looker.sdk" + this.apiNamespace() + "\n\nimport com.looker.rtl.UriString\nimport java.io.Serializable\nimport java.util.*\n";
    };
    // @ts-ignore
    KotlinGen.prototype.modelsEpilogue = function (indent) {
        return '';
    };
    KotlinGen.prototype.commentHeader = function (indent, text) {
        return text ? indent + "/**\n" + utils_1.commentBlock(text, indent, ' * ') + "\n" + indent + " */\n" : '';
    };
    KotlinGen.prototype.declareProperty = function (indent, property) {
        var optional = !property.required ? '? = null' : '';
        var type = this.typeMap(property.type);
        return this.commentHeader(indent, this.describeProperty(property))
            + (indent + "var " + property.name + ": " + type.name + optional);
    };
    KotlinGen.prototype.paramComment = function (param, mapped) {
        return "@param {" + mapped.name + "} " + param.name + " " + param.description;
    };
    KotlinGen.prototype.declareParameter = function (indent, param) {
        var type = (param.location === sdkModels_1.strBody)
            ? this.writeableType(param.type) || param.type
            : param.type;
        var mapped = this.typeMap(type);
        var pOpt = '';
        if (!param.required) {
            pOpt = '?';
        }
        return this.commentHeader(indent, this.paramComment(param, mapped))
            + ("" + indent + param.name + ": " + mapped.name + pOpt)
            + (param.required ? '' : (mapped.default ? " = " + mapped.default : ''));
    };
    // @ts-ignore
    KotlinGen.prototype.initArg = function (indent, property) {
        return '';
    };
    // @ts-ignore
    KotlinGen.prototype.construct = function (indent, type) {
        return '';
    };
    KotlinGen.prototype.methodHeaderDeclaration = function (indent, method, streamer) {
        var _this = this;
        if (streamer === void 0) { streamer = false; }
        var _a;
        var type = this.typeMap(method.type);
        var resultType = streamer ? 'ByteArray' : type.name;
        var head = (_a = method.description) === null || _a === void 0 ? void 0 : _a.trim();
        var headComment = (head ? head + "\n\n" : '') + (method.httpMethod + " " + method.endpoint + " -> " + resultType);
        var fragment = '';
        var requestType = this.requestTypeName(method);
        var bump = indent + this.indentStr;
        if (requestType) {
            // TODO remove this Typescript cruft
            fragment = "request: Partial<" + requestType + ">";
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
        var jvmOverloads = method.optionalParams.length > 0 ? '@JvmOverloads ' : '';
        // const callback = `callback: (readable: Readable) => Promise<${type.name}>,`
        var header = this.commentHeader(indent, headComment)
            + ("" + indent + jvmOverloads + "fun " + method.name + "(");
        // + (streamer ? `\n${bump}${callback}` : '')
        return header + fragment + ") : SDKResponse {\n";
    };
    KotlinGen.prototype.methodSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, false);
    };
    KotlinGen.prototype.encodePathParams = function (indent, method) {
        var bump = indent + this.indentStr;
        var encodings = '';
        if (method.pathParams.length > 0) {
            for (var _i = 0, _a = method.pathParams; _i < _a.length; _i++) {
                var param = _a[_i];
                encodings += bump + "val path_" + param.name + " = encodeParam(" + param.name + ")\n";
            }
        }
        return encodings;
    };
    KotlinGen.prototype.declareMethod = function (indent, method) {
        var bump = this.bumper(indent);
        return this.methodSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.httpCall(bump, method)
            + ("\n" + indent + "}");
    };
    KotlinGen.prototype.streamerSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, true);
    };
    KotlinGen.prototype.declareStreamer = function (indent, method) {
        var bump = this.bumper(indent);
        return this.streamerSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.streamCall(bump, method)
            + ("\n" + indent + "}");
    };
    KotlinGen.prototype.typeSignature = function (indent, type) {
        return this.commentHeader(indent, type.description) +
            (indent + "data class " + type.name + " (\n");
    };
    // @ts-ignore
    KotlinGen.prototype.errorResponses = function (indent, method) {
        return "";
        // const results: string[] = method.errorResponses
        //   .map(r => `I${r.type.name}`)
        // return results.join(' | ')
    };
    KotlinGen.prototype.httpPath = function (path, prefix) {
        prefix = prefix || '';
        if (path.indexOf('{') >= 0)
            return '"' + path.replace(/{/gi, '${path_' + prefix) + '"';
        return "\"" + path + "\"";
    };
    // @ts-ignore
    KotlinGen.prototype.argGroup = function (indent, args, prefix) {
        if ((!args) || args.length === 0)
            return 'mapOf()';
        var hash = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (prefix) {
                hash.push("\"" + arg + "\" to " + prefix + arg);
            }
            else {
                hash.push("\"" + arg + "\" to " + arg);
            }
        }
        var bump = this.bumper(indent);
        var argBump = this.bumper(bump);
        var argWrapper = ",\n " + argBump;
        return "\n" + bump + "mapOf(" + hash.join(argWrapper) + ")";
    };
    // @ts-ignore
    KotlinGen.prototype.argList = function (indent, args, prefix) {
        prefix = prefix || '';
        return args && args.length !== 0
            ? "\n" + indent + prefix + args.join(this.argDelimiter + prefix)
            : this.nullStr;
    };
    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    KotlinGen.prototype.argFill = function (current, args) {
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
    KotlinGen.prototype.httpArgs = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        // add options at the end of the request calls. this will cause all other arguments to be
        // filled in but there's no way to avoid this for passing in the last optional parameter.
        // Fortunately, this code bloat is minimal and also hidden from the consumer.
        // let result = this.argFill('', 'options')
        // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
        // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
        var result = this.argFill('', method.bodyArg ? "" + request + method.bodyArg : this.nullStr);
        result = this.argFill(result, this.argGroup(indent, method.queryArgs, request));
        return result;
    };
    KotlinGen.prototype.httpCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        var type = this.typeMap(method.type);
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        // TODO don't currently need these for Kotlin
        // const errors = this.errorResponses(indent, method)
        return bump + "return " + this.it(method.httpMethod.toLowerCase()) + "<" + type.name + ">(" + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")";
    };
    KotlinGen.prototype.streamCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        // const type = this.typeMap(method.type)
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        // const errors = this.errorResponses(indent, method)
        return bump + "return " + this.it(method.httpMethod.toLowerCase()) + "<ByteArray>(" + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")";
    };
    KotlinGen.prototype.summary = function (indent, text) {
        return this.commentHeader(indent, text);
    };
    KotlinGen.prototype.typeNames = function (countError) {
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
    KotlinGen.prototype.typeMap = function (type) {
        _super.prototype.typeMap.call(this, type);
        var mt = this.nullStr;
        var ktTypes = {
            'number': { name: 'Double', default: mt },
            'float': { name: 'Float', default: mt },
            'double': { name: 'Double', default: mt },
            'integer': { name: 'Int', default: mt },
            'int32': { name: 'Int', default: mt },
            'int64': { name: 'Long', default: mt },
            'string': { name: 'String', default: mt },
            'password': { name: 'Password', default: mt },
            'byte': { name: 'binary', default: mt },
            'boolean': { name: 'Boolean', default: mt },
            'uri': { name: 'UriString', default: mt },
            'url': { name: 'UrlString', default: mt },
            'datetime': { name: 'Date', default: mt },
            'date': { name: 'Date', default: mt },
            'object': { name: 'Any', default: mt },
            'void': { name: 'Void', default: mt }
        };
        if (type.elementType) {
            // This is a structure with nested types
            var map = this.typeMap(type.elementType);
            if (type instanceof sdkModels_1.ArrayType) {
                return { name: "Array<" + map.name + ">", default: this.nullStr };
            }
            else if (type instanceof sdkModels_1.HashType) {
                // TODO figure out this bizarre string template error either in IntelliJ or Typescript
                // return {name: `Map<String,${map.name}>`, default: '{}'}
                if (map.name === 'String')
                    map.name = "Any"; // TODO fix messy hash values
                return { name: 'Map<String' + ("," + map.name + ">"), default: this.nullStr };
            }
            else if (type instanceof sdkModels_1.DelimArrayType) {
                return { name: "DelimArray<" + map.name + ">", default: this.nullStr };
            }
            throw new Error("Don't know how to handle: " + JSON.stringify(type));
        }
        if (type.name) {
            return ktTypes[type.name] || { name: "" + type.name, default: this.nullStr };
        }
        else {
            throw new Error('Cannot output a nameless type.');
        }
    };
    return KotlinGen;
}(codeGen_1.CodeGen));
exports.KotlinGen = KotlinGen;
