/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import { api } from '../../test-data'
import { buildResponseTree, copyAndCleanResponse } from './utils'

describe('DocResponses utils', () => {
  describe('buildResponseTree', () => {
    test('it builds a response tree', () => {
      const method = api.methods.run_look
      const responses = method.responses
      const actual = buildResponseTree(responses)
      const responseStatuses = [
        '200: Look',
        '400: Bad Request',
        '404: Not Found',
        '422: Validation Error',
        '429: Too Many Requests',
      ]
      const mediaTypes = ['text', 'application/json', 'image/png', 'image/jpeg']
      expect(Object.keys(actual)).toEqual(responseStatuses)

      responseStatuses.forEach((status) => {
        expect(Object.keys(actual[status])).toEqual(mediaTypes)
      })

      expect(actual['200: Look']['application/json']).toEqual(
        method.primaryResponse
      )
    })
  })

  describe('copyAndCleanResponse', () => {
    test('it cleans ArrayType responses', () => {
      const resp = api.methods.all_users.primaryResponse
      expect(resp.type.className).toEqual('ArrayType')
      const actual = copyAndCleanResponse(resp)
      expect(actual).toEqual({
        can: 'Hash[boolean]',
        avatar_url: 'uri',
        avatar_url_without_sizing: 'uri',
        credentials_api3: {},
        credentials_email: {
          can: 'Hash[boolean]',
          created_at: 'string',
          email: 'string',
          forced_password_reset_at_next_login: 'boolean',
          is_disabled: 'boolean',
          logged_in_at: 'string',
          password_reset_url: 'string',
          type: 'string',
          url: 'uri',
          user_url: 'uri',
        },
        credentials_embed: {},
        credentials_google: {
          can: 'Hash[boolean]',
          created_at: 'string',
          domain: 'string',
          email: 'string',
          google_user_id: 'string',
          is_disabled: 'boolean',
          logged_in_at: 'string',
          type: 'string',
          url: 'uri',
        },
        credentials_ldap: {
          can: 'Hash[boolean]',
          created_at: 'string',
          email: 'string',
          is_disabled: 'boolean',
          ldap_dn: 'string',
          ldap_id: 'string',
          logged_in_at: 'string',
          type: 'string',
          url: 'uri',
        },
        credentials_looker_openid: {
          can: 'Hash[boolean]',
          created_at: 'string',
          email: 'string',
          is_disabled: 'boolean',
          logged_in_at: 'string',
          logged_in_ip: 'string',
          type: 'string',
          url: 'uri',
          user_url: 'uri',
        },
        credentials_oidc: {
          can: 'Hash[boolean]',
          created_at: 'string',
          email: 'string',
          is_disabled: 'boolean',
          logged_in_at: 'string',
          oidc_user_id: 'string',
          type: 'string',
          url: 'uri',
        },
        credentials_saml: {
          can: 'Hash[boolean]',
          created_at: 'string',
          email: 'string',
          is_disabled: 'boolean',
          logged_in_at: 'string',
          saml_user_id: 'string',
          type: 'string',
          url: 'uri',
        },
        credentials_totp: {
          can: 'Hash[boolean]',
          created_at: 'string',
          is_disabled: 'boolean',
          type: 'string',
          verified: 'boolean',
          url: 'uri',
        },
        display_name: 'string',
        email: 'string',
        embed_group_space_id: 'int64',
        first_name: 'string',
        group_ids: 'int64[]',
        home_space_id: 'string',
        home_folder_id: 'string',
        id: 'int64',
        is_disabled: 'boolean',
        last_name: 'string',
        locale: 'string',
        looker_versions: 'string[]',
        models_dir_validated: 'boolean',
        personal_space_id: 'int64',
        personal_folder_id: 'int64',
        presumed_looker_employee: 'boolean',
        role_ids: 'int64[]',
        sessions: {},
        ui_state: 'Hash[string]',
        verified_looker_employee: 'boolean',
        roles_externally_managed: 'boolean',
        allow_direct_roles: 'boolean',
        allow_normal_group_membership: 'boolean',
        allow_roles_from_normal_groups: 'boolean',
        url: 'uri',
      })
    })
  })
})
