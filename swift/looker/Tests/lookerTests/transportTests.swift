//
//  testTransport.swift
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

class testTransport: XCTestCase {

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
        var user: SimpleUser = try! deserialize(json: jsonString)
        XCTAssertNotNil(user, "LLoyd is assigned")
        XCTAssertEqual(user.first, "Lloyd")
        XCTAssertEqual(user.last, "Llookicorn")
        XCTAssertNil(user.email)
        user = try! deserialize(json: """
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

}
