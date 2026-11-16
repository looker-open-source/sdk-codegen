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

    @available(OSX 10.12, *)
    func testStripsTrailingSlashesFromBaseUrl() {
        let valueSettings = ValueSettings([
            strLookerBaseUrl: "'https://my-instance.looker.com///'"
        ])
        XCTAssertEqual(valueSettings.base_url, "https://my-instance.looker.com")

        let apiSettings = try? ApiSettings(
            DefaultSettings(base_url: "https://my-instance.looker.com/")
        )
        XCTAssertEqual(apiSettings?.base_url, "https://my-instance.looker.com")

        let slashOnlySettings = try? ApiSettings(
            DefaultSettings(base_url: "///")
        )
        XCTAssertNil(slashOnlySettings)

        let rawSettings = DefaultSettings(base_url: "https://my-instance.looker.com/")
        let xp = BaseTransport(rawSettings)
        XCTAssertEqual(xp.makeUrl("/api/4.0/login"), "https://my-instance.looker.com/api/4.0/login")
        XCTAssertEqual(
            xp.makeUrl("/user", nil, { req in req }, rawSettings),
            "https://my-instance.looker.com/api/4.0/user"
        )
    }
}
