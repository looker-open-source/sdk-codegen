//
//  ContentView.swift
//  sample-swift-sdk
//

import SwiftUI

struct MainView: View {
    @State var dashboards = Dashboards().all
    
    var body: some View {
        List(dashboards) { dashboard in
            HStack() {
                Text(String(dashboard.id))
                Text(dashboard.title)
            }
        }
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
