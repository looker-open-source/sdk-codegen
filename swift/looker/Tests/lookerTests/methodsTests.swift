//
//  methodsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/28/19.
//

import XCTest
@testable import looker

@available(OSX 10.15, *)
let config = TestConfig()
@available(OSX 10.15, *)
let sdk = config.sdk

@available(OSX 10.15, *)
class methodsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

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
        let body = simpleQuery()
        let req = sdk.create_query(body)
        do {
        var query = try sdk.ok(req)
        let sql = try sdk.ok(sdk.run_query(query.id!, "sql"))
        XCTAssertNotNil(sql)
        XCTAssertTrue(sql.contains("SELECT"), "Got the SQL select statement")
//        BaseTransport.debugging = true
        let csv = try sdk.ok(sdk.run_query(query.id!, "csv"))
        XCTAssertNotNil(csv)
        XCTAssertTrue(csv.contains("Dashboard ID"), "Got the CSV header")
        query = try sdk.ok(sdk.create_query(countQuery()))
        var json = try sdk.ok(sdk.run_query(query.id!, "json"))
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

        json = try sdk.ok(sdk.run_query(query.id!, "json_label"))
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

        } catch {
            print(error)
        }

    }

    func testMe() {
        let me = try! sdk.ok(sdk.me())
        XCTAssertNotNil(me)
        _ = sdk.authSession.logout()
    }

    func testUserSearch() {
        let list = try? sdk.ok(sdk.search_users(
            first_name:"%",
            last_name:"%"))
        XCTAssertNotNil(list)
        XCTAssertTrue(list!.count > 0, "\(list!.count) users found")
        _ = sdk.authSession.logout()
    }

    func testErrorsAreHandled() {
        do {
            let missing1 = try sdk.ok(sdk.folder("can't find me!"))
            XCTAssertNil(missing1)
            XCTAssertTrue(false, "We should never get here!")
        } catch {
            let sdkError = error as! SDKError
            XCTAssertEqual(404, sdkError.code)
            XCTAssertTrue(sdkError.localizedDescription.contains("Not found"), sdkError.localizedDescription)
        }
        let missing2 = try? sdk.ok(sdk.folder("IDON'TEXIST"))
        XCTAssertNil(missing2, "Space should be nil")
    }

    /// generic list getter testing function
    func listGetter<TAll, TId, TEntity> (
        lister: () -> SDKResponse<[TAll], SDKError>,
        getId: (_ item: TAll) -> TId,
        getEntity: (_ id: TId, _ fields: String?) -> SDKResponse<TEntity, SDKError>,
        fields: String? = nil,
        maxErrors: Int = 3,
        track: Bool = false
    ) -> String {
        let entityName = String(describing: TEntity.self)
        let list = try? sdk.ok(lister())
        var errors = ""
        var errorCount = 0
        XCTAssertNotNil(list)
        XCTAssertNotEqual(0, list?.count, "Got \(entityName)s")
        if let all = list {
            for item in all {
                let id = getId(item)
                do {
                    let actual = try sdk.ok(getEntity(id, fields))
                    if (track) {
                        print("Got \(entityName) \(id)")
                    }
                    XCTAssertNotNil(actual, "\(entityName) \(id) should be assigned")
                } catch {
                    errorCount += 1
                    if (errorCount > maxErrors) { break }
                    errors += "Failed to get \(entityName) \(id)\nError: \(error.localizedDescription)\n"
                }
            }
        }
        if (!errors.isEmpty) {
            XCTAssertEqual(0, errors.count, errors)
        }
        return errors
    }

    func testGetAllUsers() {
        let result = listGetter(
            lister: { sdk.all_users() },
            getId: { item in item.id! },
            getEntity: { (id, fields) in sdk.user(id, fields:fields)}
        )
        XCTAssertEqual("", result, result)
    }

    func testGetAllUsersWithIds() {
        let allUsers = try? sdk.ok(sdk.all_users())
        let searchIds = allUsers!.prefix(2).map { $0.id! }
        let users = try? sdk.ok(sdk.all_users(ids: searchIds))
        XCTAssertEqual(users![0].id, searchIds[0])
        XCTAssertEqual(users![1].id, searchIds[1])
    }

    func testGetAllLooks() {
        let result = listGetter(
            lister: { sdk.all_looks() },
            getId: { item in item.id! },
            getEntity: { (id, fields) in sdk.look(id, fields:fields)}
        )
        XCTAssertEqual("", result, result)
    }

    // for >7.2
//    func testDashboardThumbnail() {
//        let settings = config.config
//        let xp = BaseTransport(settings)
//        let auth = AuthSession(settings, xp)
//        let sdk = LookerSDK(auth)
//        let svg = sdk.ok(sdk.vector_thumbnail("dashboard", "1"))
//        XCTAssertTrue(svg.contains("<svg"))
//    }

    func mimeType(_ data: Data) -> String {

//        var sig = [UInt8](repeating: 0, count: 20)
//        data.copyBytes(to: &sig, count: 20)
//        print(sig)
        var b: UInt8 = 0
        data.copyBytes(to: &b, count: 1)
        switch b {
        case 0xFF:
            return "image/jpeg"
        case 0x89:
            return "image/png"
        case 0x47:
            return "image/gif"
        case 0x4D, 0x49:
            return "image/tiff"
        case 0x25:
            return "application/pdf"
        case 0xD0:
            return "application/vnd"
        case 0x46:
            return "text/plain"
        default:
            return "application/octet-stream"
        }
    }

    // TODO resurrect this when the API bug is fixed
//    func testImageDownload() {
//        let body = simpleQuery()
//        let query = try! sdk.ok(sdk.create_query(body))
//        let png = try! sdk.ok(sdk.stream.run_query(query.id!, "png"))
//        XCTAssertNotNil(png)
//        XCTAssertEqual(mimeType(png), "image/png")
//        let jpg = try! sdk.ok(sdk.stream.run_query(query.id!, "jpg"))
//        XCTAssertNotNil(jpg)
//        XCTAssertNotEqual(png, jpg, "We should not be getting the same image")
//        XCTAssertEqual(mimeType(jpg), "image/jpeg should be returned not image/png. Smells like an API bug, not SDK issue")
//    }

    func testGetAllDashboards() {
        let result = listGetter(
            lister: { sdk.all_dashboards()},
            getId: { item in item.id! },
            getEntity: { (id, fields) in sdk.dashboard(id, fields:fields)}
        )
        XCTAssertEqual("", result, result)
    }

    func testGetAllFolders() {
        let result = listGetter(
            lister: { sdk.all_folders() },
            getId: { item in item.id! },
            getEntity: { (id, fields) in sdk.folder(id, fields:fields)}
        )
        XCTAssertEqual("", result, result)
    }

}

extension Data {
    enum ImageContentType: String {
        case jpg, png, gif, tiff, unknown

        var fileExtension: String {
            return self.rawValue
        }
    }

    var imageContentType: ImageContentType {

        var values = [UInt8](repeating: 0, count: 1)

        self.copyBytes(to: &values, count: 1)

        switch (values[0]) {
        case 0xFF:
            return .jpg
        case 0x89:
            return .png
        case 0x47:
           return .gif
        case 0x49, 0x4D :
           return .tiff
        default:
            return .unknown
        }
    }
}

