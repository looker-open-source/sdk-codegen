# Hackathon extension

This extension uses the `@looker/wholly-sheet` package (currently only available in this repository) for CRUDF operations on a GSheet.

Modifications of a GSheet cannot be done with an API key, so you must use a service account or OAuth.

Fear not! You can configure and use the [access token server](/examples/access-token-server) to get your service account token to use with this extension.

## Configuration

There are some items that need to be configured for the Hackathon extension to function.

### Google Sheet

To configure your GSheet, see the instructions in the [WhollySheet readme](../wholly-sheet/README.md#getting-your-gsheet-credentials)

To configure your access token server, see the instructions in the [access token server example readme](../../examples/access-token-server/README.md)

### Hackathon extension

Until the Hackathon extension is available via the Looker Marketplace, a Hackathon manifest needs to be used. This manifest should have:

```lookml
project_name: "hackathon_app"
application: hackathon_app {
  label: "Hackathon"
  url: "https://localhost:8080/dist/bundle.js"
   # file: "bundle.js"
  entitlements: {
    local_storage: no
    navigation: yes
    new_window: yes
    use_form_submit: yes
    use_embeds: no
    external_api_urls: ["http://localhost:8081/*", "https://sheets.googleapis.com/*"]
    core_api_methods: ["me", "all_roles", "all_user_attributes", "delete_user_attribute", "create_user_attribute", "search_groups", "search_users", "user_roles", "role_users"]
    scoped_user_attributes: ["sheet_id", "token_server_url"]
  }
}

```

**Note** that http://localhost:8081/\* points to the access token server. Change to the access token server URL you are using.

Remember to add a model to the project that has a valid connection.

## Hackathon Personas

The active user's persona determines the availability of navigation options and data actions.

A Looker instance hosts the Hackathon app. Three Looker _roles_ and one _group_ are used to manage the persona granted to a Hackathon user.

### Hacker

Someone who has signed up for a Hackathon belongs to a group specifically created for that Hackathon. The name of this group is `Looker_Hackathon: <hackathon_id>`.

When using the Hackathon registration [Python registration script](/examples/python/hackathon_app/README.md#bulk-import-script), the same `hackathon_id` provided there will be used to name the group for the Hackathon.

e.g., for Looker's first **Hack@Home**, if the `hackathon_id` is `hack_at_home`, the group name the Hackathon app will use to find signed up users is `Looker_Hackathon: hack_at_home`.

If registering users via the Looker admin interface instead, be sure to:

- create the correctly named hackathon group first
- add all registered users to that group
- add all other roles and group those users should have for the Hackathon

### Staff

Hackathon staff have a role called (you guessed it) `Hackathon Staff`.

### Judge

Hackathon judges have a role called `Hackathon Judge`.

### Admin

Anyone who has the Looker `Admin` role is also a Hackathon administrator because they're already able to do everything, anyway.

## Setting up a Hackathon

You need to be a Looker Admin to set up the Hackathon extension

- If you don't have a production hackathon sheet, copy the Hackathon GSheets template to a new sheet
- Create a new Hackathon entry in the `hackathons` tab. To override the selection of the Hackathon for the extension to view, set the `default` column of the desired hackathon to `TRUE`.
- Grant your service account access to the new GSheet
- Open the Hackathon extension in Looker
- Admin | Configuration
  - provide the requested values
  - save them
- Reload the page
- See the banner listing the desired hackathon in the Welcome message
