//
//  AppDelegate.swift
//  sample-swift-sdk
//

import UIKit

@UIApplicationMain

class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var sdk: LookerSDK!
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        let config = ApiConfig()
        // In the scheme make sure to set
        // LOOKERSDK_BASE_URL to the API server url
        // LOOKER_SDK_API_VERSION to 4.0
        // LOOKERSDK_CLIENT_ID to the API client id
        // LOOKERSDK_CLIENT_SECRET to the 
        // as environment variables
        let xp = BaseTransport(config)
        let auth = AuthSession(config, xp)

        sdk = LookerSDK(auth)
        
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }


}

