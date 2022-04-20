# Extension Tile Playground

## Purpose

The extension tile playground is a simple extension that allows changes to the extension SDKs to be
quickly prototyped and tested in dashboard mount points. Do not save prototyping to this repo as this
extension should remain simple. Instead, demos of extension SDK changes should be added to the
[extension examples repo](https://github.com/looker-open-source/extension-examples).

## Using the Extension Tile Playground

The extension tile playground can be manually installed and run with a Looker instance using the
following steps:

1. create a new LookML project called `tile_extensions`
1. create a new model. In `tile_extensions.model`, put:
   ```lookml
   connection: "<any valid connection name>"
   ```
1. in `manifest.lkml` put:

   ```lookml
   project_name: "tile_extensions"

   application: vis {
      label: "Visualization"
      # file: "bundle.js"
      url: "https://localhost:8080/dist/bundle.js"
      mount_points: {
         dashboard_vis: yes
      }
      entitlements: {
         local_storage: yes
         use_form_submit: yes
         core_api_methods: []
         external_api_urls: []
         oauth2_urls: []
         scoped_user_attributes: []
         global_user_attributes: []
      }
   }

   application: tile {
      label: "Tile"
      # file: "bundle.js"
      url: "https://localhost:8080/dist/bundle.js"
      mount_points: {
         dashboard_tile: yes
      }
      entitlements: {
         local_storage: yes
         use_form_submit: yes
         core_api_methods: ["run_inline_query"]
         external_api_urls: []
         oauth2_urls: []
         scoped_user_attributes: []
         global_user_attributes: []
      }
   }
   ```

1. save all changes and deploy to production
1. in the root of `sdk-codegen`:
   ```sh
   yarn && yarn build
   ```
1. Either

   in `packages/extension-tile-playground`:

   ```sh
   yarn develop
   ```

   Or

   in the root of `sdk-codegen`:

   ```sh
   yarn dev:tile
   ```

1. Add the following dashboards to your `thelook` project

```
- dashboard: viz_extension
  title: Viz Extension Demo
  layout: newspaper
  preferred_viewer: dashboards-next
  description: ''
  elements:
  - title: Viz Extension
    name: Viz Extension
    model: thelook
    explore: products
    type: 'tile_extensions::vis'
    fields: [products.count, calculation_1]
    sorts: [products.count desc]
    limit: 500
    query_timezone: America/Los_Angeles
    row: 0
    col: 8
    width: 25
    height: 16
```

```
- dashboard: tile_extension
  title: Extension Tile Demo
  layout: newspaper
  preferred_viewer: dashboards-next
  description: ''
  elements:
  - name: Tile Extension
    type: extension
    extension_id: 'tile_extensions::tile'
    row: 0
    col: 0
    width: 24
    height: 16
```
