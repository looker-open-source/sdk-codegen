//
//  testApiConfig.swift
//  lookerTests
//
//  Created by John Kaster on 10/14/19.
//

import XCTest
@testable import looker

fileprivate let testRootPath = URL(fileURLWithPath: #file).pathComponents
    .prefix(while: { $0 != "Tests" }).joined(separator: "/").dropFirst()

fileprivate let repoPath : String = testRootPath + "/../../"
fileprivate let localIni : String = repoPath + "looker.ini"

class testApiConfig: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testApiConfigFile() {
        let config = try? ApiConfig(localIni)
        XCTAssertEqual(config?.api_version, "3.1")
        XCTAssertEqual(config?.base_url, "https://self-signed.looker.com:19999")
        XCTAssertFalse((config?.verify_ssl!)!)
        XCTAssertEqual(config?.timeout, 31)
    }

}
