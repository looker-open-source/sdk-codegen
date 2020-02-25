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
fileprivate let localIni : String = ProcessInfo.processInfo.environment["LOOKERSDK_INI"] ?? (repoPath + "looker.ini")


@available(OSX 10.15, *)
class TestConfig {
    
    var rootPath = repoPath
    var testPath = testRootPath
    lazy var dataFile = testFile("data.yml.json")
    lazy var localIni = envVar("LOOKERSDK_INI", self.rootFile("looker.ini"))!
    lazy var dataContents = try! Data(String(contentsOfFile: dataFile).utf8)
    lazy var testData = try! JSONSerialization.jsonObject(with: dataContents, options: []) as! AnyCodable
    lazy var testIni = rootFile((testData["iniFile"] as? String)!)
    lazy var settings = try! ApiConfig(localIni, "Looker")
    lazy var testsettings = try! ApiConfig(testIni)
    lazy var xp = BaseTransport(settings)
    lazy var auth = AuthSession(settings, xp)
    lazy var sdk = LookerSDK(auth)

    func rootFile(_ fileName: String) -> String {
        return "\(rootPath)/\(fileName)"
    }

    func testFile(_ fileName: String) -> String {
        return "\(testPath)/\(fileName)"
    }
}


@available(OSX 10.15, *)
class baseTransportTests: XCTestCase {
    
    let config = TestConfig()
    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
        
    func testPlainRelativePath() {
        let xp = BaseTransport(config.settings)
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
        let settings = config.settings
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
    
    func testPlainLogin() {
        let settings = config.settings
        let values = settings.readConfig()
        let client_id = values["client_id"]
        let client_secret = values["client_secret"]
        let xp = BaseTransport(settings)
        let path = "/login"
        let response = xp.plainRequest(
            HttpMethod.POST, path,
            ["client_id": client_id, "client_secret": client_secret], nil, nil, nil)
        XCTAssertNotNil(response)
        XCTAssertNotNil(response.data)
        let json = try? JSONSerialization.jsonObject(with: response.data!, options: [])
        XCTAssertNotNil(json)
        let val = String(decoding: response.data!, as: UTF8.self)
        XCTAssertNotNil(val)
        print(val)
        XCTAssertTrue(val.contains("token"))
    }
    
}
