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
import type { IMethodResponse, ApiModel } from '@looker/sdk-codegen';
import { TestConfig } from '@looker/sdk-codegen-utils';
import { specToModel } from '@looker/sdk-codegen';

const config = TestConfig(specToModel);
const apiTestModel = config.apiTestModel as ApiModel;

describe('sdk generator test', () => {
  it('resolves OAS schemas into types', () => {
    expect(typeof apiTestModel.types.ValidationError.elementType).toEqual(
      'undefined'
    );

    const test =
      apiTestModel.types.ValidationError.properties.errors.type.elementType;
    expect(test && test.name).toEqual('ValidationErrorDetail');
  });

  it('loads a method with a ref type response', () => {
    const method = apiTestModel.methods.user;
    expect(method.primaryResponse.statusCode).toEqual(200);
    expect(method.primaryResponse.type.name).toEqual('User');
    expect(method.type.name).toEqual('User');
    expect(method.endpoint).toEqual('/users/{user_id}');
    const response = method.responses.find(
      (a: IMethodResponse) => a.statusCode === 400
    );
    expect(response).toBeDefined();
    if (response) {
      expect(response.type.name).toEqual('Error');
    }
  });

  it('loads 204 methods with void response type', () => {
    const method = apiTestModel.methods.delete_group_user;
    expect(method.primaryResponse.statusCode).toEqual(204);
    expect(method.primaryResponse.type.name).toEqual('void');
  });

  it('has collections by key order', () => {
    // TODO we may remove this behavior if we decide API Explorer should display methods in natural order
    let keys = Object.keys(apiTestModel.methods);
    let sorted = keys.sort((a, b) => a.localeCompare(b));
    let names = Object.values(apiTestModel.methods).map(item => item.name);
    expect(keys).toEqual(sorted);
    expect(names).toEqual(sorted);

    keys = Object.keys(apiTestModel.types);
    sorted = keys.sort((a, b) => a.localeCompare(b));
    names = Object.values(apiTestModel.types).map(item => item.name);
    expect(keys).toEqual(sorted);
    expect(names).toEqual(sorted);
  });
});
