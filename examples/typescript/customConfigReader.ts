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
import { NodeSettings, LookerNodeSDK } from '@looker/sdk-node';
import { IApiSettings, IApiSection } from '@looker/sdk-rtl';

/**
 * @class CustomConfigReader
 *
 * A custom configuration reader that overrides the readConfig() method
 * in NodeSettings to allow fetching client_id and client_secret
 * from anywhere.
 */
class CustomConfigReader extends NodeSettings {
  constructor(settings: IApiSettings) {
    super('', settings);
  }

  /**
   * @returns an IApiSection object containing client_id and client_secret
   */
  readConfig(): IApiSection {
    return {
      client_id: 'clientId',
      client_secret: 'clientSecret',
    };
  }
}

(async () => {
  const sdk = LookerNodeSDK.init40(
    new CustomConfigReader({
      base_url: 'https://<your-looker-server>:19999',
    } as IApiSettings)
  );

  const me = await sdk.ok(
    sdk.me(
      'id, first_name, last_name, display_name, email, personal_space_id, home_space_id, group_ids, role_ids'
    )
  );
  console.log({ me });
})();
