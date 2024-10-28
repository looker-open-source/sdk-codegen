/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import { TestConfig } from '@looker/sdk-codegen-utils';
import { PseudoGen } from './pseudo.gen';
import { specToModel } from './sdkModels';

const config = TestConfig(specToModel);
const apiTestModel = config.apiTestModel;

const gen = new PseudoGen(apiTestModel);

describe('pseudocode', () => {
  describe('method signature', () => {
    it('noComment optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email;
      expect(method).toBeDefined();
      const expected = `create_user_credentials_email(
  user_id: string,
  body: CredentialsEmail,
  [fields: string]
): CredentialsEmail`;
      gen.noComment = true;
      const actual = gen.methodSignature('', method);
      gen.noComment = false;
      expect(actual).toEqual(expected);
    });
    it('optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email;
      expect(method).toBeDefined();
      const expected = `"### Email/password login information for the specified user.
"
"Calls to this endpoint may be denied by [Looker (Google Cloud core)](https://cloud.google.com/looker/docs/r/looker-core/overview)."
create_user_credentials_email(
  "Id of user"
user_id: string,
  body: CredentialsEmail,
  "Requested fields."
[fields: string]
): CredentialsEmail`;
      const actual = gen.methodSignature('', method);
      expect(actual).toEqual(expected);
    });
    it('no params', () => {
      const method = apiTestModel.methods.all_datagroups;
      expect(method).toBeDefined();
      const expected = `"### Get information about all datagroups."
all_datagroups(): Datagroup[]`;
      const actual = gen.methodSignature('', method);
      expect(actual).toEqual(expected);
    });
    it('import_lookml_dashboard', () => {
      const method = apiTestModel.methods.import_lookml_dashboard;
      const expected = `"### Import a LookML dashboard to a space as a UDD
"Creates a UDD (a dashboard which exists in the Looker database rather than as a LookML file) from the LookML dashboard
"and places it in the space specified. The created UDD will have a lookml_link_id which links to the original LookML dashboard.
"
"To give the imported dashboard specify a (e.g. title: "my title") in the body of your request, otherwise the imported
"dashboard will have the same title as the original LookML dashboard.
"
"For this operation to succeed the user must have permission to see the LookML dashboard in question, and have permission to
"create content in the space the dashboard is being imported to.
"
"**Sync** a linked UDD with [sync_lookml_dashboard()](#!/Dashboard/sync_lookml_dashboard)
"**Unlink** a linked UDD by setting lookml_link_id to null with [update_dashboard()](#!/Dashboard/update_dashboard)"
import_lookml_dashboard(
  "Id of LookML dashboard"
lookml_dashboard_id: string,
  "Id of space to import the dashboard to"
space_id: string,
  [body: Dashboard],
  "If true, and this dashboard is localized, export it with the raw keys, not localized."
[raw_locale: boolean]
): Dashboard`;
      const actual = gen.methodSignature('', method);
      expect(actual).toEqual(expected);
    });
  });
  describe('declare type', () => {
    it('declared a type', () => {
      const type = apiTestModel.types.Datagroup;
      expect(type).toBeDefined();
      const expected = `Datagroup {
  "Operations the current user is able to perform on this object"
  [can: Hash[boolean]]
  "UNIX timestamp at which this entry was created."
  [created_at: int64]
  "Unique ID of the datagroup"
  [id: string]
  "Name of the model containing the datagroup. Unique when combined with name."
  [model_name: string]
  "Name of the datagroup. Unique when combined with model_name."
  [name: string]
  "UNIX timestamp before which cache entries are considered stale. Cannot be in the future."
  [stale_before: int64]
  "UNIX timestamp at which this entry trigger was last checked."
  [trigger_check_at: int64]
  "The message returned with the error of the last trigger check."
  [trigger_error: string]
  "The value of the trigger when last checked."
  [trigger_value: string]
  "UNIX timestamp at which this entry became triggered. Cannot be in the future."
  [triggered_at: int64]}`;
      const actual = gen.declareType('', type);
      expect(actual).toEqual(expected);
    });
  });
});
