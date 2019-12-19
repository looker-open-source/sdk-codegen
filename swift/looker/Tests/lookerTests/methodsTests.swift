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

    func jsonEncode(_ object: Any?) -> Data? {
        if let object = object {
            return try? JSONSerialization.data(withJSONObject: object, options:[])
        }
        return nil
    }
    
    struct WriteQuery2: Codable {
        var model: String
        var view: String
    }
    
    func testQuery() {
//        let settings = config!
//        let xp = BaseTransport(settings)
//        let auth = AuthSession(settings, xp)
//        let sdk = LookerSDK(auth)
//        let body = WriteQuery(model: "thelook", view: "users")
        let body = WriteQuery2(model: "thelook", view: "users")
        let json = jsonEncode(body)
        XCTAssertNotNil(json)
//        let result: SDKResponse<Query, SDKError> = sdk.post("/queries",
//            ["fields": nil], body, nil)

//        let req = sdk.create_query(body: body)
//        let query = sdk.ok(req)
//        let result = sdk.ok(sdk.run_query(query.id!, "sql"))
//        XCTAssertNotNil(result)
//        XCTAssertTrue(result.contains("SELECT"))
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

    func testGetAllUsers() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let users = sdk.ok(sdk.all_users())
        XCTAssertNotNil(users)
        XCTAssertTrue(users.count > 0, "\(users.count) users found")
        for item in users {
            let user = sdk.ok(sdk.user(item.id!))
            XCTAssertNotNil(user)
            XCTAssertEqual(user.id, item.id)
        }
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
        XCTAssertTrue(list.count > 0, "\(list.count) users found")
        _ = sdk.authSession.logout()
    }

    func testGetAllLooks() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_looks())
        XCTAssertNotNil(list)
        XCTAssertTrue(list.count > 0, "\(list.count) looks")
        for item in list {
            let look = sdk.ok(sdk.look(item.id!))
            XCTAssertNotNil(look)
            XCTAssertEqual(item.id!, look.id!)
        }
        _ = sdk.authSession.logout()
    }
    
    func testGetDashboard() {
        let id = "60"
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        BaseTransport.debugging = true
        let item = sdk.ok(sdk.dashboard(id))
        XCTAssertNotNil(item)
        XCTAssertNotNil(item.id!.getString())
    }
    
    func testGetAllDashboards() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_dashboards())
        for item in list {
            let id = item.id!.getString()
//            let dashboard = sdk.ok(sdk.dashboard(id))
            print("Dashboard: \(id)")
            let dashboard = sdk.ok(sdk.dashboard(id)) //, fields:Safe.Dashboard))
            XCTAssertNotNil(dashboard, "Dashboard \(id) should be gotten")
            XCTAssertEqual(id, dashboard.id!.getString())
            if (dashboard.created_at == nil) {
                print("Dashboard \(id) created_at is nil")
            }
        }
        _ = sdk.authSession.logout()

    }

    func testGetAllSpaces() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_spaces())
        XCTAssertNotNil(list)
        XCTAssertTrue(list.count > 0, "\(list.count) spaces")
        for item in list {
            let actual = sdk.ok(sdk.space((item.id?.getString())!))
            XCTAssertNotNil(actual)
            let id = actual.id?.getString()
            XCTAssertEqual(item.id?.getString(), id!)
        }
        _ = sdk.authSession.logout()
    }
    
    func testGetAllFolders() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_folders())
        XCTAssertNotNil(list)
        XCTAssertTrue(list.count > 0, "\(list.count) folders")
        for item in list {
            let actual = sdk.ok(sdk.folder((item.id?.getString())!))
            XCTAssertNotNil(actual)
            let id = actual.id?.getString()
            XCTAssertEqual(item.id?.getString(), id!)
        }
        _ = sdk.authSession.logout()
    }

}
