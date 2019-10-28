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

    func testDelimArray() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        let numArray: DelimArray<Int> = [1,2,3]
        let nums = numArray.toString()
        XCTAssertEqual(nums, "1, 2, 3")
        let anyArray = numArray as Any
        let t = type(of: anyArray)
        print(t)
        let stringArray: DelimArray<String> = ["a","b","c"]
        let strings = stringArray.toString(",")
        XCTAssertEqual(strings, "a,b,c")
        let boolRA: DelimArray<Bool> = [true, false, true]
        let bools = boolRA.toString("|")
        XCTAssertEqual(bools, "true|false|true")
//        XCTAssertEqual(t, "DelimArray<T>")
    }

}
