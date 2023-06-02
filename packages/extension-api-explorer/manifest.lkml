project_name: "api-explorer"

application: api-explorer {
  label: "API Explorer"
  # file: "bundle.js"
  url: "https://localhost:8080/dist/bundle.js"
  entitlements: {
     local_storage: yes
     navigation: no
     new_window: yes
     new_window_external_urls: ["https://looker.com/*", "https://developer.mozilla.org/*", "https://docs.looker.com/*"]
     raw_api_request: yes
     use_form_submit: yes
     use_embeds: yes
     use_clipboard: yes
     core_api_methods: ["versions", "api_spec"]
     external_api_urls : ["https://raw.githubusercontent.com","http://localhost:30000","https://localhost:8080","https://static-a.cdn.looker.app","https://docs.looker.com","https://developer.mozilla.org/"]
     oauth2_urls: []
  }
}

constant: CONNECTION_NAME {
  value: ""
  export: override_optional
}
