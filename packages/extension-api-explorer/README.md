# Using the Looker API Explorer as an extension

The API Explorer extension can be manually installed and run with a Looker instance using the following steps:

1. create a new LookML project called `apix`
1. create a new model. In `apix.model`, put:
   ```lookml
   connection: "<any valid connection name>"
   ```
1. in `manifest.lkml` put:
   ```lookml
   project_name: "api-explorer"
   application: api-explorer {
    label: "API Explorer"
    # file: "bundle.js"
    url: "https://localhost:8080/dist/bundle.js"
    entitlements: {
      local_storage: no
      navigation: no
      new_window: no
      raw_api_request: yes
      allow_forms: yes
      allow_same_origin: yes
      core_api_methods: []
      external_api_urls: []
      oauth2_urls: []
    }
   }
   ```
1. save all changes and deploy to production
1. in the root of `sdk-codegen`:
   ```sh
   yarn && yarn build
   ```
1. in `packages/extension-api-explorer`:
   ```sh
   yarn develop
   ```
1. on the Looker web page, click `Browse|API Explorer` to view the API Explorer
