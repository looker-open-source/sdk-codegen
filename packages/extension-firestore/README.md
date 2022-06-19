# Looker Extension Firestore Demo (React & Typescript)

TODO - add firebase setup

This repository demonstrate using firestore in a Looker extension using Typescript.

It uses [React](https://reactjs.org/) and [Typescript](https://typescriptlang.org) for writing your extension, the [React Extension SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-sdk-react) for interacting with Looker, [Looker Components](https://components.looker.com) for UI, and [Webpack](https://webpack.js.org/) for building your code.

## Getting Started for Development

1. Install the dependencies with [Yarn](https://yarnpkg.com/).

   ```
   yarn install
   ```

2. Start the development server

   ```
   yarn develop
   ```

   The extension is now running and serving the JavaScript locally at https://localhost:8080/dist/bundle.js.

3. Log in to Looker and create a new project.

   This is found under **Develop** => **Manage LookML Projects** => **New LookML Project**.

   Select "Blank Project" as your "Starting Point". This will create a new project with no files.

   1. The extension folder has a `manifest.lkml` file.

   Either drag & upload this file into your Looker project, or create a `manifest.lkml` with the same content. Change the `id`, `label`, or `url` as needed.

   ```
   project_name: "firestore"
   application: firestore {
      label: "Firestore Example"
      url: "https://localhost:8080/dist/bundle.js"
      entitlements: {
         external_api_urls : ["https://firestore.googleapis.com","https://identitytoolkit.googleapis.com","https://securetoken.googleapis.com"]
         google_api_scopes: ["https://www.googleapis.com/auth/datastore","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/firebase.database"]
         scoped_user_attributes: ["firebase_config"]
      }
   }
   ```

4. Create a `model` LookML file in your project. The name doesn't matter but the convention is to name it the same as the project— in this case, helloworld-js.

- Add a connection in this model.
- [Configure the model you created](https://docs.looker.com/data-modeling/getting-started/create-projects#configuring_a_model) so that it has access to the selected connection.
  We do this because Looker permissions data access via models— In order to grant / limit access to an extension, it must be associated with a model.

5. Connect the project to Git. This can be done in multiple ways:

- Create a new repository on GitHub or a similar service, and follow the instructions to [connect your project to Git](https://docs.looker.com/data-modeling/getting-started/setting-up-git-connection)
- A simpler but less powerful approach is to set up git with the "Bare" repository option which does not require connecting to an external Git Service.

6. Commit the changes and deploy them to production through the Project UI.

7. Reload the page and click the `Browse` dropdown menu. You will see the extension in the list.

- The extension will load the JavaScript from the `url` provided in the `application` definition. By default, this is http://localhost:8080/bundle.js. If you change the port your server runs on in the package.json, you will need to also update it in the manifest.lkml.
- Refreshing the extension page will bring in any new code changes from the extension template, although some changes will hot reload.

## Deployment

The process above describes how to run the extension for development. Once you're done developing and ready to deploy, the production version of the extension may be deployed as follows:

1. In the extension project directory build the extension by running `yarn build`.
2. Drag and drop the generated `dist/bundle.js` file into the Looker project interface
3. Modify the `manifest.lkml` to use `file` instead of `url`:

   ```
   project_name: "firestore"
   application: firestore {
      label: "Firestore Example"
      file: "bundle.js
      entitlements: {
         external_api_urls : ["https://firestore.googleapis.com","https://identitytoolkit.googleapis.com","https://securetoken.googleapis.com"]
         google_api_scopes: ["https://www.googleapis.com/auth/datastore","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/firebase.database"]
         scoped_user_attributes: ["firebase_config"]
      }
   }
   ```

## Related Projects

- [Looker Extension SDK React](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-sdk-react)
- [Looker Extension SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/extension-sdk)
- [Looker SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/packages/sdk)
- [Looker Embed SDK](https://github.com/looker-open-source/embed-sdk)
- [Looker Components](https://components.looker.com/)
- [Styled components](https://www.styled-components.com/docs)
