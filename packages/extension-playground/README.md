# Extension Playground

## Purpose

The extension playground is a simple extension that allows changes to the extension SDKs to be
quickly prototyped and tested. Do not save prototyping to this repo as the this extension should
remain simple. Instead, demos of extension SDK changes should be added to the
[extension examples repo](https://github.com/looker-open-source/extension-examples).

## Using the Extension Playground

The extension playground can be manually installed and run with a Looker instance using the following steps:

1. create a new LookML project called `extension-playground`
1. create a new model. In `extension-playground.model`, put:
   ```lookml
   connection: "<any valid connection name>"
   ```
1. in `manifest.lkml` put:
   ```lookml
   project_name: "extension-playground"
   application: extension-playground {
      label: "Extension Playground"
      url: "http://localhost:8080/dist/bundle.js"
      entitlements: {
         local_storage: no
         navigation: no
         new_window: no
         raw_api_request: yes
         use_form_submit: yes
         use_embeds: yes
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
1. in `packages/extension-playground`:
   ```sh
   yarn develop
   ```
1. on the Looker web page, click `Browse|Extension Playground` to view the Extension Playground
