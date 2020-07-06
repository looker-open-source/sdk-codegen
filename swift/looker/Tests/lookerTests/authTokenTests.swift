//
//  authTokenTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/8/19.
//

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
