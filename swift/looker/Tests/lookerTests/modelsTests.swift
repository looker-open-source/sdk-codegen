//
//  modelsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/29/19.
//

import XCTest

@testable import looker

let jsonUser = #"""
{"avatar_url":"https://gravatar.lookercdn.com/avatar/b43233285920a00e57afc39645990ff8?s=156\u0026d=blank","avatar_url_without_sizing":"https://gravatar.lookercdn.com/avatar/b43233285920a00e57afc39645990ff8?d=blank","credentials_api3":[{"id":1,"client_id":"8GMCtkjqwcNHrYMS56qj","created_at":"2018-03-15T13:16:34.692-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/1","can":{}},{"id":2,"client_id":"MwTqW8bzShCs5v5xhRgV","created_at":"2018-07-25T15:08:47.177-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/2","can":{}},{"id":3,"client_id":"vrbmjbbCQcbMxX85DNKk","created_at":"2018-07-25T15:55:10.997-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/3","can":{}},{"id":4,"client_id":"ZfzcH9MR9k5m5zPM4Qjc","created_at":"2018-08-01T18:27:32.114-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/4","can":{}},{"id":5,"client_id":"SSTnPRGrKbMDXjf7Q6N2","created_at":"2018-08-02T12:29:48.655-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/5","can":{}},{"id":6,"client_id":"PNvnYd88DK4vGMpQ96kZ","created_at":"2018-08-02T13:32:43.836-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/6","can":{}},{"id":7,"client_id":"5ffJjVKF7rvq9mnDs6QJ","created_at":"2018-12-19T14:20:06.498-08:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/7","can":{}},{"id":8,"client_id":"DcHCzdHKmJwkrdX7DZwZ","created_at":"2019-01-30T16:51:24.201-08:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/8","can":{}},{"id":9,"client_id":"B8M9nty4Jhgcw9nTcw5Y","created_at":"2019-03-15T19:40:13.420-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/9","can":{}},{"id":10,"client_id":"PrJmzcCGdJksGqc5qRCq","created_at":"2019-03-18T10:35:00.065-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/10","can":{}},{"id":11,"client_id":"ZkXtT6brKSkxB2H2BTK5","created_at":"2019-03-26T20:55:20.232-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/11","can":{}}],"credentials_email":{"created_at":"2017-07-18T09:31:05.778-07:00","logged_in_at":"2019-09-25T07:07:20.028-07:00","type":"email","email":"john.kaster@looker.com","forced_password_reset_at_next_login":false,"is_disabled":false,"password_reset_url":null,"url":"https://localhost:19999/api/3.1/users/1/credentials_email","user_url":"https://localhost:19999/api/3.1/users/1","can":{"show_password_reset_url":true}},"credentials_embed":[],"credentials_google":null,"credentials_ldap":null,"credentials_looker_openid":null,"credentials_oidc":null,"credentials_saml":null,"credentials_totp":{"created_at":"2018-07-02T15:36:07.800-07:00","type":"two-factor","verified":false,"is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_totp","can":{}},"email":"john.kaster@looker.com","first_name":"John","home_space_id":"1","id":1,"last_name":"Kaster","locale":"psbrackets_pseudo","looker_versions":["4.19.0","4.21.0","4.23.0","5.1.0","5.11.0","5.13.0","5.15.0","5.17.0","5.19.0","5.21.0","5.22.3","5.23.0","5.25.0","5.3.0","5.5.0","5.7.0","5.9.0","6.1.0","6.11.0","6.15.0","6.17.0","6.19.0","6.2.0","6.21.0","6.23.0","6.3.0","6.5.0","6.7.0","6.9.0"],"models_dir_validated":false,"personal_space_id":5,"ui_state":{"homepageGroupIdPreference":1},"embed_group_space_id":null,"home_folder_id":"1","personal_folder_id":5,"presumed_looker_employee":true,"sessions":[],"verified_looker_employee":false,"roles_externally_managed":false,"display_name":"John Kaster","group_ids":[1,3],"is_disabled":false,"role_ids":[2],"url":"https://localhost:19999/api/3.1/users/1","can":{"show":true,"index":true,"show_details":true,"index_details":true,"sudo":false}}
"""#

class modelsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testUser() {
        do {
            let user : User = try deserialize(jsonUser)
            XCTAssertNotNil(user)
        } catch {
            // Trying to figure out what's causing the deserialization error
            print(error)
            XCTAssertNil(error)
        }
    }

}
