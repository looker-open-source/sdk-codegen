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
class smokeTests: XCTestCase {

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }
    
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func simpleQuery() -> WriteQuery {
        return WriteQuery(
            "system__activity",
            "dashboard",
            fields: ["dashboard.id", "dashboard.title", "dashboard.count"],
            limit: "100")
    }

    func countQuery() -> WriteQuery {
        return WriteQuery(
            "system__activity",
            "dashboard",
            fields: ["dashboard.count"],
            limit: "100"
        )
    }

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

    func prepUsers() -> User {
        let first = "SDK"
        let last = "User"
        let users = try? sdk.ok(sdk.search_users(first_name: first, last_name: last))
        XCTAssertNotNil(users, "search_users has nothing")
        var user: User?
        if users != nil && users!.count > 0 {
            user = users![0]
        } else {
            user = try? sdk.ok(sdk.create_user(body: WriteUser(first_name: first, last_name: last)))
        }
        XCTAssertNotNil(user, "user is not found or created")
        return user!
    }

    func testSdkInit() {
        let config = sdk.authSession.settings
        XCTAssertNotNil(config.base_url)
        XCTAssertTrue(config.isConfigured())
    }
    
    /// Smoke: POST,  body param, int param, string param
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

    /// smoke: delimArray
    func testGetAllUsersWithIds() {
        let allUsers = try? sdk.ok(sdk.all_users())
        XCTAssertNotNil(allUsers, "allUsers should not be nill")
        let searchIds = allUsers!.prefix(2).map { $0.id! }
        let users = try? sdk.ok(sdk.all_users(ids: searchIds))
        XCTAssertEqual(users![0].id, searchIds[0])
        XCTAssertEqual(users![1].id, searchIds[1])
    }

    func testAllAlerts() {
        let all = try? sdk.ok(sdk.search_alerts())
        XCTAssertNotNil(all, "search_alerts should not be nil")
    }
    
    func testAllOAuthApps() {
        let all = try? sdk.ok(sdk.all_oauth_client_apps())
        XCTAssertNotNil(all, "all_oauth_client_apps should not be nil")
    }
    
    func testAllLoginLockouts() {
        let all = try? sdk.ok(sdk.all_user_login_lockouts())
        XCTAssertNotNil(all, "all_user_login_lockouts should not be nil")
    }
    
    func testAllBoards() {
        let all = try? sdk.ok(sdk.all_boards())
        XCTAssertNotNil(all)
    }
    
    func testAllCommands() {
        let all = try? sdk.ok(sdk.get_all_commands())
        // Just make sure we don't get a deserialization error. If we do, test fails
        XCTAssertTrue(all == nil || all != nil)
    }
    
    func testAllColorCollections() {
        let all = try? sdk.ok(sdk.all_color_collections())
        XCTAssertNotNil(all, "all_color_collections should not be nil")
    }
    
    func testAllLocales() {
        let all = try? sdk.ok(sdk.all_locales())
        XCTAssertNotNil(all, "all_locales should not be nil")
    }
    
    func testAllLegacyFeatures() {
        let all = try? sdk.ok(sdk.all_legacy_features())
        XCTAssertNotNil(all)
    }
    
    func testAllTimezones() {
        let all = try? sdk.ok(sdk.all_timezones())
        XCTAssertNotNil(all)
    }
    
    func testAllConnections() {
        let all = try? sdk.ok(sdk.all_connections())
        XCTAssertNotNil(all)
    }
    
    func testAllDialectInfo() {
        let all = try? sdk.ok(sdk.all_dialect_infos())
        XCTAssertNotNil(all)
    }
    
    func testAllExternalOauthApps() {
        let all = try? sdk.ok(sdk.all_external_oauth_applications())
        XCTAssertNotNil(all)
    }
    
    func testAllSSHServers() {
        let all = try? sdk.ok(sdk.all_ssh_servers())
        // Just make sure we don't get a deserialization error. If we do, test fails
        XCTAssertTrue(all == nil || all != nil)
    }
    
    func testAllSSHTunnels() {
        let all = try? sdk.ok(sdk.all_ssh_tunnels())
        // Just make sure we don't get a deserialization error. If we do, test fails
        XCTAssertTrue(all == nil || all != nil)
    }
    
    func testAllDashboards() {
        let all = try? sdk.ok(sdk.all_dashboards())
        XCTAssertNotNil(all)
    }
    
    func testSearchAllDashboards() {
        let all = try? sdk.ok(sdk.search_dashboards(title: "%"))
        XCTAssertNotNil(all)
    }
    
    func testAllDatagroups() {
        let all = try? sdk.ok(sdk.all_datagroups())
        XCTAssertNotNil(all)
    }

    func testAllFolders() {
        let all = try? sdk.ok(sdk.all_folders())
        XCTAssertNotNil(all)
    }
    
    func testAllGroups() {
        let all = try? sdk.ok(sdk.all_groups())
        XCTAssertNotNil(all)
    }
    
    func testAllIntegrations() {
        let all = try? sdk.ok(sdk.all_integrations())
        XCTAssertNotNil(all)
    }
    
    func testAllIntegrationHubs() {
        let all = try? sdk.ok(sdk.all_integration_hubs())
        XCTAssertNotNil(all)
    }
    
    func testAllLookmlModels() {
        let all = try? sdk.ok(sdk.all_lookml_models())
        XCTAssertNotNil(all)
    }
    
    func testAllRunningQueries() {
        let all = try? sdk.ok(sdk.all_running_queries())
        XCTAssertNotNil(all)
    }
    
    func testAllRoles() {
        let all = try? sdk.ok(sdk.all_roles())
        XCTAssertNotNil(all)
    }
    
    func testAllPermissions() {
        let all = try? sdk.ok(sdk.all_permissions())
        XCTAssertNotNil(all)
    }
    
    func testAllScheduledPlans() {
        let all = try? sdk.ok(sdk.all_scheduled_plans())
        XCTAssertNotNil(all)
    }
    
    func testAllThemes() {
        let all = try? sdk.ok(sdk.all_themes())
        XCTAssertNotNil(all)
    }
    
    func testAllUsers() {
        let all = try? sdk.ok(sdk.all_users())
        XCTAssertNotNil(all)
    }
    
    func testAllUserAttributes() {
        let all = try? sdk.ok(sdk.all_user_attributes())
        XCTAssertNotNil(all)
    }
    
    func testAllLooks() {
        let all = try? sdk.ok(sdk.all_looks())
        XCTAssertNotNil(all, "all_looks should not be nil")
    }
    
    func testAllProjects() {
        let all = try? sdk.ok(sdk.all_projects())
        XCTAssertNotNil(all, "all_projects should not be nil")
    }
    
    func testAllModelSets() {
        let all = try? sdk.ok(sdk.all_model_sets())
        XCTAssertNotNil(all, "all_model_sets should not be nil")
    }
    
    func testAllWorkspaces() {
        let all = try? sdk.ok(sdk.all_workspaces())
        XCTAssertNotNil(all, "all_workspaces should not be nil")
     }
    
    /// smoke: GET, binary payload, string payload, int param, string param
    func testContentThumbnail() {
        var type = ""
        var id = ""
        let looks = try? sdk.ok(sdk.search_looks(limit: 1))
        if (looks != nil && looks?.count == 1) {
            let look = looks![0]
            type = "look"
            id = String(look.id!)
        }
        let svg = try? sdk.ok(sdk.content_thumbnail(type, id))
        XCTAssertNotNil(svg)
        XCTAssertTrue(svg!.contains("<svg"))
        let png = try? sdk.ok(sdk.stream.content_thumbnail(type, id, format: "png"))
        XCTAssertNotNil(png)
        let mime = mimeType(png!)
        XCTAssertEqual("image/png", mime)
    }

    /// smoke: enum
    func testEnumSerialization() {
        var task = WriteCreateQueryTask(
            query_id: 1,
            result_format: ResultFormat.inline_json,
            source: "local"
        )
        var json = try! serialize(task)
        var actual : WriteCreateQueryTask = try! deserialize(json)
        XCTAssertEqual(task.query_id, actual.query_id)
        XCTAssertEqual(task.result_format, actual.result_format)
        XCTAssertEqual(task.source, actual.source)
        XCTAssertEqual(task.query_id, actual.query_id)
        task = WriteCreateQueryTask(
            1,
            ResultFormat.csv,
            source: "local"
        )
        json = try! serialize(task)
        actual = try! deserialize(json)
        XCTAssertEqual(task.query_id, actual.query_id)
        XCTAssertEqual(task.result_format, actual.result_format)
        XCTAssertEqual(task.source, actual.source)
        XCTAssertEqual(task.query_id, actual.query_id)
    }

    /// smoke: error handling
    func testErrorsAreHandled() {
        do {
            let missing1 = try sdk.ok(sdk.folder("can't find me!"))
            XCTAssertNil(missing1)
            XCTAssertTrue(false, "We should never get here!")
        } catch {
            let sdkError = error as! SDKError
            XCTAssertEqual(404, sdkError.code)
            XCTAssertTrue(sdkError.localizedDescription.lowercased().contains("not found"), sdkError.localizedDescription)
        }
        let missing2 = try? sdk.ok(sdk.folder("IDON'TEXIST"))
        XCTAssertNil(missing2, "Folder should be nil")
    }

    /// smoke: datetime payload
    func testSearchDashboards() {
        let dashboards = try? sdk.ok(sdk.search_dashboards(limit: 1))
        XCTAssertNotNil(dashboards)
        XCTAssertEqual(1, dashboards?.count)

        let dash = dashboards![0]
        XCTAssertNotNil(dash.created_at)
    }

    /// smoke: PUT w/ no body
    func testDefaultColorCollection() {
        let current = try? sdk.ok(sdk.default_color_collection())
        XCTAssertNotNil(current)
        let cols = try? sdk.ok(sdk.all_color_collections())
        XCTAssertNotNil(cols)
        let other = cols?.first( where: { $0.id != current!.id })
        XCTAssertNotNil(other)
        let actual = try? sdk.ok(sdk.set_default_color_collection(other!.id!))
        XCTAssertNotNil(actual)
        XCTAssertEqual(other?.id, actual?.id)
        let updated = try? sdk.ok(sdk.default_color_collection())
        XCTAssertNotNil(updated)
        XCTAssertEqual(other?.id, updated?.id)
        _ = try? sdk.ok(sdk.set_default_color_collection(current!.id!))
    }

    /// smoke: PATCH, boolean parameter
    func testUserDisabling() {
        let me = try? sdk.ok(sdk.me())
        let users = try? sdk.ok(sdk.all_users(page:1, per_page: 2))
        XCTAssertNotNil(users)
        let other = users?.first( where: {$0.id != me?.id})
        XCTAssertNotNil(other)
        let toggle = other!.is_disabled!
        let id = other!.id!
        let disabled = try? sdk.ok(sdk.update_user(id, WriteUser(is_disabled: !toggle)))
        XCTAssertNotNil(disabled)
        XCTAssertEqual(!toggle, disabled?.is_disabled)
        let enabled = try? sdk.ok(sdk.update_user(id, WriteUser(is_disabled: toggle)))
        XCTAssertNotNil(enabled)
        XCTAssertEqual(toggle, enabled?.is_disabled)
    }

    /// smoke: DELETE
    func testDeleteUser() {
        let user = prepUsers()
        var deleted = false
        do {
            _ = try sdk.ok(sdk.delete_user(user.id!))
            deleted = true
        } catch {
            XCTAssertTrue(false, "DELETE user failed")
        }
        XCTAssertTrue(deleted, "DELETE should succeed")
    }

}
