//
//  Dashboards.swift
//  sample-swift-sdk
//

import Foundation
import UIKit

struct Dashboards {
    var all:[DashboardModel] = []
    
    // Create struct that inherits identifiable for view
    struct DashboardModel: Identifiable {
        var id: Int64
        var title: String
        
        init(id: Int64, title: String) {
            self.id = id
            self.title = title
        }
    }
    
    init() {
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        let sdk = appDelegate.sdk!
        
        // Grab the title and the content_metadata_id from the results
        for dashboard in sdk.ok(sdk.all_dashboards(fields: "title,content_metadata_id")) {
            all.append(DashboardModel(id: dashboard.content_metadata_id ?? 0, title: dashboard.title ?? ""))
        }
    }
}
