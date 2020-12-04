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
    
    func testMe() {
        let me = try! sdk.ok(sdk.me())
        XCTAssertNotNil(me)
        if let auth = sdk.authSession as? IAuthSession {
            if let authToken = try? auth.getToken() {
            let token = AccessToken(
                access_token: authToken.access_token,
                token_type: authToken.token_type,
                expires_in: authToken.expires_in,
                refresh_token: authToken.refresh_token)
                _ = sdk.authSession.setToken(token)
            }
        }
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
    
    func testGetAllLooks() {
        let result = listGetter(
            lister: { sdk.all_looks() },
            getId: { item in item.id! },
            getEntity: { (id, fields) in sdk.look(id, fields:fields)}
        )
        XCTAssertEqual("", result, result)
    }
    
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

