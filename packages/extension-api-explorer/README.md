# Using the Looker API Explorer as an extension

The API Explorer extension can be manually installed and run with a Looker instance using the following steps:

1. create a new LookML project called `apix`
2. create a new model. In `apix.model`, put:
   ```lookml
   connection: "<any valid connection name>"
   ```
3. in `manifest.lkml` put:
   ```lookml
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
         external_api_urls : ["https://raw.githubusercontent.com","http://localhost:30000","https://localhost:8080","https://marketplace-api.looker.com","https://docs.looker.com","https://developer.mozilla.org/"]
         oauth2_urls: []
      }
   }
   ```
   the `http://localhost:30000` is for when you want to use the [API Explorer file server](/apix-files/README.md)
4. save all changes and deploy to production
5. in the root of `sdk-codegen`:
   ```sh
   yarn && yarn build
   ```
6. in `packages/extension-api-explorer`:
   ```sh
   yarn develop
   ```
7. on the Looker web page, click `Browse|API Explorer` to view the API Explorer
