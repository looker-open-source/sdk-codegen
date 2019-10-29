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
