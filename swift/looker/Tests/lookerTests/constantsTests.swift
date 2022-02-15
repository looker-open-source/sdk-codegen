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

@available(OSX 10.15, *)
class constantsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testStringBool() {
        XCTAssertEqual("".bool, nil)
        XCTAssertEqual("boo".bool, nil)
        XCTAssertEqual("1".bool, true)
        XCTAssertEqual("Y".bool, true)
        XCTAssertEqual("yes".bool, true)
        XCTAssertEqual("0".bool, false)
        XCTAssertEqual("n".bool, false)
        XCTAssertEqual("NO".bool, false)
    }

    func testStringInt() {
        XCTAssertEqual("".int, nil)
        XCTAssertEqual("0".int, 0)
        XCTAssertEqual("1".int, 1)
        XCTAssertEqual("-1".int, -1)
        XCTAssertEqual("6,000".int, nil, "6,000 doesn't cast to Int")
        XCTAssertEqual("6000".int, 6000)
        XCTAssertEqual("-i".int, nil)
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
