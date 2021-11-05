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
project_name: "hackathon"
application: hackathon {
  label: "Hackathon"
  url: "https://localhost:8080/dist/bundle.js"
  # file: "bundle.js"
  entitlements: {
    local_storage: no
    navigation: yes
    new_window: yes
    new_window_external_urls: [
      "https://*.looker.com/*",
      "https://*.google.com/*",
      "https://*.bit.ly/*",
      "https://*.imgur.com/*",
      "https://*.slack.com/*",
      "https://*.github.com/*",
      "https://*.youtube.com/*",
      "https://*.vimeo.com/*"
      ]
    use_form_submit: yes
    use_embeds: no
    use_iframes: no
    use_clipboard: no
    external_api_urls: ["http://localhost:8081/*", "https://sheets.googleapis.com/*"]
    core_api_methods: [
      "me",
      "all_roles",
      "all_user_attributes",
      "delete_user_attribute",
      "create_user_attribute",
      "search_groups",
      "search_users",
      "user_roles",
      "role_users",
      "user_attribute_user_values",
      "search_roles",
      "create_group",
      "set_role_groups",
      "set_user_attribute_group_values",
      "set_user_attribute_user_value",
      "create_user_credentials_email",
      "send_user_credentials_email_password_reset",
      "create_user_credentials_api3",
      "add_group_user",
      "update_user",
      "create_user",
      "search_groups_with_roles",
      "role_groups"
      ]
    oauth2_urls: []
    scoped_user_attributes: ["sheet_id", "token_server_url"]
  }
}
```

**Note** that http://localhost:8081/\* points to the access token server. Change to the access token server URL you are using.

Remember to add a model to the project that has a valid connection.

## Specific steps to `yarn`
1. run `yarn install` in sdk-codegen
2. run `yarn build` in sdk-codgen
3. run `yarn start` in examples/access_token_server
4. run `yarn dev:hack` in sdk-codegen to start the development server and connect to the extension

## Hackathon Personas

The active user's persona determines the availability of navigation options and data actions.

A Looker instance hosts the Hackathon app. Three Looker _roles_ and one _group_ are used to manage the persona granted to a Hackathon user.

### Hacker

Someone who has signed up for a Hackathon belongs to a group specifically created for that Hackathon. The name of this group is `Looker_Hack: <hackathon_id>`.

e.g., for Looker's first **Hack@Home**, if the `_id` is `hack_at_home`, the Hackathon app will use the group name`Looker_Hack: hack_at_home` to find signed up users.

### Staff

Hackathon staff have a role called (you guessed it) `Hackathon Staff`.

### Judge

Hackathon judges have a role called `Hackathon Judge`.

### Admin

Anyone who has the Looker `Admin` role is also a Hackathon administrator because they're already able to do everything, anyway.

## Setting up a Hackathon

You need to be a Looker Admin to set up the Hackathon extension and add users.

- Copy the Hackathon GSheets template to a new sheet. (To be linked)
- Add a new row in the `hackathons` tab for your hackathon. To override which hackathon the extension views, set the `default` column of the desired hackathon row to `TRUE`.
- Grant your service account access to the new GSheet
- Open the Hackathon extension in Looker.
- Configure Hackathon extension GSheet connection
  - Admin | Configuration
    - Provide the requested values
    - Submit
  - Reload the page
- See the banner listing the desired hackathon in the Welcome message
- Create `Hackathon` role with permissions you deem necessary for hackathon users.
- Add users through app, which will create the hackathon group and assign the `Hackathon` role and accomplish other administrative tasks.
  -   Admin | Add users
    -  Add Users with CSV or individually
    -  Submit
  -  Reload the page
- Create `Hackathon Staff` and `Hackathon Judge` roles, set up their permissions, and and assign them to users.
