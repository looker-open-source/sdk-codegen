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
// Swift code generator
var sdkModels_1 = require("./sdkModels");
var codeGen_1 = require("./codeGen");
var utils_1 = require("./utils");
var SwiftGen = /** @class */ (function (_super) {
    __extends(SwiftGen, _super);
    function SwiftGen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.codePath = './swift/';
        _this.packagePath = 'looker';
        _this.itself = 'self';
        _this.fileExtension = '.swift';
        _this.commentStr = '// ';
        _this.nullStr = 'nil';
        _this.transport = 'transport';
        _this.argDelimiter = ', ';
        _this.paramDelimiter = ',\n';
        _this.propDelimiter = '\n';
        _this.indentStr = '    ';
        _this.endTypeStr = "\n}";
        _this.needsRequestTypes = false;
        _this.willItStream = true;
        _this.keywords = 'associatedtype,class,deinit,enum,extension,fileprivate,func,import,init,inout,internal,let,open,'
            + 'operator,private,protocol,public,static,struct,subscript,typealias,var,break,case,continue,default,'
            + 'defer,do,else,fallthrough,for,guard,if,in,repeat,return,switch,where,while,'
            + 'as,Any,catch,false,is,nil,rethrows,super,self,Self,throw,throws,true,try,'
            + '_,#available,#colorLiteral,#column,#else,#elseif,#endif,#file,#fileLiteral,#function,#if,#imageLiteral,'
            + '#line,#selector,and #sourceLocation,associativity,convenience,dynamic,didSet,final,get,infix,indirect,'
            + 'lazy,left,mutating,none,nonmutating,optional,override,postfix,precedence,prefix,Protocol,required,right,'
            + 'set,Type,unowned,weak,willSet'.split(',');
        return _this;
    }
    SwiftGen.prototype.supportsMultiApi = function () {
        return false;
    };
    // @ts-ignore
    SwiftGen.prototype.methodsPrologue = function (indent) {
        return "\n/// " + this.warnEditing() + "\n\nimport Foundation\n\n@available(OSX 10.15, *)\nclass " + this.packageName + ": APIMethods {\n\n" + this.indentStr + "lazy var stream = " + this.packageName + "Stream(authSession)\n";
    };
    // @ts-ignore
    SwiftGen.prototype.streamsPrologue = function (indent) {
        return "\n/// " + this.warnEditing() + "\n\nimport Foundation\n\n@available(OSX 10.15, *)\nclass " + this.packageName + "Stream: APIMethods {\n";
    };
    // @ts-ignore
    SwiftGen.prototype.methodsEpilogue = function (indent) {
        return '\n}';
    };
    // @ts-ignore
    SwiftGen.prototype.modelsPrologue = function (indent) {
        return "\n/// " + this.warnEditing() + "\n\nimport Foundation\n";
    };
    // @ts-ignore
    SwiftGen.prototype.modelsEpilogue = function (indent) {
        return '\n';
    };
    SwiftGen.prototype.reserve = function (name) {
        if (this.keywords.includes(name)) {
            return "`" + name + "`";
        }
        return name;
    };
    SwiftGen.prototype.sdkFileName = function (baseFileName) {
        // return this.fileName(`sdk/${baseFileName}${this.apiRef}`)
        return this.fileName("sdk/" + baseFileName);
    };
    SwiftGen.prototype.commentHeader = function (indent, text) {
        return text ? indent + "/**\n" + utils_1.commentBlock(text, indent, ' * ') + "\n" + indent + " */\n" : '';
    };
    SwiftGen.prototype.declareProperty = function (indent, property) {
        // const optional = (property.nullable || !property.required) ? '?' : ''
        var optional = property.required ? '' : '?';
        if (property.name === sdkModels_1.strBody) {
            // TODO refactor this hack to track context when the body parameter is created for the request type
            property.type.refCount++;
            return this.commentHeader(indent, property.description || 'body parameter for dynamically created request type')
                + (indent + "var " + this.reserve(property.name) + ": " + property.type.name + optional);
        }
        var type = this.typeMap(property.type);
        return this.commentHeader(indent, this.describeProperty(property))
            + (indent + "var " + this.reserve(property.name) + ": " + type.name + optional);
    };
    SwiftGen.prototype.paramComment = function (param, mapped) {
        return "@param {" + mapped.name + "} " + param.name + " " + param.description;
    };
    SwiftGen.prototype.declareParameter = function (indent, param) {
        var type = (param.location === sdkModels_1.strBody)
            ? this.writeableType(param.type) || param.type
            : param.type;
        var mapped = this.typeMap(type);
        var pOpt = '';
        var line = '';
        if (param.location === sdkModels_1.strBody) {
            mapped.name = "" + mapped.name;
        }
        if (!param.required) {
            pOpt = '?';
        }
        else {
            line = '_ ';
        }
        return this.commentHeader(indent, this.paramComment(param, mapped))
            + ("" + indent + line + this.reserve(param.name) + ": " + mapped.name + pOpt)
            + (param.required ? '' : (mapped.default ? " = " + mapped.default : ''));
    };
    // @ts-ignore
    SwiftGen.prototype.initArg = function (indent, property) {
        return '';
    };
    // @ts-ignore
    SwiftGen.prototype.construct = function (indent, type) {
        return '';
    };
    SwiftGen.prototype.methodHeaderDeclaration = function (indent, method, streamer) {
        var _this = this;
        if (streamer === void 0) { streamer = false; }
        var _a;
        var type = this.typeMap(method.type);
        var resultType = streamer ? 'Data' : type.name;
        var returnType = type.name === 'Void' ? 'Voidable' : "SDKResponse<" + resultType + ", SDKError>";
        var head = (_a = method.description) === null || _a === void 0 ? void 0 : _a.trim();
        var headComment = (head ? head + "\n\n" : '') + (method.httpMethod + " " + method.endpoint + " -> " + type.name);
        var fragment = '';
        var requestType = this.requestTypeName(method);
        var bump = indent + this.indentStr;
        if (requestType) {
            // use the request type that will be generated in models.ts
            fragment = "request: I" + requestType;
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
        var header = this.commentHeader(indent, headComment)
            + (indent + "func " + method.name + "(");
        return header + fragment
            + ((fragment ? ',' : '') + "\n" + bump + "options: ITransportSettings? = nil\n" + indent + ") -> " + returnType + " {\n");
    };
    SwiftGen.prototype.methodSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, false);
    };
    SwiftGen.prototype.encodePathParams = function (indent, method) {
        var encodings = '';
        if (method.pathParams.length > 0) {
            for (var _i = 0, _a = method.pathParams; _i < _a.length; _i++) {
                var param = _a[_i];
                // For swift, just encode all path params because of awkward variable renames
                encodings += indent + "let path_" + param.name + " = encodeParam(" + param.name + ")\n";
            }
        }
        return encodings;
    };
    SwiftGen.prototype.declareMethod = function (indent, method) {
        var bump = this.bumper(indent);
        return this.methodSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.httpCall(bump, method)
            + ("\n" + indent + "}");
    };
    SwiftGen.prototype.streamerSignature = function (indent, method) {
        return this.methodHeaderDeclaration(indent, method, true);
    };
    SwiftGen.prototype.declareStreamer = function (indent, method) {
        var bump = this.bumper(indent);
        return this.streamerSignature(indent, method)
            + this.encodePathParams(bump, method)
            + this.streamCall(bump, method)
            + ("\n" + indent + "}");
    };
    // declareType(indent: string, type: IType): string {
    //   return super.declareType(this.bumper(indent), type)
    // }
    SwiftGen.prototype.typeSignature = function (indent, type) {
        var recursive = type.isRecursive();
        var structOrClass = recursive ? 'class' : 'struct';
        var needClass = recursive ? "\nRecursive type references must use Class instead of Struct" : '';
        var mapped = this.typeMap(type);
        return this.commentHeader(indent, type.description + needClass) +
            ("" + indent + structOrClass + " " + mapped.name + ": SDKModel {\n");
    };
    // @ts-ignore
    SwiftGen.prototype.errorResponses = function (indent, method) {
        // const results: string[] = method.errorResponses
        //   .map(r => `${r.type.name}`)
        // return results.join(' | ')
        // TODO figure out how to express OR'd error type responses
        return 'SDKError';
    };
    SwiftGen.prototype.httpPath = function (path, prefix) {
        prefix = prefix || '';
        if (path.indexOf('{') >= 0) {
            var tweak = path.replace(/{/gi, '\\(path_' + prefix);
            tweak = tweak.replace(/}/gi, ')');
            return "\"" + tweak + "\"";
        }
        return "\"" + path + "\"";
    };
    // @ts-ignore
    SwiftGen.prototype.argGroup = function (indent, args, prefix) {
        if ((!args) || args.length === 0)
            return this.nullStr;
        var hash = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (prefix) {
                hash.push("\"" + arg + "\": " + prefix + arg);
            }
            else {
                hash.push("\"" + arg + "\": " + arg);
            }
        }
        return "\n" + indent + "[" + hash.join(this.argDelimiter) + "]";
    };
    SwiftGen.prototype.queryGroup = function (indent, method, prefix) {
        var params = method.getParams('query');
        if ((!params) || params.length === 0)
            return this.nullStr;
        var hash = [];
        for (var _i = 0, params_2 = params; _i < params_2.length; _i++) {
            var param = params_2[_i];
            var arg = this.asAny(param);
            if (prefix) {
                hash.push("\"" + param.name + "\": " + prefix + arg);
            }
            else {
                hash.push("\"" + param.name + "\": " + arg);
            }
        }
        return "\n" + indent + "[" + hash.join(this.argDelimiter) + "]";
    };
    SwiftGen.prototype.asAny = function (param) {
        var castIt = false;
        if (param.type.elementType) {
            castIt = true;
        }
        else {
            var mapped = this.typeMap(param.type);
            switch (mapped.name.toLowerCase()) {
                case 'date':
                case 'datetime':
                // case 'url':
                // case 'uri':
                case 'object':
                case 'bool':
                    castIt = true;
                    break;
                default:
                    castIt = false;
                    break;
            }
        }
        return param.name + (castIt ? ' as Any?' : '');
    };
    // @ts-ignore
    SwiftGen.prototype.argList = function (indent, args, prefix) {
        prefix = prefix || '';
        return args && args.length !== 0
            ? "\n" + indent + prefix + args.join(this.argDelimiter + prefix)
            : this.nullStr;
    };
    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    SwiftGen.prototype.argFill = function (current, args) {
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
    SwiftGen.prototype.httpArgs = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        // add options at the end of the request calls. this will cause all other arguments to be
        // filled in but there's no way to avoid this for passing in the last optional parameter.
        // Fortunately, this code bloat is minimal and also hidden from the consumer.
        var result = this.argFill('', 'options');
        // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
        // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
        result = this.argFill(result, method.bodyArg ? "try! self.encode(" + request + method.bodyArg + ")" : this.nullStr);
        result = this.argFill(result, this.queryGroup(indent, method, request));
        return result;
    };
    SwiftGen.prototype.httpCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        var type = this.typeMap(method.type);
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        var errors = this.errorResponses(indent, method);
        return indent + "let result: SDKResponse<" + type.name + ", " + errors + "> = " + this.it(method.httpMethod.toLowerCase()) + "(" + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")\n" + indent + "return result";
    };
    SwiftGen.prototype.streamCall = function (indent, method) {
        var request = this.useRequest(method) ? 'request.' : '';
        // const type = this.typeMap(method.type)
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        var errors = this.errorResponses(indent, method);
        return indent + "let result: SDKResponse<Data, " + errors + "> = " + this.it(method.httpMethod.toLowerCase()) + "(" + this.httpPath(method.endpoint, request) + (args ? ', ' + args : '') + ")\n" + indent + "return result";
    };
    SwiftGen.prototype.summary = function (indent, text) {
        return this.commentHeader(indent, text);
    };
    SwiftGen.prototype.typeNames = function (countError) {
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
    SwiftGen.prototype.typeMap = function (type) {
        _super.prototype.typeMap.call(this, type);
        // const ns = `api${this.apiRef}.`
        // const ns = `Looker.`
        var ns = 'Lk';
        var swiftTypes = {
            'number': { name: 'Double', default: this.nullStr },
            'float': { name: 'Float', default: this.nullStr },
            'double': { name: 'Double', default: this.nullStr },
            'integer': { name: 'Int', default: this.nullStr },
            'int32': { name: 'Int32', default: this.nullStr },
            'int64': { name: 'Int64', default: this.nullStr },
            'string': { name: 'String', default: this.nullStr },
            'password': { name: 'Password', default: this.nullStr },
            'byte': { name: 'binary', default: this.nullStr },
            'boolean': { name: 'Bool', default: this.nullStr },
            'uri': { name: 'URI', default: this.nullStr },
            'url': { name: 'URL', default: this.nullStr },
            'datetime': { name: 'Date', default: this.nullStr },
            'date': { name: 'Date', default: this.nullStr },
            'object': { name: 'Any', default: this.nullStr },
            'void': { name: 'Voidable', default: '' },
            'Error': { name: ns + "Error", default: '' },
            'Group': { name: ns + "Group", default: '' },
        };
        if (type.elementType) {
            // This is a structure with nested types
            var map = this.typeMap(type.elementType);
            if (type instanceof sdkModels_1.ArrayType) {
                return { name: "[" + map.name + "]", default: '[]' };
            }
            else if (type instanceof sdkModels_1.HashType) {
                // return {name: `StringDictionary<${map.name}>`, default: 'nil'}
                return { name: "StringDictionary<AnyCodable>", default: 'nil' };
            }
            else if (type instanceof sdkModels_1.DelimArrayType) {
                return { name: "DelimArray<" + map.name + ">", default: 'nil' };
            }
            throw new Error("Don't know how to handle: " + JSON.stringify(type));
        }
        if (type.name) {
            return swiftTypes[type.name] || { name: "" + type.name, default: '' }; // No null default for complex types
        }
        else {
            throw new Error('Cannot output a nameless type.');
        }
    };
    return SwiftGen;
}(codeGen_1.CodeGen));
exports.SwiftGen = SwiftGen;
