//
//  transportTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/14/19.
//

import XCTest
@testable import looker

struct SimpleUser : SDKModel {
    var first: String
    var last: String
    var email : String?
}

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
