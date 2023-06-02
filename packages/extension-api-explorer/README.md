# Using the Looker API Explorer as an extension

The API Explorer extension can be manually installed and run with a Looker instance using the following steps:

1. create a new LookML project called `apix`
1. create a new model. In `apix.model`, put:
   ```lookml
   connection: "<any valid connection name>"
   ```
1. Use the contents of the linked [`manifest.lkml`](manifest.lkml) as the project's `manifest.lkml`. The `http://localhost:30000` url is for the optional [API Explorer file server](/apix-files/README.md)
1. save all changes and deploy to production
1. in the root of `sdk-codegen`:
```sh
yarn && yarn build && yarn dev:xapix
```
1. on the Looker web page, click `Browse|API Explorer` to view the API Explorer
