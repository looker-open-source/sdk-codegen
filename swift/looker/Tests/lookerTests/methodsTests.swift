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
/*
    func swiftIsCrazy(_ object: Any?) -> Bool {
        if let object = object {
            return JSONSerialization.isValidJSONObject(object)
        }
        return false
    }

    func jsonEncode(_ object: Any?) -> Data? {
        if let object = object {
            if let data = object as? Data {
                return try? JSONEncoder().encode(data)
            } else {
                return try? JSONSerialization.data(withJSONObject: object, options:[.fragmentsAllowed])
            }
        }
        return nil
    }

    struct WriteQuery2: Codable {
        var model: String
        var view: String
    }

    func testAnyData() {
        var foo: Any?
        let body = WriteQuery2(model: "thelook", view: "users")
        do {
            foo = try JSONEncoder().encode(body)
            XCTAssertTrue(foo is Data, "foo is Data")
            if let data = foo as? Data {
                foo = String(data: data, encoding: .utf8)
                XCTAssertTrue(foo is String, "foo is String")
            } else {
                XCTAssertTrue(false, "foo is not data")
            }
        } catch { print(error) }
    }

    func testEncode() {
        do {
            let body = WriteQuery2(model: "thelook", view: "users")
            XCTAssertFalse(swiftIsCrazy(body), "Swift is indeed crazy")
            let jsonData = try JSONEncoder().encode(body)
            var jsonString = String(data: jsonData, encoding: .utf8)!
            XCTAssertEqual(jsonString, #"{"model":"thelook","view":"users"}"#)
//            let query: WriteQuery2 = try deserialize(jsonString)
//            XCTAssertEqual(query.model, "thelook")
//            XCTAssertEqual(query.view, "users")

            let json2 = jsonEncode(body)
            XCTAssertNotNil(json2)
            jsonString = String(data: json2!, encoding: .utf8)!
            XCTAssertEqual(jsonString, #"{"model":"thelook","view":"users"}"#)

        } catch { print(error) }
    }
*/

    func simpleQuery() -> WriteQuery {
        return WriteQuery(
            model: "system__activity",
            view: "dashboard",
            fields: ["dashboard.id", "dashboard.title", "dashboard.count"],
            limit: "100")
    }

    func countQuery() -> WriteQuery {
        return WriteQuery(
            model: "system__activity",
            view: "dashboard",
            fields: ["dashboard.count"],
            limit: "100"
        )
    }

    func testCreateQueryAndRun() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let body = simpleQuery()
        let req = sdk.create_query(body)
        var query = sdk.ok(req)
        let sql = sdk.ok(sdk.run_query(query.id!, "sql"))
        XCTAssertNotNil(sql)
        XCTAssertTrue(sql.contains("SELECT"), "Got the SQL select statement")
//        BaseTransport.debugging = true
        let csv = sdk.ok(sdk.run_query(query.id!, "csv"))
        XCTAssertNotNil(csv)
        XCTAssertTrue(csv.contains("Dashboard ID"), "Got the CSV header")
        query = sdk.ok(sdk.create_query(countQuery()))
        var json = sdk.ok(sdk.run_query(query.id!, "json"))
        XCTAssertNotNil(json)
        XCTAssertTrue(json.contains("dashboard.count"), "json result")
        /// May want to try https://learnappmaking.com/swift-json-swiftyjson/ or https://github.com/Flight-School/AnyCodable
        /// Or one of the options discussed at https://stackoverflow.com/questions/46279992/any-when-decoding-json-with-codable
        var jsonData = try? JSONSerialization.jsonObject(with: json.data(using: .utf8)!, options: .allowFragments)
        XCTAssertNotNil(jsonData)
        if let data = jsonData as! [[String:Int64]?]? {
            if let item = data[0] {
                XCTAssertTrue(item["dashboard.count"]! > 0, "dashboard.count > 0")
            } else {
                XCTAssertTrue(false, "Couldn't cast item from data")
            }
        } else {
            XCTAssertTrue(false, "Couldn't cast data from jsonData")
        }

        json = sdk.ok(sdk.run_query(query.id!, "json_label"))
        XCTAssertNotNil(json)
        XCTAssertTrue(json.contains("Dashboard Count"), "json_label result")
        jsonData = try? JSONSerialization.jsonObject(with: json.data(using: .utf8)!, options: .allowFragments)
        XCTAssertNotNil(jsonData)
        if let data = jsonData as! [[String:Int64]?]? {
            if let item = data[0] {
                XCTAssertTrue(item["Dashboard Count"]! > 0, "Dashboard Count > 0")
            } else {
                XCTAssertTrue(false, "Couldn't cast item from data")
            }
        } else {
            XCTAssertTrue(false, "Couldn't cast data from jsonData")
        }
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

    func testGetAllDashboards() {
        let settings = config!
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        let sdk = LookerSDK(auth)
        let list = sdk.ok(sdk.all_dashboards())
        for item in list {
            let id = item.id!
            print("Dashboard: \(id)")
            let dashboard = sdk.ok(sdk.dashboard(id))
            XCTAssertNotNil(dashboard, "Dashboard \(id) should be gotten")
            XCTAssertEqual(id, dashboard.id!)
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
            let actual = sdk.ok(sdk.space((item.id)!))
            XCTAssertNotNil(actual)
            let id = actual.id
            XCTAssertEqual(item.id, id!)
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
            let actual = sdk.ok(sdk.folder((item.id)!))
            XCTAssertNotNil(actual)
            let id = actual.id
            XCTAssertEqual(item.id, id!)
        }
        _ = sdk.authSession.logout()
    }

}
