//
//  testBaseTransport.swift
//  lookerTests
//
//  Created by John Kaster on 10/18/19.
//

import XCTest
@testable import looker

fileprivate let testRootPath = URL(fileURLWithPath: #file).pathComponents
    .prefix(while: { $0 != "Tests" }).joined(separator: "/").dropFirst()

fileprivate let repoPath : String = testRootPath + "/../../"
fileprivate let localIni : String = repoPath + "looker.ini"

let config = try? ApiConfig(localIni)

class testBaseTransport: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testVersionsRequest() {
        let settings = config!
        let xp = BaseTransport(settings)
        let versionPath = "/versions"
        let response : String = try! SDKOk(xp.request(HttpMethod.GET, versionPath, nil, nil, nil, nil)) as! String
        XCTAssertNotNil(response)
    }

}
