# Hackathon extension

## Configuration

There are some items that need to be configured for the Hackathon extension to function.

### Hackathon extension

Until the Hackathon extension is available via the Looker Marketplace, a Hackathon manifest needs to be used. [Example Hackathon manifest](manifest.lkml)

Remember to add a model to the project that has a valid connection.

## Specific steps to `yarn`
1. run `yarn install` in sdk-codegen
2. run `yarn build` in sdk-codegen
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

- Add a new row in the `hackathons` tab for your hackathon. To override which hackathon the extension views, set the `default` column of the desired hackathon row to `TRUE`. TODO: Update with artifact api change.
- Open the Hackathon extension in Looker.
- See the banner listing the desired hackathon in the Welcome message
- Create `Hackathon` role with permissions you deem necessary for hackathon users.
- Add users through app, which will create the hackathon group and assign the `Hackathon` role and accomplish other administrative tasks.
  -   Admin | Add users
    -  Add Users with CSV or individually
    -  Submit
  -  Reload the page
- Create `Hackathon Staff` and `Hackathon Judge` roles, set up their permissions, and and assign them to users.
