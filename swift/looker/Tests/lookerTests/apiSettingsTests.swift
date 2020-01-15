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
    
    func testBlankValueSettings() {
        let settings = ValueSettings([:])
        XCTAssertEqual(settings.api_version, defaultApiVersion)
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
        
    func testQuotedValueSettings() {
        let settings = ValueSettings([
            strLookerApiVersion:"`3.0`",
            strLookerBaseUrl:"'base'",
            strLookerVerifySsl:"0",
            strLookerTimeout:"\"60\""
        ])
        XCTAssertEqual(settings.api_version, "3.0")
        XCTAssertEqual(settings.base_url, "base")
        XCTAssertEqual(settings.verify_ssl, false)
        XCTAssertEqual(settings.timeout, 60)
    }
    
    func testDefaultSetting() {
        let actual = DefaultSettings(
            base_url: "base",
            api_version: "3.0",
            verify_ssl: false,
            timeout: 60
        )
        XCTAssertEqual(actual.api_version, "3.0")
        XCTAssertEqual(actual.base_url, "base")
        XCTAssertEqual(actual.verify_ssl, false)
        XCTAssertEqual(actual.timeout, 60)
    }
    
    func testApiSettingInit() {
        let settings = try? ApiSettings(
            DefaultSettings(
                base_url: "base",
                api_version: "3.0",
                verify_ssl: false,
                timeout: 60
            )
        )
        // TODO how do I avoid all these `settings?`. refs?
        XCTAssertEqual(settings?.api_version, "3.0")
        XCTAssertEqual(settings?.base_url, "base")
        XCTAssertEqual(settings?.verify_ssl, false)
        XCTAssertEqual(settings?.timeout, 60)
    }
}
