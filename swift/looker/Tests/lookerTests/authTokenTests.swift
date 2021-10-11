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

class authTokenTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testIsInactiveByDefault() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        let auth = AuthToken()
        XCTAssertEqual(auth.isActive(), false, "auth should not be active")
    }

    func testIsActiveWithToken() {
        // TODO figure out how to init protocol and pass it in
        let auth = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 30))
        XCTAssertEqual(auth.isActive(), true, "auth should be active")
        //        let auth = AuthToken("thisismytoken", "bearer", 30)
        //        XCTAssertEqual(auth.isActive(), true)
    }

    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }

    func testLagTime() {
        var actual = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 9))
        XCTAssertEqual(actual.isActive(), false, "9 seconds should be inactive")
        actual = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 11))
        XCTAssertEqual(actual.isActive(), true, "11 seconds should be inactive")

    }
}
