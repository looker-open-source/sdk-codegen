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

import { TestConfig } from './testUtils'
import { PseudoGen } from './pseudo.gen'

const config = TestConfig()
const apiTestModel = config.apiTestModel

const gen = new PseudoGen(apiTestModel)

describe('pseudocode', () => {
  describe('method signature', () => {
    it('optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email
      expect(method).toBeDefined()
      const expected = `create_user_credentials_email(
  user_id: int64,
  body: CredentialsEmail,
  [fields: string]
): CredentialsEmail`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('no params', () => {
      const method = apiTestModel.methods.all_datagroups
      expect(method).toBeDefined()
      const expected = `all_datagroups(): Datagroup[]`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    test('import_lookml_dashboard', () => {
      const method = apiTestModel.methods.import_lookml_dashboard
      const expected = `import_lookml_dashboard(
  lookml_dashboard_id: string,
  space_id: string,
  [body: Dashboard],
  [raw_locale: boolean]
): Dashboard`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })
  describe('declare type', () => {
    it('declared a type', () => {
      const type = apiTestModel.types.Datagroup
      expect(type).toBeDefined()
      const expected = `Datagroup {
  [can: Hash[boolean]]
  [created_at: int64]
  [id: int64]
  [model_name: string]
  [name: string]
  [stale_before: int64]
  [trigger_check_at: int64]
  [trigger_error: string]
  [trigger_value: string]
  [triggered_at: int64]}`
      const actual = gen.declareType('', type)
      expect(actual).toEqual(expected)
    })
  })
})
