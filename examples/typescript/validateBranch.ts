/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import { LookerNodeSDK } from '@looker/sdk-node';
import type { IProjectError } from '@looker/sdk';

const sdk = LookerNodeSDK.init40();

// this will validate lookml in development mode
const validateBranch = async (
  projectName: string,
  branch: string
): Promise<IProjectError[]> => {
  // check current workspace, if prod switch to dev (needed to be able to checkout a different git branch)
  const workspace = await sdk.ok(sdk.session());
  console.log(JSON.stringify(workspace));
  if (workspace.workspace_id === 'production') {
    const updatedWorkspace = await sdk.ok(
      sdk.update_session({ workspace_id: 'dev' })
    );
    console.log(JSON.stringify(updatedWorkspace));
  }
  const currentBranch = await sdk.ok(sdk.git_branch(projectName));
  // compare the current branch of the user to that inputted, if different update git branch of user to that which is specified
  if (currentBranch.name === branch) {
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
// validateBranch('luka_thesis', 'dev-lukas-fontanilla-2z5k')
