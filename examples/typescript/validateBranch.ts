import { LookerNodeSDK } from '@looker/sdk-node';
import { IProjectError } from '@looker/sdk';

const sdk = LookerNodeSDK.init40();

// this will validate lookml in development mode
const validateBranch = async (
  projectName: string,
  branch: string
): Promise<IProjectError[]> => {
  // check current workspace, if prod switch to dev (needed to be able to checkout a different git branch)
  const workspace = await sdk.ok(sdk.session());
  console.log(JSON.stringify(workspace));
  if (workspace.workspace_id == 'production') {
    const updatedWorkspace = await sdk.ok(
      sdk.update_session({ workspace_id: 'dev' })
    );
    console.log(JSON.stringify(updatedWorkspace));
  }
  const currentBranch = await sdk.ok(sdk.git_branch(projectName));
  // compare the current branch of the user to that inputted, if different update git branch of user to that which is specified
  if (currentBranch.name == branch) {
    try {
      const validateResults = await sdk.ok(sdk.validate_project(projectName));
      if (validateResults.errors.length > 0) {
        console.log(
          `There are errors with this lookml project. Errors: ${JSON.stringify(
            validateResults.errors
          )}`
        );
        return validateResults.errors;
      } else {
        console.log('There are no errors with this lookml project.');
      }
    } catch (e) {
      throw new Error(
        `There was an error validating this project. Here is the full message: ${e}.`
      );
    }
  } else {
    try {
      await sdk.ok(
        sdk.update_git_branch(projectName, {
          name: branch,
        })
      );
    } catch (e) {
      throw new Error(
        `There was an error checking out ${branch}. Check to make sure the branch inputted is a valid branch in the repo. Error: ${e}.`
      );
    }
    const validateResults = await sdk.ok(sdk.validate_project(projectName));
    if (validateResults.errors.length > 0) {
      console.log(
        `There are errors with this lookml project. Errors: ${JSON.stringify(
          validateResults.errors
        )}`
      );
      return validateResults.errors;
    } else {
      console.log('There are no errors with this lookml project.');
    }
  }
};

// Example
//validateBranch('luka_thesis', 'dev-lukas-fontanilla-2z5k')
