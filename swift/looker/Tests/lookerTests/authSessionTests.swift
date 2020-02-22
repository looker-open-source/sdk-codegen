//
//  authSessionTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/25/19.
//

import XCTest
@testable import looker

@available(OSX 10.15, *)
class authSessionTests: XCTestCase {

    let config = TestConfig()
    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    // integration test against Looker instance to verify authSession handles basic authentication
    func testLogin() {
        let settings = config.config
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        XCTAssertFalse(auth.isAuthenticated(), "should not be authenticated")
        let token = auth.login()
        XCTAssertTrue(auth.isAuthenticated(), "should be authenticated")
        XCTAssertNotNil(token)
        XCTAssertNotNil(token.access_token, "access token should be assigned")
        XCTAssertNotNil(token.token_type, "token type should be assigned")
        _ = auth.logout()
        XCTAssertFalse(auth.isAuthenticated(), "should not be authenticated")
    }
    
}
