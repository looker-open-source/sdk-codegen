/**

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

import XCTest
@testable import looker

///propery wrappers look promising https://stackoverflow.com/a/70249110/74137

//protocol NumOrStringDecodable: Numeric {
//    init(numericOrStringContainer: SingleValueDecodingContainer) throws
//}
//
//@propertyWrapper struct NumOrString<T: NumOrStringDecodable>: Codable {
//    var wrappedValue: T
//
//    init(from decoder: Decoder) throws {
//        wrappedValue = try T(numericOrStringContainer: decoder.singleValueContainer())
//    }
//
//    func encode(to encoder: Encoder) throws {
//        return encoder.singleValueContainer().encode(T(wrappedValue))
//    }
//}
//
//extension Int: NumOrStringDecodable {
//    init(numericOrStringContainer container: SingleValueDecodingContainer) throws {
//        if let int = try? container.decode(Int.self) {
//            self = int
//        } else if let string = try? container.decode(String.self), let int = Int(string) {
//            self = int
//        } else {
//            throw DecodingError.dataCorrupted(.init(codingPath: container.codingPath, debugDescription: "Invalid int value"))
//        }
//    }
//}
//
//extension Int64: NumOrStringDecodable {
//    init(numericOrStringContainer container: SingleValueDecodingContainer) throws {
//        if let int = try? container.decode(Int64.self) {
//            self = int
//        } else if let string = try? container.decode(String.self), let int = Int64(string) {
//            self = int
//        } else {
//            throw DecodingError.dataCorrupted(.init(codingPath: container.codingPath, debugDescription: "Invalid int value"))
//        }
//    }
//}

//extension Double: NumOrStringDecodable {
//    init(numericOrStringContainer container: SingleValueDecodingContainer) throws {
//        if let double = try? container.decode(Double.self) {
//            self = double
//        } else if let string = try? container.decode(String.self), let double = Double(string) {
//            self = double
//        } else {
//            throw DecodingError.dataCorrupted(.init(codingPath: container.codingPath, debugDescription: "Invalid double value"))
//        }
//    }
//}

/// teaser from https://gist.github.com/hamishknight/e5bd36a1d5868b896f09dedad51b9ee9

struct SimpleUser : SDKModel {
    var first: String
    var last: String
    var email : String?
}

struct FreshLook : SDKModel {
    private var _id: AnyString?
    var id: String? {
        get { _id?.value }
        set { _id = newValue.map(AnyString.init) }
    }

    var title: String?

    private var _query_id: AnyString?
    var query_id: String? {
        get { _query_id?.value }
        set { _query_id = newValue.map(AnyString.init) }
    }

    private var _dashboard_id: AnyString
    var dashboard_id: String {
        get { _dashboard_id.value }
        set { _dashboard_id = AnyString.init(newValue) }
    }
    private enum CodingKeys: String, CodingKey {
        case title // = "title"
        case _id = "id"
        case _query_id = "query_id"
        case _dashboard_id = "dashboard_id"
    }

    init(id: String? = nil, title: String? = nil, query_id: String? = nil, dashboard_id: String) {
        self._id = id.map(AnyString.init)
        self.title = title
        self._query_id = query_id.map(AnyString.init)
        self._dashboard_id = AnyString.init(dashboard_id)
    }
}

struct TestModel : SDKModel {
    private var _string1: AnyString?
    var string1: String? {
        get { _string1?.value }
        set { _string1 = newValue.map(AnyString.init) }
    }
    private var _num1: AnyInt?
    var num1: Int64? {
        get { _num1?.value }
        set { _num1 = newValue.map(AnyInt.init) }
    }
    private var _string2: AnyString?
    var string2: String? {
        get { _string2?.value }
        set { _string2 = newValue.map(AnyString.init) }
    }
    private var _num2: AnyInt?
    var num2: Int64? {
        get { _num2?.value }
        set { _num2 = newValue.map(AnyInt.init) }
    }
    private var _string3: AnyString?
    var string3: String? {
        get { _string3?.value }
        set { _string3 = newValue.map(AnyString.init) }
    }
    private var _num3: AnyInt?
    var num3: Int64? {
        get { _num3?.value }
        set { _num3 = newValue.map(AnyInt.init) }
    }

    private var _list1: [AnyInt]?
    var list1: [Int64]? {
        get {
            if let v = _list1 {
                return v.map { $0.value }
            } else {
                return nil
            }
        }
        set {
            if let v = newValue {
                _list1 = v.map { AnyInt.init($0) }
            } else {
                _list1 = nil
            }
        }
    }
    
    private var _list2: [AnyString]?
    var list2: [String]? {
        get {
            if let v = _list2 {
                return v.map { $0.value }
            } else {
                return nil
            }
        }
        set {
            if let v = newValue {
                _list2 = v.map { AnyString.init($0) }
            } else {
                _list2 = nil
            }
        }
    }
    
    private var _rlist1: [AnyInt]
    var rlist1: [Int64] {
        get { _rlist1.map { $0.value } }
        set { _rlist1 = newValue.map { AnyInt.init($0) } }
    }
    
    private var _rlist2: [AnyString]
    var rlist2: [String] {
        get { _rlist2.map { $0.value } }
        set { _rlist2 = newValue.map { AnyString.init($0) } }
    }
    
    private enum CodingKeys: String, CodingKey {
        case _num1 = "num1"
        case _num2 = "num2"
        case _num3 = "num3"
        case _string1 = "string1"
        case _string2 = "string2"
        case _string3 = "string3"
        case _list1 = "list1"
        case _list2 = "list2"
        case _rlist1 = "rlist1"
        case _rlist2 = "rlist2"
    }
    
    init(string1: String? = nil, num1: Int64? = nil, string2: String? = nil, num2: Int64? = nil, string3: String? = nil, num3: Int64? = nil, list1: [Int64]? = nil, list2: [String]? = nil, rlist1: [Int64], rlist2: [String]) {
        self._string1 = string1.map(AnyString.init)
        self._num1 = num1.map(AnyInt.init)
        self._string2 = string2.map(AnyString.init)
        self._num2 = num2.map(AnyInt.init)
        self._string3 = string3.map(AnyString.init)
        self._num3 = num3.map(AnyInt.init)
        if let v = list1 { v.map { AnyInt.init($0) } } else { _list1 = nil }
        if let v = list2 { v.map { AnyString.init($0) } } else { _list2 = nil }
        self._rlist1 = rlist1.map { AnyInt.init($0) }
        self._rlist2 = rlist2.map { AnyString.init($0) }
    }

}


//struct WrapModel: SDKModel {
//    var string1: String
//    @NumOrString var num1: Int
//    var string2: String
//    @NumOrString var num2: Int64
//    var string3: String
//    @NumOrString var num3: Double
//}

@available(OSX 10.15, *)
class transportTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func checkRegex(_ exp: String, _ desc: String = "") {
        do {
            let regex = try NSRegularExpression(exp)
            XCTAssertNotNil(regex, desc)
        } catch {
            print(error)
        }
    }


    func testJsonTypes() {
        let payload = """
        {
            "string1": 1,
            "num1": 1,
            "string2": "2",
            "num2": "2",
            "string3": "3",
            "num3": 3,
            "string4": "4",
            "num4": 4,
            "list1": ["1","2"],
            "list2": [3,4],
            "rlist1": ["1","2"],
            "rlist2": [3,4]
        }
        """
        let actual: TestModel = try! deserialize(payload)
        XCTAssertEqual(actual.string1, "1")
        XCTAssertEqual(actual.num1, 1)
        XCTAssertEqual(actual.string2, "2")
        XCTAssertEqual(actual.num2, 2)
        XCTAssertEqual(actual.string3, "3")
        XCTAssertEqual(actual.num3, 3)
        XCTAssertEqual(actual.list1, [1,2])
        XCTAssertEqual(actual.list2, ["3", "4"])
        XCTAssertEqual(actual.rlist1, [1,2])
        XCTAssertEqual(actual.rlist2, ["3", "4"])
    }
    
//    func testPropWrapper() {
//        let payload = """
//        {
//            "string1": 1,
//            "num1": 1,
//            "string2": "2",
//            "num2": "2",
//            "string3": "3",
//            "num3": 3,
//            "string4": "4",
//            "num4": 4
//        }
//        """
//        let actual: WrapModel = try! deserialize(payload)
//        XCTAssertEqual(actual.string1, "1")
//        XCTAssertEqual(actual.num1, 1)
//        XCTAssertEqual(actual.string2, "2")
//        XCTAssertEqual(actual.num2, 2)
//        XCTAssertEqual(actual.string3, "3")
//        XCTAssertEqual(actual.num3, 3)
//    }
    
    func testAnyString() {
        let jsonString = """
        {
            "id": 1,
            "title": "Llookicorn",
            "query_id": 1,
            "dashboard_id": 1
        }
        """
        var look: FreshLook = try! deserialize(jsonString)
        XCTAssertNotNil(look, "Look 1 is assigned")
        XCTAssertEqual(look.id, "1")
        XCTAssertEqual(look.title, "Llookicorn")
        XCTAssertEqual(look.query_id, "1")
        XCTAssertEqual(look.dashboard_id, "1")
        look = try! deserialize("""
        {
            "id": "2",
            "title": "Zzeebra",
            "email": "zz@foo.bar",
            "query_id": "2",
            "dashboard_id": "2"
        }
        """)
        XCTAssertNotNil(look, "Look 2 is assigned")
        XCTAssertEqual(look.id, "2")
        XCTAssertEqual(look.title, "Zzeebra")
        XCTAssertEqual(look.query_id, "2")
        XCTAssertEqual(look.dashboard_id, "2")
    }

    func testRegexExtension() {
        checkRegex(Constants.matchModeString, "string match")
        checkRegex(Constants.matchCharset, "charset match")
        checkRegex(Constants.matchModeBinary, "binary match")
        checkRegex(Constants.applicationJson, "application/json")
        checkRegex(Constants.matchCharsetUtf8, "utf-8 match")
    }

    func testApproxEquals() {
        XCTAssertTrue("application/json" ~= Constants.matchModeString)
    }

    func testPatterns() {
        XCTAssertNotNil(contentPatternBinary, "Binary should be compiled")
        XCTAssertNotNil(charsetUtf8Pattern, "Charset should be compiled")
        XCTAssertNotNil(contentPatternString, "String should be compiled")
    }

    func testStringMode() {
        let data = config.testData["content_types"]?.value
        let contentTypes = data as! [String:[String]]
        let types = contentTypes["string"]!
        for t in types {
            let mode = responseMode(t)
            XCTAssertEqual(ResponseMode.string, mode, "\(t) should be string")
        }
    }

    func testBinaryMode() {
        let data = config.testData["content_types"]?.value
        let contentTypes = data as! [String:[String]]
        let types = contentTypes["binary"]!
        for t in types {
            let mode = responseMode(t)
            XCTAssertEqual(ResponseMode.binary, mode, "\(t) should be binary")
        }
    }

    func testDeserialize() {
        let jsonString = """
        {
            "first": "Lloyd",
            "last": "Llookicorn"
        }
        """
        var user: SimpleUser = try! deserialize(jsonString)
        XCTAssertNotNil(user, "LLoyd is assigned")
        XCTAssertEqual(user.first, "Lloyd")
        XCTAssertEqual(user.last, "Llookicorn")
        XCTAssertNil(user.email)
        user = try! deserialize("""
        {
            "first": "Zzooey",
            "last": "Zzeebra",
            "email": "zz@foo.bar"
        }
        """)
        XCTAssertNotNil(user, "Zzooey is assigned")
        XCTAssertEqual(user.first, "Zzooey")
        XCTAssertEqual(user.last, "Zzeebra")
        XCTAssertEqual(user.email, "zz@foo.bar")
    }


    //    func dictToJson(dict: StringDictionary<Variant?>) -> String {
    //        var result = ""
    //        dict.flatMap({(arg: (key: String, value: Variant?)) -> String in let (key, value) = arg; return {
    //            let v = value?.toJson() ?? "null"
    //            return "\"\(key)\":\(v)" }
    //        })
    //        return result
    //    }

    let visJson = """
{
"bool":true,
"int":1,
"dub":2.3,
"str":"Simple string",
"date":"2018-03-15T13:16:34.692-07:00",
"nada":null,
"dict": {"A":4, "B": 2, "C": true},
"ratnest": [ { "one": 1, "two": "two" }, "three", {"four":4} ]
}
"""

    // Relevant SO https://stackoverflow.com/questions/46279992/any-when-decoding-json-with-codable
    // Using AnyCodable from https://github.com/Flight-School/AnyCodable
    func testDictFromJson() {
        var vis_config: StringDictionary<AnyCodable>? = try! deserialize(visJson)
        //        let vis_config: StringDictionary<Variant?>? = try! deserialize(visJson)
        var data = try! serialize(vis_config)
        var json = String(decoding: data, as: UTF8.self)
        XCTAssertNotNil(vis_config)
        XCTAssertNotNil(data)
        XCTAssertNotNil(json)
        let bool = vis_config["bool"] as! Bool
        XCTAssertTrue(bool)
        let int = vis_config["int"] as! Int64
        XCTAssertEqual(int, 1)
        let nada = vis_config["nada"]

        if "\(nada!)" == "nil" {
            // nada is nil as expected
        } else {
            XCTAssertTrue(false, "nada should be nil, not '\(nada!)'")
        }
        let dub = vis_config["dub"] as! Double
        XCTAssertEqual(dub, 2.3, accuracy: 0.0001, "dub should be 2.3")
        let str = vis_config["str"] as! String
        XCTAssertEqual(str, "Simple string")
        XCTAssertTrue(json.contains(str), "\(str) should be in json")
        if let dict = vis_config["dict"] as? [AnyHashable: Any] {
            XCTAssertNotNil(dict, "dict should not be nil")
            if let a = dict["A"] as? Int {
                XCTAssertEqual(a, 4, "A should be 4")
            } else {
                XCTAssertTrue(false, "A should be 4")
            }
        } else {
            XCTAssertTrue(false, "dict is not a dictionary")
        }
        if let ratnest = vis_config["ratnest"] as? Array<Any> {
            XCTAssertNotNil(ratnest, "ratnest should not be nil")
            if let first = ratnest[0] as? [AnyHashable: Any] {
                XCTAssertNotNil(first, "first should not be a dictionary")
            } else {
                XCTAssertTrue(false, "first is not an array")
            }
        } else {
            XCTAssertTrue(false, "ratnest is not an array")
        }
        vis_config!.updateValue("Updated string", forKey: "str")
        data = try! serialize(vis_config)
        json = String(decoding: data, as: UTF8.self)
        XCTAssertTrue(json.contains("Updated string"), "str should be updated")
    }

    func testQueryParamsAllNil() {
        let values: Values = [ "Not": nil, "A": nil, "Darned": nil, "Thing!": nil ]
        let actual = addQueryParams("empty", values)
        XCTAssertEqual(actual, "empty")
    }

    func testQueryParams1() {
        let values: Values = [ "One": 1 ]
        let actual = addQueryParams("Wonderful", values)
        XCTAssertEqual(actual, "Wonderful?One=1")
    }

    func testQueryParamsNil() {
        let opt: Bool? = nil
        let values: Values = ["Missing": opt, "Num": 1]
        let actual = addQueryParams("Some", values)
        XCTAssertEqual(actual, "Some?Num=1")
    }

    func testQueryParamsDelimArrayInt() {
        let ids: DelimArray<Int> = [1,2,3]
        var values: Values = [ "Ids": ids ]
        var actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
        let opts: DelimArray<Int?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
    }

    func testQueryParamsDelimArrayInt32() {
        let ids: DelimArray<Int32> = [1,2,3]
        var values: Values = [ "Ids": ids ]
        var actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
        let opts: DelimArray<Int32?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
    }

    func testQueryParamsDelimArrayInt64() {
        let ids: DelimArray<Int64> = [1,2,3]
        var values: Values = [ "Ids": ids ]
        var actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
        let opts: DelimArray<Int64?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1%2C2%2C3")
    }

    func testQueryParamsDelimString() {
        let names: DelimArray<String> = ["LLoyd?", "ZZooey#"]
        var values: Values = [ "Names": names]
        var actual = addQueryParams("String", values)
        XCTAssertEqual(actual, "String?Names=LLoyd%3F%2CZZooey%23")
        let opts: DelimArray<String?>? = ["LLoyd?", "ZZooey#"]
        values = ["Names": opts]
        actual = addQueryParams("String", values)
        XCTAssertEqual(actual, "String?Names=LLoyd%3F%2CZZooey%23")
    }

    func testQueryParamsDelimArrayDouble() {
        let nums: DelimArray<Double> = [2.2,3.3]
        var values: Values = [ "Nums": nums]
        var actual = addQueryParams("Double", values)
        XCTAssertEqual(actual, "Double?Nums=2.2%2C3.3")
        let opts: DelimArray<Double?>? = [2.2,3.3]
        values = [ "Nums": opts]
        actual = addQueryParams("Double", values)
        XCTAssertEqual(actual, "Double?Nums=2.2%2C3.3")
    }

    func testQueryParamsDelimArrayFloat() {
        let nums: DelimArray<Float> = [2.2,3.3]
        var values: Values = [ "Nums": nums]
        var actual = addQueryParams("Float", values)
        XCTAssertEqual(actual, "Float?Nums=2.2%2C3.3")
        let opts: DelimArray<Float?>? = [2.2,3.3]
        values = [ "Nums": opts]
        actual = addQueryParams("Float", values)
        XCTAssertEqual(actual, "Float?Nums=2.2%2C3.3")
    }

    func testQueryParamsDelimArrayBool() {
        let flags: DelimArray<Bool> = [false, true]
        var values: Values = [ "Flags": flags]
        var actual = addQueryParams("Bool", values)
        XCTAssertEqual(actual, "Bool?Flags=false%2Ctrue")
        let opts: DelimArray<Bool?>? = [false,true]
        values = [ "Flags": opts]
        actual = addQueryParams("Bool", values)
        XCTAssertEqual(actual, "Bool?Flags=false%2Ctrue")
    }

    func testPerc() {
        var url = URLComponents()
        url.setQueryItems(with: ["foo": "%"])
        let foo = url.percentEncodedQuery
        XCTAssertEqual(foo, "foo=%25")
        let perc = encodeParam("%")
        XCTAssertEqual("%25", perc)
        XCTAssertEqual(encodeParam("%%"), "%25%25")
        XCTAssertEqual(encodeParam("cat%"), "cat%25")
        XCTAssertEqual(encodeParam("%cat"), "%25cat")

    }

    func testEncodeParam() {
        let today = DateFormatter.iso8601Full.date(from: "2020-01-01T14:48:00.00Z")
        XCTAssertEqual(encodeParam(today), "2020-01-01T14%3A48%3A00.000Z")
        XCTAssertEqual(encodeParam("foo/bar"), "foo%2Fbar")
        XCTAssertEqual(encodeParam(true), "true")
        XCTAssertEqual(encodeParam(2.3), "2.3")
        var val: Any? = #"foo"bar"#
        XCTAssertEqual(encodeParam(val), "foo%22bar")
        val = "foo?bar"
        XCTAssertEqual(encodeParam(val), "foo%3Fbar")
        val = true
        XCTAssertEqual(encodeParam(val), "true")
        val = nil
        XCTAssertEqual(encodeParam(val), "")
        let checks = [
            [" ", "%20"],
            ["/", "%2F"],
            ["?", "%3F"],
            ["\"", "%22"],
            ["\\", "%5C"],
            ["<", "%3C"],
            [">", "%3E"],
            ["#", "%23"],
            ["%", "%25"],
            ["|", "%7C"],
            ["[", "%5B"],
            ["]", "%5D"],
            ["{", "%7B"],
            ["}", "%7D"],
            ["!", "%21"]
        ]
        for e in checks {
            //            XCTAssertEqual(e[0], e[1].decodeUri(), "Value: '\(e[0])'")
            XCTAssertEqual(encodeParam(e[0]), e[1], "Value: '\(e[0])'")
        }
        let ids: DelimArray<Int64> = [1,2,3]
        XCTAssertEqual(ids.toString(), "1,2,3")
        XCTAssertEqual(encodeParam(ids), "1%2C2%2C3")
        var x: Any = ids
        XCTAssertEqual(encodeParam(x), "1%2C2%2C3")
        if (x is DelimArray<Int64>) {
            let v = x as! DelimArray<Int64>
            XCTAssertEqual(v.toString(), "1,2,3")
            XCTAssertEqual(encodeParam(v), "1%2C2%2C3")
        }
        let names: DelimArray<String> = ["George", "Ringo", "Paul", "John"]
        XCTAssertEqual(names.toString(), "George,Ringo,Paul,John")
        XCTAssertEqual(encodeParam(names), "George%2CRingo%2CPaul%2CJohn")
        x = names
        XCTAssertEqual(encodeParam(x), "George%2CRingo%2CPaul%2CJohn")
        if (x is DelimArray<String>) {
            let v = x as! DelimArray<String>
            XCTAssertEqual(v.toString(), "George,Ringo,Paul,John")
            XCTAssertEqual(encodeParam(v), "George%2CRingo%2CPaul%2CJohn")
        }
    }

    let hiFen = """
    {
    "bool-val":true,
    "int-val":1,
    "dub-val":2.3,
    "str-val":"Simple string",
    "date-val":"2018-03-15T13:16:34.692-07:00",
    "nada-val":null,
    "dict-val": {"A":4, "B": 2, "C": true},
    "rat-nest": [ { "one": 1, "two": "two" }, "three", {"four":4} ]
    }
    """
    struct hiFenWithCodingKeys: SDKModel {
        private enum CodingKeys : String, CodingKey {
            case bool_val = "bool-val", int_val = "int-val", dub_val = "dub-val", str_val = "str-val", date_val = "date-val", nada_val = "nada-val", dict_val = "dict-val", rat_nest = "rat-nest"
        }

        var bool_val: Bool?
        var int_val: Int?
        var dub_val: Double?
        var str_val: String?
        var date_val: Date?
        var nada_val: AnyCodable?
        var dict_val: StringDictionary<AnyCodable>?
        var rat_nest: AnyCodable?

    }

    /// Create a custom json handler for hyphens https://stackoverflow.com/questions/44396500/how-do-i-use-custom-keys-with-swift-4s-decodable-protocol/44396824#44396824
    func testHyphenWithCodingKeys() {
        var actual: hiFenWithCodingKeys = try! deserialize(hiFen)
        XCTAssertNotNil(actual)
        XCTAssertEqual(actual.bool_val, true)
        XCTAssertEqual(actual.int_val, 1)
        XCTAssertEqual(actual.dub_val, 2.3)
        XCTAssertEqual(actual.str_val, "Simple string")
        XCTAssertEqual(actual.nada_val, nil)
        var data = try! serialize(actual)
        var json = String(decoding: data, as: UTF8.self)
        XCTAssertNotNil(json)
        XCTAssertTrue(json.contains("bool-val"))
        XCTAssertTrue(json.contains("int-val"))
        XCTAssertTrue(json.contains("dub-val"))
        XCTAssertTrue(json.contains("str-val"))
        XCTAssertTrue(json.contains("date-val"))
        // Skips optional when set to null
        XCTAssertFalse(json.contains("nada-val"))
        XCTAssertTrue(json.contains("dict-val"))
        XCTAssertTrue(json.contains("rat-nest"))
        actual.nada_val = "nada"
        actual.str_val = nil
        data = try! serialize(actual)
        json = String(decoding: data, as: UTF8.self)
        XCTAssertNotNil(json)
        XCTAssertTrue(json.contains("bool-val"))
        XCTAssertTrue(json.contains("int-val"))
        XCTAssertTrue(json.contains("dub-val"))
        XCTAssertFalse(json.contains("str-val"))
        XCTAssertTrue(json.contains("date-val"))
        XCTAssertTrue(json.contains("nada-val"))
        XCTAssertTrue(json.contains("dict-val"))
        XCTAssertTrue(json.contains("rat-nest"))
    }
}
