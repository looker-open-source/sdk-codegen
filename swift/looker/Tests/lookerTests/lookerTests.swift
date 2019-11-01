import XCTest
@testable import looker

// Good notes on async URLSession tests
// https://www.raywenderlich.com/960290-ios-unit-testing-and-ui-testing-tutorial
final class lookerTests: XCTestCase {
    func testExample() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct
        // results.
        XCTAssertEqual(looker().text, "Hello, SDK World!")
    }

    static var allTests = [
        ("testExample", testExample),
    ]
}
