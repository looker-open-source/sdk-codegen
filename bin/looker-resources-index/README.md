# Looker Resources Index

This folder contains data (in code) about Looker-related resources and scripts to maintain and repackage that data for publication.

The main location that the data is maintained is in `src/resource-data/resources.ts`

The main output of these scripts is a JSON file in `../../docs/resources` intended to be checked in to git and consumed via CDN. You may also import the typescript exports from this folder, for example to benefit from type declarations.

- Before use, install dependencies with `yarn install`
- To run tests & reports about the resources data, `yarn run analyze`
- To build the distributable JSON file, run `yarn run build`

## Sample Use Cases

- Create a "resource explorer" UI (for developer portal or hackathons)
- Generate a "home"/"index" page for the developer portal
- Generate an "Overview" page for each platform feature page (e.g. Actions, API, etc.)
- Find and embed "related resources" into specific articles and content
