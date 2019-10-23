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
    
    func getUrl(_ path: String, completion: @escaping (Data?, URLResponse?, Error?) -> ()) {
        let semi = DispatchSemaphore(value: 0)
        let url = URL(string: path)!
        //        let request = URLRequest(url: url) //, httpMethod: "GET")
        //        let config = URLSessionConfiguration.ephemeral
        let session = URLSession.shared //(configuration: config)
        let task = session.dataTask(with: url) { data, response, error in
            completion(data, response, error)
            // if let jsonObj = try? JSONSerialization.jsonObject(with: data!, options: .allowFragments) as? NSDictionary {
            //                friend_ids = (jsonObj!.value(forKey: "friends") as? NSArray)!
            //                completion(friend_ids) // Here's where we call the completion handler with the result once we have it
            //            }
            semi.signal()
        }
        task.resume()
        semi.wait()
    }
    
    func testGet() {
        let path = "https://google.com"
        var d: Data? = nil
        var r: URLResponse? = nil
        var e: Error? = nil
        getUrl(path, completion: {
            data, response, error in
            if (data != nil) {
                d = data
            }
            if (response != nil) {
                r = response
            }
            if (error != nil) {
                e = error
            }
            print("Boo!")
            print(data as Any)
            print(response as Any)
        })
        XCTAssertNotNil(d, "\(path) Data should be assigned")
        XCTAssertNotNil(r, "\(path) Response should be assigned")
        XCTAssertNil(e, "\(path) Error should not be assigned")
    }
    
    func testPlanRelativePath() {
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
    
    func testPlanAbsolutePath() {
        let settings = config!
        let xp = BaseTransport(settings)
        let requestPath = "https://google.com"
        let response = xp.plainRequest(HttpMethod.GET, requestPath, nil, nil, nil, nil)
        XCTAssertNotNil(response)
        XCTAssertNotNil(response.data, "Data assigned")
        XCTAssertNotNil(response.response, "Response assigned")
        XCTAssertNil(response.error, "No error")
    }
}
