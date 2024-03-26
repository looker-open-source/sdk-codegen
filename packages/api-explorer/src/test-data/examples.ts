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
import type { IExampleMine } from '@looker/sdk-codegen';

// prettier-ignore
export const examples: IExampleMine = {
  'commitHash': 'aea042439d2358a61bbf705528d6006d694d5ea5',
  'remoteOrigin': 'https://github.com/looker-open-source/sdk-codegen',
  'summaries': {
    'packages/sdk-codegen/src/codeGenerators.ts': {
      'summary': '`codeGenerators.ts`',
      'sourceFile': 'packages/sdk-codegen/src/codeGenerators.ts'
    },
    'packages/sdk-codegen/src/codeGen.ts': {
      'summary': 'codeGen.ts',
      'sourceFile': 'packages/sdk-codegen/src/codeGen.ts'
    },
    'packages/sdk-codegen/src/typescript.gen.ts': {
      'summary': 'TypeScript',
      'sourceFile': 'packages/sdk-codegen/src/typescript.gen.ts'
    },
    'packages/sdk-codegen/src/python.gen.ts': {
      'summary': 'Python',
      'sourceFile': 'packages/sdk-codegen/src/python.gen.ts'
    },
    'packages/sdk-rtl/src/apiSettings.ts': {
      'summary': '`apiSettings.ts`',
      'sourceFile': 'packages/sdk-rtl/src/apiSettings.ts'
    },
    'packages/sdk-rtl/src/transport.ts': {
      'summary': 'transport.ts',
      'sourceFile': 'packages/sdk-rtl/src/transport.ts'
    },
    'packages/sdk-rtl/src/nodeSession.ts': {
      'summary': '`NodeSession`',
      'sourceFile': 'packages/sdk-rtl/src/nodeSession.ts'
    },
    'packages/sdk-rtl/src/CSRFSession.ts': {
      'summary': '`CSRFSession`',
      'sourceFile': 'packages/sdk-rtl/src/CSRFSession.ts'
    },
    'packages/sdk-rtl/src/browserSession.ts': {
      'summary': '`BrowserSession`',
      'sourceFile': 'packages/sdk-rtl/src/browserSession.ts'
    },
    'packages/sdk-rtl/src/oauthSession.ts': {
      'summary': '`OAuthSession`',
      'sourceFile': 'packages/sdk-rtl/src/oauthSession.ts'
    },
    'packages/sdk-rtl/src/proxySession.ts': {
      'summary': '`ProxySession`',
      'sourceFile': 'packages/sdk-rtl/src/proxySession.ts'
    },
    'packages/sdk-codegen/src/sdkModels.ts': {
      'summary': '`sdkModels.ts`',
      'sourceFile': 'packages/sdk-codegen/src/sdkModels.ts'
    },
    'packages/sdk/src/sdk/4.0/methods.ts': {
      'summary': '`methods.ts`',
      'sourceFile': 'packages/sdk/src/sdk/4.0/methods.ts'
    },
    'packages/sdk/src/sdk/4.0/models.ts': {
      'summary': '`models.ts`',
      'sourceFile': 'packages/sdk/src/sdk/4.0/models.ts'
    },
    'packages/sdk/src/sdk/4.0/streams.ts': {
      'summary': '`streams.ts`',
      'sourceFile': 'packages/sdk/src/sdk/4.0/streams.ts'
    },
    'packages/sdk-rtl/src/constants.ts': {
      'summary': '`constants.ts`',
      'sourceFile': 'packages/sdk-rtl/src/constants.ts'
    },
    'packages/sdk-codegen-scripts/src/reformatter.ts': {
      'summary': '`reformatter.ts`',
      'sourceFile': 'packages/sdk-codegen-scripts/src/reformatter.ts'
    },
    'packages/sdk-codegen/src/sdkModels.spec.ts': {
      'summary': '`sdkModels.spec.ts`',
      'sourceFile': 'packages/sdk-codegen/src/sdkModels.spec.ts'
    },
    'packages/sdk-codegen/src/python.gen.spec.ts': {
      'summary': '`python.gen.spec.ts`',
      'sourceFile': 'packages/sdk-codegen/src/python.gen.spec.ts'
    },
    'packages/sdk/src/test/methods.spec.ts': {
      'summary': '`methods.spec.ts`',
      'sourceFile': 'packages/sdk/src/test/methods.spec.ts'
    },
    'python/tests/integration/api40/test_methods.py': {
      'summary': '`test_methods.py`',
      'sourceFile': 'python/tests/integration/api40/test_methods.py'
    },
    'packages/sdk-codegen-scripts/scripts/register.ts': {
      'summary': 'OAuth application registration',
      'sourceFile': 'packages/sdk-codegen-scripts/scripts/register.ts'
    },
    'packages/run-it/src/utils/RunItSDK.ts': {
      'summary': 'RunItSDK',
      'sourceFile': 'packages/run-it/src/utils/RunItSDK.ts'
    },
    'packages/run-it/src/scenes/OAuthScene/OAuthScene.tsx': {
      'summary': 'OAuthScene',
      'sourceFile': 'packages/run-it/src/scenes/OAuthScene/OAuthScene.tsx'
    },
    'examples/python/test_connection.py': {
      'summary': 'Test a specified connection',
      'sourceFile': 'examples/python/test_connection.py'
    },
    'examples/python/soft_delete_dashboard.py': {
      'summary': 'Soft delete dashboard',
      'sourceFile': 'examples/python/soft_delete_dashboard.py'
    },
    'examples/python/download_tile.py': {
      'summary': 'Download dashboard tile in specified format',
      'sourceFile': 'examples/python/download_tile.py'
    },
    'examples/python/download_look.py': {
      'summary': 'Download look in specified format',
      'sourceFile': 'examples/python/download_look.py'
    },
    'examples/python/download_dashboard_pdf.py': {
      'summary': 'Generate and download dashboard PDFs',
      'sourceFile': 'examples/python/download_dashboard_pdf.py'
    },
    'examples/python/logout_all_users.py': {
      'summary': 'Disable all active user sessions',
      'sourceFile': 'examples/python/logout_all_users.py'
    },
    'examples/ruby/logout_all_users.rb': {
      'summary': 'Logout all users on the instance',
      'sourceFile': 'examples/ruby/logout_all_users.rb'
    },
    'examples/ruby/disable_users.rb': {
      'summary': 'Disable users in the instance',
      'sourceFile': 'examples/ruby/disable_users.rb'
    },
    'examples/ruby/users_list_and_auth_types.rb': {
      'summary': 'Get a list of all users and their auth credentials',
      'sourceFile': 'examples/ruby/users_list_and_auth_types.rb'
    },
    'examples/ruby/all_users_to_group.rb': {
      'summary': 'Add all users to a group',
      'sourceFile': 'examples/ruby/all_users_to_group.rb'
    },
    'examples/ruby/all_git_branches.rb': {
      'summary': 'Get a list of all the Git branches in the projects',
      'sourceFile': 'examples/ruby/all_git_branches.rb'
    },
    'examples/ruby/validate_projects.rb': {
      'summary': 'Validates the Looker **Projects** (LookML)',
      'sourceFile': 'examples/ruby/validate_projects.rb'
    },
    'examples/ruby/list_files_per_project.rb': {
      'summary': 'Get a list of all files per projects',
      'sourceFile': 'examples/ruby/list_files_per_project.rb'
    },
    'examples/ruby/render_look_png.rb': {
      'summary': 'Render a Look as in PNG format',
      'sourceFile': 'examples/ruby/render_look_png.rb'
    },
    'examples/ruby/schedule_once_to_gcs.rb': {
      'summary': 'Create a schedule to run once to Google Cloud Storage',
      'sourceFile': 'examples/ruby/schedule_once_to_gcs.rb'
    },
    'examples/ruby/stream_to_s3.rb': {
      'summary': 'Stream results to S3 bucket',
      'sourceFile': 'examples/ruby/stream_to_s3.rb'
    },
    'examples/ruby/rerun_failed_email_schedules.rb': {
      'summary': 'Re-run the failed schedules to email',
      'sourceFile': 'examples/ruby/rerun_failed_email_schedules.rb'
    },
    'examples/ruby/download_dashboard.rb': {
      'summary': 'Download all dashboard tiles as tabs in one Excel file',
      'sourceFile': 'examples/ruby/download_dashboard.rb'
    },
    'examples/ruby/test_integrations.rb': {
      'summary': 'Test the integrations',
      'sourceFile': 'examples/ruby/test_integrations.rb'
    },
    'examples/ruby/update_look.rb': {
      'summary': 'Template to update Look',
      'sourceFile': 'examples/ruby/update_look.rb'
    },
    'examples/ruby/dev_vs_prod.rb': {
      'summary': 'Automated testing for Look output between Development mode and Production mode',
      'sourceFile': 'examples/ruby/dev_vs_prod.rb'
    },
    'examples/ruby/validate_content.rb': {
      'summary': 'Validates the Looker **Content**',
      'sourceFile': 'examples/ruby/validate_content.rb'
    },
    'examples/ruby/delete_unused_content.rb': {
      'summary': 'Delete old Looks',
      'sourceFile': 'examples/ruby/delete_unused_content.rb'
    },
    'examples/ruby/kill_all_running_queries.rb': {
      'summary': 'Kill all running queries in the instance',
      'sourceFile': 'examples/ruby/kill_all_running_queries.rb'
    },
    'examples/ruby/test_all_connections.rb': {
      'summary': 'Test database connections',
      'sourceFile': 'examples/ruby/test_all_connections.rb'
    },
    'examples/ruby/create_themes.rb': {
      'summary': 'Create Looker Themes for your dashboards',
      'sourceFile': 'examples/ruby/create_themes.rb'
    },
    'examples/typescript/dual.ts': {
      'summary': 'multiple APIs',
      'sourceFile': 'examples/typescript/dual.ts'
    },
    'examples/typescript/customConfigReader.ts': {
      'summary': 'custom configReader',
      'sourceFile': 'examples/typescript/customConfigReader.ts'
    },
    'examples/typescript/utils.ts': {
      'summary': 'SDK utilities',
      'sourceFile': 'examples/typescript/utils.ts'
    },
    'examples/typescript/sudoAsUser.ts': {
      'summary': 'sudo as user',
      'sourceFile': 'examples/typescript/sudoAsUser.ts'
    },
    'examples/typescript/downloadTile.ts': {
      'summary': 'downloadTile.ts example',
      'sourceFile': 'examples/typescript/downloadTile.ts'
    },
    'examples/typescript/downloadDashboard.ts': {
      'summary': 'download a dashboard by name',
      'sourceFile': 'examples/typescript/downloadDashboard.ts'
    },
    'packages/api-explorer/src/components/ExploreType/ExploreType.tsx': {
      'summary': '`ExploreType`',
      'sourceFile': 'packages/api-explorer/src/components/ExploreType/ExploreType.tsx'
    },
    'packages/api-explorer/src/components/ExploreType/ExploreProperty.tsx': {
      'summary': '`ExploreProperty`',
      'sourceFile': 'packages/api-explorer/src/components/ExploreType/ExploreProperty.tsx'
    },
    'packages/run-it/src/utils/RunItSDK.spec.ts': {
      'summary': 'RunItSDK tests',
      'sourceFile': 'packages/run-it/src/utils/RunItSDK.spec.ts'
    },
    'packages/sdk-codegen/src/kotlin.gen.ts': {
      'summary': 'Kotlin',
      'sourceFile': 'packages/sdk-codegen/src/kotlin.gen.ts'
    },
    'packages/sdk-codegen/src/swift.gen.ts': {
      'summary': 'Swift',
      'sourceFile': 'packages/sdk-codegen/src/swift.gen.ts'
    },
    'packages/sdk-codegen/src/csharp.gen.ts': {
      'summary': 'C#',
      'sourceFile': 'packages/sdk-codegen/src/csharp.gen.ts'
    },
    'packages/sdk-codegen/src/go.gen.ts': {
      'summary': 'Go',
      'sourceFile': 'packages/sdk-codegen/src/go.gen.ts'
    },
    'packages/sdk-codegen-scripts/src/sdkGen.ts': {
      'summary': 'sdkGen.ts',
      'sourceFile': 'packages/sdk-codegen-scripts/src/sdkGen.ts'
    },
    'packages/sdk-codegen-scripts/src/legacy.ts': {
      'summary': 'legacy.ts',
      'sourceFile': 'packages/sdk-codegen-scripts/src/legacy.ts'
    },
    'packages/sdk-codegen-scripts/src/specConvert.ts': {
      'summary': 'specConvert.ts',
      'sourceFile': 'packages/sdk-codegen-scripts/src/specConvert.ts'
    },
    'packages/sdk-codegen-scripts/src/yamlToJson.ts': {
      'summary': 'yamlToJson.ts',
      'sourceFile': 'packages/sdk-codegen-scripts/src/yamlToJson.ts'
    },
    'packages/sdk-rtl/src/nodeSettings.ts': {
      'summary': 'NodeSettingsIniFile() and NodeSettings()',
      'sourceFile': 'packages/sdk-rtl/src/nodeSettings.ts'
    },
    'packages/wholly-sheet/src/WhollySheet.ts': {
      'summary': '`WhollySheet.ts`',
      'sourceFile': 'packages/wholly-sheet/src/WhollySheet.ts'
    },
    'examples/python/hackathon_app/sheets.py': {
      'summary': 'sheets.py',
      'sourceFile': 'examples/python/hackathon_app/sheets.py'
    },
    'packages/wholly-sheet/src/SheetSDK.ts': {
      'summary': '`SheetSDK.ts`',
      'sourceFile': 'packages/wholly-sheet/src/SheetSDK.ts'
    },
    'packages/wholly-sheet/src/RowModel.ts': {
      'summary': '`RowModel`',
      'sourceFile': 'packages/wholly-sheet/src/RowModel.ts'
    },
    'packages/wholly-sheet/src/WhollySheet.spec.ts': {
      'summary': '`WhollySheet.spec.ts`',
      'sourceFile': 'packages/wholly-sheet/src/WhollySheet.spec.ts'
    },
    'packages/wholly-sheet/src/RowModel.spec.ts': {
      'summary': '`RowModel.spec.ts`',
      'sourceFile': 'packages/wholly-sheet/src/RowModel.spec.ts'
    },
    'swift/looker/Tests/lookerTests/modelsTests.swift': {
      'summary': 'modelsTests.swift',
      'sourceFile': 'swift/looker/Tests/lookerTests/modelsTests.swift'
    }
  },
  'nuggets': {
    'run_look': {
      'operationId': 'run_look',
      'calls': {
        '.py': [
          {
            'sourceFile': 'examples/python/lookersdk-flask/app/looker.py',
            'column': 15,
            'line': 28
          },
          {
            'sourceFile': 'examples/python/lookersdk-flask/app/looker.py',
            'column': 15,
            'line': 33
          },
          {
            'sourceFile': 'python/tests/integration/test_methods.py',
            'column': 13,
            'line': 480
          },
          {
            'sourceFile': 'python/tests/integration/test_methods.py',
            'column': 13,
            'line': 483
          },
          {
            'sourceFile': 'python/tests/integration/test_methods.py',
            'column': 13,
            'line': 486
          }
        ],
        '.rb': [
          {
            'sourceFile': 'examples/ruby/dev_vs_prod.rb',
            'column': 22,
            'line': 27
          },
          {
            'sourceFile': 'examples/ruby/dev_vs_prod.rb',
            'column': 20,
            'line': 28
          },
          {
            'sourceFile': 'examples/ruby/dev_vs_prod.rb',
            'column': 21,
            'line': 36
          },
          {
            'sourceFile': 'examples/ruby/dev_vs_prod.rb',
            'column': 19,
            'line': 37
          },
          {
            'sourceFile': 'examples/ruby/rerun_failed_email_schedules.rb',
            'column': 19,
            'line': 15
          }
        ],
        '.ts': [
          {
            'sourceFile': 'packages/sdk-codegen/src/python.gen.spec.ts',
            'column': 35,
            'line': 831
          },
          {
            'sourceFile': 'packages/sdk-codegen/src/typescript.gen.spec.ts',
            'column': 52,
            'line': 183
          },
          {
            'sourceFile': 'packages/sdk-codegen/src/typescript.gen.spec.ts',
            'column': 52,
            'line': 234
          }
        ]
      }
    },
  }
}
