//
//  constantsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/28/19.
//

import XCTest
@testable import looker

class constantsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testAsQ() {
        var val: Any? = "foo bar"
        XCTAssertEqual(asQ(val), "foo%20bar")
        val = #"foo"bar"#
        XCTAssertEqual(asQ(val), "foo%22bar")
        val = #"foo?bar"#
        XCTAssertEqual(asQ(val), "foo%3Fbar")
        val = true
        XCTAssertEqual(asQ(val),"true")
        val = nil
        XCTAssertEqual(asQ(val), "")
        let escapes = [
            [" ", "%20"],
            ["\"", "%22"],
            ["<", "%3C"],
            [">", "%3E"],
            ["#", "%23"],
            ["%", "%25"],
            ["|", "%7C"],
            ["[", "%5B"],
            ["]", "%5D"],
            ["{", "%7B"],
            ["}", "%7D"],
            ["!", "!"]
        ]
        for e in escapes {
            XCTAssertEqual(asQ(e[0]), e[1])
        }
        let ids: DelimArray<Int64> = [1,2,3]
        var x: Any = ids
        if (x is DelimArray<Int64>) {
            let v = x as! DelimArray<Int64>
            XCTAssertEqual(v.toString(), "1,2,3")
        }
        let names: DelimArray<String> = ["George", "Ringo", "Paul", "John"]
        x = names
        if (x is DelimArray<String>) {
            let v = x as! DelimArray<String>
            XCTAssertEqual(v.toString(), "George,Ringo,Paul,John")
        }
        XCTAssertEqual(asQ(ids), "1,2,3")
    }
    
    func testDelimArray() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        let numArray: DelimArray<Int64> = [1,2,3]
        let nums = numArray.toString()
        XCTAssertEqual(nums, "1,2,3")
        var x: Any = numArray
        XCTAssertTrue(x is DelimArray<Int64>, "DelimArray<Int64>?")
        let stringArray: DelimArray<String> = ["a","b","c"]
        let strings = stringArray.toString(",")
        XCTAssertEqual(strings, "a,b,c")
        x = stringArray
        XCTAssertTrue(x is DelimArray<String>, "DelimArray<String>?")
        let boolRA: DelimArray<Bool> = [true, false, true]
        let bools = boolRA.toString("|")
        XCTAssertEqual(bools, "true|false|true")
        x = boolRA
        XCTAssertTrue(x is DelimArray<Bool>, "DelimArray<Bool>?")
//        XCTAssertEqual(t, "DelimArray<T>")
    }

}
