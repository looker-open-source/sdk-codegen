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

let config = try? ApiConfig(localIni)

TODO create TestConfig() based on Kotlin or Typescript's version

typealias jsonDict = Map<String, Any>
val jsonDictType = object : TypeToken<jsonDict>() {}.type

open class TestConfig() {
    val rootPath: String = File("./").absoluteFile.parentFile.parentFile.absolutePath
    val testPath  = "${rootPath}/test"
    val dataFile = testFile("data.yml.json")
    val envIni = System.getenv("LOOKERSDK_INI")
    val localIni = if (envIni === null) rootFile("looker.ini") else envIni
    private val gson = Gson()
    private val dataContents = File(dataFile).readText()
    val testData = gson.fromJson<jsonDict>(dataContents, jsonDictType)
    val testIni = rootFile(testData.get("iniFile") as String)
    val configContents = File(localIni).readText()
    val config = apiConfig(configContents)
    val section = config["Looker"]
    val baseUrl = section?.get("base_url")
    val timeout = section?.get("timeout")?.toInt(10)
    val testContents = File(testIni).readText()
    val testConfig = apiConfig(testContents)
    val testSection = testConfig["Looker"]
//    return {
//        rootPath,
//        testPath,
//        dataFile,
//        localIni,
//        baseUrl,
//        timeout,
//        testData,
//        testIni,
//        configContents,
//        testConfig,
//        testSection,
//    }

    fun rootFile(fileName: String): String {
        return "${rootPath}/${fileName}"
    }

    fun testFile(fileName: String) : String {
        return "${testPath}/${fileName}"
    }
}


@available(OSX 10.12, *)
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
    
    func testPlainLogin() {
        let settings = config!
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
