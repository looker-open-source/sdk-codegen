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

//    func deserialize<T>(_ data: Data) throws -> T where T : Codable {
//        let decoder = JSONDecoder()
//        let formatter = DateFormatter()
//        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
//        formatter.calendar = Calendar(identifier: .iso8601)
//        formatter.timeZone = TimeZone(secondsFromGMT: 0)
//        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
//        decoder.dateDecodingStrategy = .formatted(formatter)
//        do {
//            let result: T = try decoder.decode(T.self, from: data)
//            return result
//        } catch {
//            throw error
//        }
//
//    }
//    /// Convert a JSON string into the type `T`
//    /// @throws errors if deserialization fails
//    func deserialize<T>(_ json: String) throws -> T where T : Codable {
//        return try deserialize(Data(json.utf8))
//    }

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
    
    /*
     TODO remove this code, which is commented out in favor of AnyCodable
    let json = #"""
    {
    "want_string": 4,
    "want_int": "5",
    "want_dub": 2.3,
    "not_a_date":"2018-03-15T13:16:34.692-07:00",
    "nullable": null,
    "is_bool": true
    }
    """#

    struct Hacky : Codable {
        var want_string: Variant
        var want_int: Variant?
        var want_dub: Variant?
        var not_a_date: Variant?
        var is_bool: Variant?
        var nullable: Variant?
    }
        
    struct Simple : Codable {
        var want_string: String?
        var want_int: Int?
        var want_dub: Double?
        var not_a_date: String?
        var is_bool: Bool?
        var uri: URI?
    }
    
    // TODO figure out how to coerce String types to String with sloppy JSON
    // Parsing String as Date Swift bug https://bugs.swift.org/browse/SR-7461
    func testJsonHackyString() {
        do {
            var item : Hacky = try deserialize(#"{"want_string":4}"#)
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_string.getString(), "4", "Expected '4'")
            XCTAssertNil(item.want_int)
            XCTAssertNil(item.want_dub)
            XCTAssertNil(item.not_a_date)
            XCTAssertNil(item.is_bool)
            XCTAssertNil(item.nullable)
            item = try deserialize(#"{"want_string":"foo","want_dub":4.0}"#)
            XCTAssertEqual(item.want_string.getString(), "foo", "Expected 'foo'")
            XCTAssertEqual(item.want_dub?.getDouble(), 4.0, "Expected 4.0")
        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }

    func testJsonUri() {
        do {
            var item : Simple = try deserialize(#"{"uri":"/projects/cucu_thelook_1552930443_project/files/business_pulse.dashboard.lookml?line=1"}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.uri!, "/projects/cucu_thelook_1552930443_project/files/business_pulse.dashboard.lookml?line=1")
            item = try deserialize(#"{"uri":null}"#)
            print("strict null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_string, "uri should be nil")
        } catch {
            print(error)
            XCTAssertNil(error)
        }

    }
    
    func testJsonSimpleString() {
        
        do {
            var item : Simple = try deserialize(#"{"want_string":"4"}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_string, "4")
            item = try deserialize(#"{"want_string":null}"#)
            print("strict null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_string, "want_string should be nil")
//            item = try deserialize(#"{"want_string":4}"#)
//            print("lazy passed")
//            XCTAssertNotNil(item)
//            XCTAssertEqual(item.want_string, "4")

        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }

    func testJsonSimpleInt() {
        
        do {
            var item : Simple = try deserialize(#"{"want_int":4}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_int, 4)
            item = try deserialize(#"{"want_int":null}"#)
            print("null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_int)
        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }
 */

}
