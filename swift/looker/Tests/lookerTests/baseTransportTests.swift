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

fileprivate let rootPath = URL(fileURLWithPath: #file).pathComponents
    .prefix(while: { $0 != "swift" })
    .joined(separator: "/").dropFirst()

fileprivate let testRootPath: String = rootPath + "/test"
fileprivate let repoPath : String = rootPath + ""
fileprivate let localIni : String = ProcessInfo.processInfo.environment["LOOKERSDK_INI"] ?? (repoPath + "looker.ini")

class TestApiConfig: ApiConfig {
    override func readConfig(_ section: String? = nil) -> IApiSection {
        var result = super.readConfig(section)
        result["client_id"] = "test_client_id"
        result["redirect_uri"] = "looker://"
        return result
    }
}

@available(OSX 10.15, *)
class TestConfig {

    var rootPath = repoPath
    var testPath = testRootPath
    lazy var dataFile = testFile("data.yml.json")
    lazy var localIni = envVar("LOOKERSDK_INI", self.rootFile("looker.ini"))!
    lazy var dataContents = try! Data(String(contentsOfFile: dataFile).utf8)
    lazy var testData = try! JSONDecoder().decode([String: AnyCodable].self, from: dataContents)
    lazy var testIni = rootFile((testData["iniFile"]?.value as! String))
    lazy var settings = try! ApiConfig(localIni, "Looker")
    lazy var testsettings = try! TestApiConfig(testIni)
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
