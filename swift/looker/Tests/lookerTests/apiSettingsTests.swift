//
//  apiSettingsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/8/19.
//

import XCTest
@testable import looker

class apiSettingsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testBlankValueettings() {
        let settings = ValueSettings([:])
        XCTAssertEqual(settings.api_version, "3.1")
        XCTAssertEqual(settings.base_url, "")
        XCTAssertEqual(settings.verify_ssl, true)
        XCTAssertEqual(settings.timeout, defaultTimeout)
    }

    func testPassedValueSettings() {
        let settings = ValueSettings([
            strLookerApiVersion:"3.0",
            strLookerBaseUrl:"base",
            strLookerVerifySsl:"0",
            strLookerTimeout:"60"
        ])
        XCTAssertEqual(settings.api_version, "3.0")
        XCTAssertEqual(settings.base_url, "base")
        XCTAssertEqual(settings.verify_ssl, false)
        XCTAssertEqual(settings.timeout, 60)
    }
        
    func testApiSettingInit() {
        let settings = try? ApiSettings(((
            api_version: "3.0",
            base_url: "base",
            verify_ssl: false,
            timeout: 60
            ) as? IApiSettings))
        // TODO how do I avoid all these `settings?`. refs?
        XCTAssertEqual(settings?.api_version, "3.0")
        XCTAssertEqual(settings?.base_url, "base")
        XCTAssertEqual(settings?.verify_ssl, false)
        XCTAssertEqual(settings?.timeout, 60)
    }
}
