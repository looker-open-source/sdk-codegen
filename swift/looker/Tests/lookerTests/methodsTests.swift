//
//  methodsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/28/19.
//

import XCTest
@testable import looker

@available(OSX 10.15, *)
class methodsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testMe() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let me = sdk.ok(sdk.me())
        XCTAssertNotNil(me)
        _ = sdk.authSession.logout()
    }

    func testUserSearch() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.search_users(
            first_name:"%",
            last_name:"%"))
        XCTAssertNotNil(list)
        _ = sdk.authSession.logout()
    }

    func testLook() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let look = sdk.ok(sdk.look(1))
        XCTAssertNotNil(look)
        _ = sdk.authSession.logout()
    }
    
    func testAllLooks() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_looks(fields:"id,title"))
        XCTAssertNotNil(list)
        _ = sdk.authSession.logout()
    }
    
    func testAllDashboards() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_dashboards(fields:"id,title,description,hidden,model,user_id"))
        XCTAssertNotNil(list)
        _ = sdk.authSession.logout()
    }
    
    func testGetDashboard() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let dashboard = sdk.ok(sdk.dashboard("2")) //, fields:"id,title"))
        XCTAssertNotNil(dashboard)
        _ = sdk.authSession.logout()

    }
}
