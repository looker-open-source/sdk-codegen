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

class baseTransportTests: XCTestCase {
    
    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
        
    func testPlainRelativePath() {
        let settings = config!
        let xp = BaseTransport(settings)
        let requestPath = "/versions"
        let response = xp.plainRequest(HttpMethod.GET, requestPath, nil, nil, nil, nil)
        XCTAssertNotNil(response)
        XCTAssertNotNil(response.data, "Data assigned")
        XCTAssertNotNil(response.response, "Response assigned")
        XCTAssertNil(response.error, "No error")
        let json = try? JSONSerialization.jsonObject(with: response.data!, options: [])
        XCTAssertNotNil(json)
        let val = String(decoding: response.data!, as: UTF8.self)
        XCTAssertNotNil(val)
        XCTAssertTrue(val.contains("looker_release_version"))
    }
    
    func testPlainAbsolutePath() {
        let settings = config!
        let xp = BaseTransport(settings)
        let requestPath = settings.base_url! + "/versions"
        let response = xp.plainRequest(HttpMethod.GET, requestPath, nil, nil, nil, nil)
        XCTAssertNotNil(response)
        XCTAssertNotNil(response.data, "Data assigned")
        XCTAssertNotNil(response.response, "Response assigned")
        XCTAssertNil(response.error, "No error")
        let json = try? JSONSerialization.jsonObject(with: response.data!, options: [])
        XCTAssertNotNil(json)
        let val = String(decoding: response.data!, as: UTF8.self)
        XCTAssertNotNil(val)
        XCTAssertTrue(val.contains("looker_release_version"))
    }
    
}
