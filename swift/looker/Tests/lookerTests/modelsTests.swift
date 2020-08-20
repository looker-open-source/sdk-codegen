//
//  modelsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/29/19.
//

import XCTest

@testable import looker

@available(OSX 10.12, *)
class modelsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testDateParse() {
        let value = "2018-03-15T13:16:34.692-07:00"
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        let date = formatter.date(from: value)

        XCTAssertNotNil(date)
        let dateString = formatter.string(from: date!)
        print(dateString)
        XCTAssertNotNil(dateString)
    }
    
    func testAllRequiredProperties() {
        let actual = CreateFolder("folder", "1")
        XCTAssertEqual(actual.name, "folder")
        XCTAssertEqual(actual.parent_id, "1")
    }
    
    func testSomeOptionalProperties() {
        let actual = EmbedParams("http://foo", session_length: 20)
        XCTAssertEqual(actual.target_url, "http://foo")
        XCTAssertEqual(actual.session_length, 20)
    }
    
    public class ClassInit: SDKModel {
        /// required property
        public var name: String
        /// optional property
        public var id: String?

        // named parameter initializer
        public init(name: String, id: String? = nil) {
            self.name = name
            self.id = id
        }

        /// positional initializer
        public convenience init(_ name: String, id: String? = nil) {
            self.init(name: name, id: id)
        }
    }
    
    public struct StructInit: SDKModel {
        /// required property
        public var name: String
        /// optional property
        public var id: String?

        // named parameter initializer
        public init(name: String, id: String? = nil) {
            self.name = name
            self.id = id
        }

        /// positional initializer
        public init(_ name: String, id: String? = nil) {
            self.init(name: name, id: id)
        }
    }
    
    func testBothPositionalAndNamed() {
        let name = "one"
        let id = "id"
        var testClass = ClassInit(name, id: id) // positional
        XCTAssertEqual(testClass.name, name)
        XCTAssertEqual(testClass.id, id)
        testClass = ClassInit(name: name, id: id) // named
        XCTAssertEqual(testClass.name, name)
        XCTAssertEqual(testClass.id, id)
        var testStruct = StructInit(name, id: id) // positional
        XCTAssertEqual(testStruct.name, name)
        XCTAssertEqual(testStruct.id, id)
        testStruct = StructInit(name: name, id: id) // named
        XCTAssertEqual(testStruct.name, name)
        XCTAssertEqual(testStruct.id, id)
    }

}
