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
    test('ContentValidation can expand nested types', () => {
      const resp = api.methods.content_validation.primaryResponse
      expect(resp.type.className).toEqual('ContentValidation')
      // 0 = expand all
      const actual = copyAndCleanResponse(resp, 0)
      const expected = {
        description: 'Content validation results',
        name: 'ContentValidation',
        properties: {
          computation_time: 'float',
          content_with_errors: {
            description: 'A list of content errors',
            name: 'ContentValidatorError[]',
            properties: {
              alert: {
                description: '',
                name: 'ContentValidationAlert',
                properties: {
                  custom_title: 'string',
                  id: 'int64',
                  lookml_dashboard_id: 'string',
                  lookml_link_id: 'string',
                },
              },
              dashboard: {
                description: '',
                name: 'ContentValidationDashboard',
                properties: {
                  description: 'string',
                  folder: {
                    description: '',
                    name: 'ContentValidationFolder',
                    properties: {
                      id: 'string',
                      name: 'string',
                    },
                  },
                  id: 'string',
                  space: {
                    description: '',
                    name: 'ContentValidationSpace',
                    properties: {
                      id: 'string',
                      name: 'string',
                    },
                  },
                  title: 'string',
                },
              },
              dashboard_element: {
                description: '',
                name: 'ContentValidationDashboardElement',
                properties: {
                  body_text: 'string',
                  dashboard_id: 'string',
                  id: 'string',
                  look_id: 'string',
                  note_display: 'string',
                  note_state: 'string',
                  note_text: 'string',
                  note_text_as_html: 'string',
                  query_id: 'int64',
                  subtitle_text: 'string',
                  title: 'string',
                  title_hidden: 'boolean',
                  title_text: 'string',
                  type: 'string',
                },
              },
              dashboard_filter: {
                description: '',
                name: 'ContentValidationDashboardFilter',
                properties: {
                  dashboard_id: 'string',
                  default_value: 'string',
                  dimension: 'string',
                  explore: 'string',
                  id: 'string',
                  model: 'string',
                  name: 'string',
                  title: 'string',
                  type: 'string',
                },
              },
              errors: {
                description: 'A list of errors found for this piece of content',
                name: 'ContentValidationError[]',
                properties: {
                  explore_name: 'string',
                  field_name: 'string',
                  message: 'string',
                  model_name: 'string',
                  removable: 'boolean',
                },
              },
              id: 'string',
              look: {
                description: '',
                name: 'ContentValidationLook',
                properties: {
                  folder: {
                    description: '',
                    name: 'ContentValidationFolder',
                    properties: {
                      id: 'string',
                      name: 'string',
                    },
                  },
                  id: 'int64',
                  space: {
                    description: '',
                    name: 'ContentValidationSpace',
                    properties: {
                      id: 'string',
                      name: 'string',
                    },
                  },
                  title: 'string',
                },
              },
              lookml_dashboard: {
                description: '',
                name: 'ContentValidationLookMLDashboard',
                properties: {
                  id: 'string',
                  space: {
                    description: '',
                    name: 'SpaceBase',
                    properties: {
                      can: 'Hash[boolean]',
                      child_count: 'int64',
                      content_metadata_id: 'int64',
                      created_at: 'datetime',
                      creator_id: 'int64',
                      external_id: 'string',
                      id: 'string',
                      is_embed: 'boolean',
                      is_embed_shared_root: 'boolean',
                      is_embed_users_root: 'boolean',
                      is_personal: 'boolean',
                      is_personal_descendant: 'boolean',
                      is_shared_root: 'boolean',
                      is_users_root: 'boolean',
                      name: 'string',
                      parent_id: 'string',
                    },
                  },
                  space_id: 'string',
                  title: 'string',
                },
              },
              lookml_dashboard_element: {
                description: '',
                name: 'ContentValidationLookMLDashboardElement',
                properties: {
                  lookml_link_id: 'string',
                  title: 'string',
                },
              },
              scheduled_plan: {
                description: '',
                name: 'ContentValidationScheduledPlan',
                properties: {
                  id: 'int64',
                  look_id: 'int64',
                  name: 'string',
                },
              },
            },
          },
          total_alerts_validated: 'int64',
          total_dashboard_elements_validated: 'int64',
          total_dashboard_filters_validated: 'int64',
          total_explores_validated: 'int64',
          total_looks_validated: 'int64',
          total_scheduled_plans_validated: 'int64',
        },
      }
      expect(actual).toEqual(expected)
    })

    test('ContentValidation can reference top level nested types', () => {
      const resp = api.methods.content_validation.primaryResponse
      expect(resp.type.className).toEqual('ContentValidation')
      // Referencing first level nested types is the default
      const actual = copyAndCleanResponse(resp)
      const expected = {
        description: 'Content validation results',
        name: 'ContentValidation',
        properties: {
          computation_time: 'float',
          content_with_errors: 'ContentValidatorError[]',
          total_alerts_validated: 'int64',
          total_dashboard_elements_validated: 'int64',
          total_dashboard_filters_validated: 'int64',
          total_explores_validated: 'int64',
          total_looks_validated: 'int64',
          total_scheduled_plans_validated: 'int64',
        },
      }
      expect(actual).toEqual(expected)
    })

    test('ContentValidation can reference second level nested types', () => {
      const resp = api.methods.content_validation.primaryResponse
      expect(resp.type.className).toEqual('ContentValidation')
      const actual = copyAndCleanResponse(resp, 2)
      const expected = {
        description: 'Content validation results',
        name: 'ContentValidation',
        properties: {
          computation_time: 'float',
          content_with_errors: {
            description: 'A list of content errors',
            name: 'ContentValidatorError[]',
            properties: {
              alert: 'ContentValidationAlert',
              dashboard: 'ContentValidationDashboard',
              dashboard_element: 'ContentValidationDashboardElement',
              dashboard_filter: 'ContentValidationDashboardFilter',
              errors: 'ContentValidationError[]',
              id: 'string',
              look: 'ContentValidationLook',
              lookml_dashboard: 'ContentValidationLookMLDashboard',
              lookml_dashboard_element:
                'ContentValidationLookMLDashboardElement',
              scheduled_plan: 'ContentValidationScheduledPlan',
            },
          },
          total_alerts_validated: 'int64',
          total_dashboard_elements_validated: 'int64',
          total_dashboard_filters_validated: 'int64',
          total_explores_validated: 'int64',
          total_looks_validated: 'int64',
          total_scheduled_plans_validated: 'int64',
        },
      }
      expect(actual).toEqual(expected)
    })

    test('it cleans ArrayType responses', () => {
      const resp = api.methods.all_users.primaryResponse
      expect(resp.type.className).toEqual('ArrayType')
      // 0 = expand all
      const actual = copyAndCleanResponse(resp, 0)
      const expected = {
        description: 'All users.',
        name: 'User[]',
        properties: {
          allow_direct_roles: 'boolean',
          allow_normal_group_membership: 'boolean',
          allow_roles_from_normal_groups: 'boolean',
          avatar_url: 'uri',
          avatar_url_without_sizing: 'uri',
          can: 'Hash[boolean]',
          credentials_api3: {
            description: 'API 3 credentials',
            name: 'CredentialsApi3[]',
            properties: {
              can: 'Hash[boolean]',
              client_id: 'string',
              created_at: 'string',
              id: 'int64',
              is_disabled: 'boolean',
              type: 'string',
              url: 'uri',
            },
          },
          credentials_email: {
            description: '',
            name: 'CredentialsEmail',
            properties: {
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
          },
          credentials_embed: {
            description: 'Embed credentials',
            name: 'CredentialsEmbed[]',
            properties: {
              can: 'Hash[boolean]',
              created_at: 'string',
              external_group_id: 'string',
              external_user_id: 'string',
              id: 'int64',
              is_disabled: 'boolean',
              logged_in_at: 'string',
              type: 'string',
              url: 'uri',
            },
          },
          credentials_google: {
            description: '',
            name: 'CredentialsGoogle',
            properties: {
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
          },
          credentials_ldap: {
            description: '',
            name: 'CredentialsLDAP',
            properties: {
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
          },
          credentials_looker_openid: {
            description: '',
            name: 'CredentialsLookerOpenid',
            properties: {
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
          },
          credentials_oidc: {
            description: '',
            name: 'CredentialsOIDC',
            properties: {
              can: 'Hash[boolean]',
              created_at: 'string',
              email: 'string',
              is_disabled: 'boolean',
              logged_in_at: 'string',
              oidc_user_id: 'string',
              type: 'string',
              url: 'uri',
            },
          },
          credentials_saml: {
            description: '',
            name: 'CredentialsSaml',
            properties: {
              can: 'Hash[boolean]',
              created_at: 'string',
              email: 'string',
              is_disabled: 'boolean',
              logged_in_at: 'string',
              saml_user_id: 'string',
              type: 'string',
              url: 'uri',
            },
          },
          credentials_totp: {
            description: '',
            name: 'CredentialsTotp',
            properties: {
              can: 'Hash[boolean]',
              created_at: 'string',
              is_disabled: 'boolean',
              type: 'string',
              url: 'uri',
              verified: 'boolean',
            },
          },
          display_name: 'string',
          email: 'string',
          embed_group_space_id: 'int64',
          first_name: 'string',
          group_ids: 'int64[]',
          home_folder_id: 'string',
          home_space_id: 'string',
          id: 'int64',
          is_disabled: 'boolean',
          last_name: 'string',
          locale: 'string',
          looker_versions: 'string[]',
          models_dir_validated: 'boolean',
          personal_folder_id: 'int64',
          personal_space_id: 'int64',
          presumed_looker_employee: 'boolean',
          role_ids: 'int64[]',
          roles_externally_managed: 'boolean',
          sessions: {
            description: 'Active sessions',
            name: 'Session[]',
            properties: {
              browser: 'string',
              can: 'Hash[boolean]',
              city: 'string',
              country: 'string',
              created_at: 'string',
              credentials_type: 'string',
              expires_at: 'string',
              extended_at: 'string',
              extended_count: 'int64',
              id: 'int64',
              ip_address: 'string',
              operating_system: 'string',
              state: 'string',
              sudo_user_id: 'int64',
              url: 'uri',
            },
          },
          ui_state: 'Hash[string]',
          url: 'uri',
          verified_looker_employee: 'boolean',
        },
      }
      expect(actual).toEqual(expected)
    })
  })
})
