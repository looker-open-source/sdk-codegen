//
//  transportTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/14/19.
//

import XCTest
@testable import looker

let binaryTypes = """
application/zip
application/pdf
application/msword
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/vnd.oasis.opendocument.text
multipart/form-data
audio/mpeg
audio/ogg
image/png
image/jpeg
image/gif
font/
audio/
video/
image/
""".split(separator: "\n")

let textTypes = """
image/svg+xml
application/javascript
application/json
application/x-www-form-urlencoded
application/xml
application/sql
application/graphql
application/ld+json
text/css
text/html
text/xml
text/csv
text/plain
application/vnd.api+json
""".split(separator: "\n")

struct SimpleUser : SDKModel {
    var first: String
    var last: String
    var email : String?
}

@available(OSX 10.12, *)
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

    func testBinaryMode() {
        for (item) in binaryTypes {
            let val = String(item)
            let actual = responseMode(val)
            XCTAssertEqual(actual, .binary, val)
        }
    }

    func testStringMode() {
        print(Constants.matchModeString)
        for (item) in textTypes {
            let val = String(item)
            let actual = responseMode(val)
            XCTAssertEqual(actual, .string, val)
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
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
        let opts: DelimArray<Int?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
    }

    func testQueryParamsDelimArrayInt32() {
        let ids: DelimArray<Int32> = [1,2,3]
        var values: Values = [ "Ids": ids ]
        var actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
        let opts: DelimArray<Int32?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
    }

    func testQueryParamsDelimArrayInt64() {
        let ids: DelimArray<Int64> = [1,2,3]
        var values: Values = [ "Ids": ids ]
        var actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
        let opts: DelimArray<Int64?>? = [1,2,3]
        values = [ "Ids": opts ]
        actual = addQueryParams("Int", values)
        XCTAssertEqual(actual, "Int?Ids=1,2,3")
    }

    func testQueryParamsDelimString() {
        let names: DelimArray<String> = ["LLoyd?", "ZZooey#"]
        var values: Values = [ "Names": names]
        var actual = addQueryParams("String", values)
        XCTAssertEqual(actual, "String?Names=LLoyd%3F,ZZooey%23")
        let opts: DelimArray<String?>? = ["LLoyd?", "ZZooey#"]
        values = ["Names": opts]
        actual = addQueryParams("String", values)
        XCTAssertEqual(actual, "String?Names=LLoyd%3F,ZZooey%23")
    }

    func testQueryParamsDelimArrayDouble() {
        let nums: DelimArray<Double> = [2.2,3.3]
        var values: Values = [ "Nums": nums]
        var actual = addQueryParams("Double", values)
        XCTAssertEqual(actual, "Double?Nums=2.2,3.3")
        let opts: DelimArray<Double?>? = [2.2,3.3]
        values = [ "Nums": opts]
        actual = addQueryParams("Double", values)
        XCTAssertEqual(actual, "Double?Nums=2.2,3.3")
    }

    func testQueryParamsDelimArrayFloat() {
        let nums: DelimArray<Float> = [2.2,3.3]
        var values: Values = [ "Nums": nums]
        var actual = addQueryParams("Float", values)
        XCTAssertEqual(actual, "Float?Nums=2.2,3.3")
        let opts: DelimArray<Float?>? = [2.2,3.3]
        values = [ "Nums": opts]
        actual = addQueryParams("Float", values)
        XCTAssertEqual(actual, "Float?Nums=2.2,3.3")
    }

    func testQueryParamsDelimArrayBool() {
        let flags: DelimArray<Bool> = [false, true]
        var values: Values = [ "Flags": flags]
        var actual = addQueryParams("Bool", values)
        XCTAssertEqual(actual, "Bool?Flags=false,true")
        let opts: DelimArray<Bool?>? = [false,true]
        values = [ "Flags": opts]
        actual = addQueryParams("Bool", values)
        XCTAssertEqual(actual, "Bool?Flags=false,true")
    }

}
