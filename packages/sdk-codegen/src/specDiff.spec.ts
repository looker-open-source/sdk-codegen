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

import { readFileSync } from 'fs';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import type { OperationObject } from 'openapi3-ts';

import type { DiffRow } from './specDiff';
import {
  compareParams,
  compareSpecs,
  compareTypes,
  includeDiffs,
  startCount,
} from './specDiff';
import { rootFile, TestConfig } from './testUtils';
import type { PropertyList, IApiModel, IMethod } from './sdkModels';
import { Type, Method, Parameter, ApiModel } from './sdkModels';

const config = TestConfig();
const apiTestModel = config.apiTestModel;

/**
 * Returns an array containing the key and the value of the first enumerable object property
 * @param props A key/value collection of type properties
 */
const firstProperty = (props: PropertyList) =>
  cloneDeep(Object.entries(props)[0]);

/**
 * Changes the name and inverts the required property of the given type
 * @param type
 */
const changeType = (type: Type) => {
  const result = new Type(type.schema, type.name);
  Object.entries(type.properties).forEach(([propKey, propVal]) => {
    result.properties[propKey] = propVal;
  });
  const [name, value] = firstProperty(result.properties);
  value.required = !value.required;
  result.properties[name] = value;
  return result;
};

/**
 * Inverts the required property for the first param of the given method
 * @param method
 */
const changeParams = (method: Method) => {
  const params = cloneDeep(method.params);
  const changedParams = [];
  params.forEach((param) => {
    changedParams.push(new Parameter(param, param.type));
  });
  params[0].required = !params[0].required;
  return params;
};

/**
 * Returns a copy of the given method with changes to the first param and first
 * type property
 * @param method
 */
export const changeMethod = (method: Method) => {
  const params = changeParams(method);

  const result = new Method(
    apiTestModel,
    method.httpMethod,
    method.endpoint,
    method.schema as OperationObject,
    params,
    method.responses
  );
  result.type = changeType(result.type as Type);
  return result;
};

describe('spec differ', () => {
  describe('compareTypes', () => {
    const lType = apiTestModel.types.Dashboard;

    it('should return undefined if types are identical', () => {
      const count = startCount();
      const actual = compareTypes(lType, lType, count);
      expect(actual).toBeUndefined();
      expect(count).toEqual(startCount());
    });

    it('should return an object containing all non matching entries', () => {
      const [key, lProp] = firstProperty(lType.properties);
      const rType = changeType(lType as Type);
      const count = startCount();
      const actual = compareTypes(lType, rType, count);
      expect(actual).toBeDefined();
      if (actual) {
        expect(actual[key]).toBeDefined();
        expect(actual[key].lhs).toEqual(lProp.summary());
        expect(actual[key].rhs).toEqual(
          firstProperty(rType.properties)[1].summary()
        );
        expect(count).toEqual({
          added: 0,
          changed: 1,
          removed: 0,
        });
      }
    });
  });

  describe('compareParams', () => {
    const lMethod = apiTestModel.methods.create_look;

    it('should return undefined if methods are identical', () => {
      const count = startCount();
      const actual = compareParams(lMethod, lMethod, count);
      expect(actual).toBeUndefined();
      expect(count).toEqual(startCount());
    });

    it('should return an object containing all non matching entries', () => {
      const count = startCount();
      const rMethod = changeMethod(lMethod as Method);
      const actual = compareParams(lMethod, rMethod, count);
      expect(actual).toBeDefined();
      if (actual) {
        expect(actual.lhs).toEqual(lMethod.signature());
        expect(actual.rhs).toEqual(rMethod.signature());
        expect(count).toEqual({
          added: 0,
          changed: 1,
          removed: 0,
        });
      }
    });
  });

  describe('compareSpecs', () => {
    let lSpec: IApiModel;
    let rSpec: IApiModel;
    beforeEach(() => {
      lSpec = cloneDeep(apiTestModel);
      rSpec = cloneDeep(apiTestModel);
    });

    it('should compare two identical specs', () => {
      const actual = compareSpecs(lSpec, lSpec);
      expect(actual).toBeDefined();
      expect(actual).toHaveLength(0);
    });

    it('should compare two specs with no overlap', () => {
      const lMethod = lSpec.methods.create_look;
      const rMethod = rSpec.methods.create_query;
      lSpec.methods = { create_look: lMethod };
      rSpec.methods = { create_query: rMethod };
      const actual = compareSpecs(lSpec, rSpec);
      expect(actual).toBeDefined();
      expect(actual).toHaveLength(2);
      // TODO get this working again?
      expect(actual).toEqual(
        expect.arrayContaining([
          {
            bodyDiff: '',
            diffCount: {
              added: 0,
              changed: 0,
              removed: 1,
            },
            id: 'POST /looks',
            lStatus: 'beta',
            name: 'create_look',
            paramsDiff: '',
            rStatus: '',
            responseDiff: '',
            typeDiff: '',
          },
          {
            bodyDiff: '',
            diffCount: {
              added: 1,
              changed: 0,
              removed: 0,
            },
            id: 'POST /queries',
            lStatus: '',
            name: 'create_query',
            paramsDiff: '',
            rStatus: 'stable',
            responseDiff: '',
            typeDiff: '',
          },
        ])
      );
    });

    it.skip('should not overcount', () => {
      const spec31 = ApiModel.fromString(
        readFileSync(rootFile('spec/Looker.3.1.oas.json'), 'utf-8')
      );
      const spec40 = ApiModel.fromString(
        readFileSync(rootFile('spec/Looker.4.0.oas.json'), 'utf-8')
      );
      const lMethod = spec31.methods.create_look;
      expect(lMethod.status).toEqual('stable');
      const rMethod = spec40.methods.create_look;
      expect(rMethod.status).toEqual('beta');
      spec31.methods = { create_look: lMethod };
      spec40.methods = { create_look: rMethod };
      const actual = compareSpecs(spec31, spec40);
      expect(actual).toBeDefined();
      expect(actual).toHaveLength(1);
      expect(actual[0].diffCount).toEqual({
        added: 0,
        changed: 9,
        removed: 3,
      });
    });

    it.skip('should count changes and additions', () => {
      const spec31 = ApiModel.fromString(
        readFileSync(rootFile('spec/Looker.3.1.oas.json'), 'utf-8')
      );
      const spec40 = ApiModel.fromString(
        readFileSync(rootFile('spec/Looker.4.0.oas.json'), 'utf-8')
      );
      const lMethod = spec31.methods.search_dashboards;
      expect(lMethod.status).toEqual('stable');
      const rMethod = spec40.methods.search_dashboards;
      expect(rMethod.status).toEqual('beta');
      spec31.methods = { search_dashboards: lMethod };
      spec40.methods = { search_dashboards: rMethod };
      const actual = compareSpecs(spec31, spec40);
      expect(actual).toBeDefined();
      expect(actual).toHaveLength(1);
      expect(actual[0].diffCount).toEqual({
        added: 4,
        changed: 18,
        removed: 3,
      });
    });

    it('should work with internal matches', () => {
      // const match1 = lSpec.methods.create_look
      const match2 = lSpec.methods.create_query;
      lSpec.methods = pick(lSpec.methods, [
        'create_dashboard',
        'create_look',
        'create_query',
        'user',
      ]);
      rSpec.methods = pick(rSpec.methods, ['create_look', 'create_query']);
      rSpec.methods.create_query = changeMethod(match2 as Method);

      // const expected = [
      //   {
      //     name: match1.name,
      //     id: match1.id,
      //     lStatus: match1.status,
      //     rStatus: match1.status,
      //     typeDiff: '',
      //     paramsDiff: '',
      //   },
      //   {
      //     name: match2.name,
      //     id: match2.id,
      //     lStatus: match2.status,
      //     rStatus: match2.status,
      //     typeDiff: expect.stringContaining('lhs'),
      //     paramsDiff: expect.stringContaining('lhs'),
      //   },
      // ]
      let actual = compareSpecs(lSpec, rSpec);
      expect(actual).toHaveLength(3);
      // TODO correct this check
      // expect(actual).toEqual(expect.arrayContaining(expected))

      /** The left spec is now the shorter one */
      actual = compareSpecs(rSpec, lSpec);
      expect(actual).toHaveLength(3);
      // TODO correct this check
      // expect(actual).toEqual(expect.arrayContaining(expected))
    });

    it('should work with boundary matches', () => {
      // const match1 = lSpec.methods.create_dashboard
      const match2 = lSpec.methods.user;
      lSpec.methods = pick(lSpec.methods, [
        'create_dashboard',
        'create_look',
        'create_query',
        'user',
      ]);
      rSpec.methods = pick(rSpec.methods, [
        'create_dashboard',
        'group',
        'user',
      ]);
      rSpec.methods.user = changeMethod(match2 as Method);

      // const expected = [
      //   {
      //     name: match1.name,
      //     id: match1.id,
      //     lStatus: match1.status,
      //     rStatus: match1.status,
      //     typeDiff: '',
      //     paramsDiff: '',
      //   },
      //   {
      //     name: match2.name,
      //     id: match2.id,
      //     lStatus: match2.status,
      //     rStatus: match2.status,
      //     typeDiff: expect.stringContaining('lhs'),
      //     paramsDiff: expect.stringContaining('lhs'),
      //   },
      // ]
      let actual = compareSpecs(lSpec, rSpec);
      expect(actual).toHaveLength(4);
      // TODO fix this check
      // expect(actual).toEqual(expect.arrayContaining(expected))

      actual = compareSpecs(rSpec, lSpec);
      expect(actual).toHaveLength(4);
      // TODO fix this check
      // expect(actual).toEqual(expect.arrayContaining(expected))
    });

    it('should compare with filter', () => {
      const leftFile = rootFile('/spec/Looker.3.1.oas.json');
      const lSpec = ApiModel.fromString(readFileSync(leftFile, 'utf-8'));
      const rightFile = rootFile('/spec/Looker.4.0.oas.json');
      const rSpec = ApiModel.fromString(readFileSync(rightFile, 'utf-8'));

      const betaCompare = (
        delta: DiffRow,
        lMethod?: IMethod,
        rMethod?: IMethod
      ) => includeDiffs(delta, lMethod, rMethod) || lMethod?.status === 'beta';

      const actual = compareSpecs(lSpec, rSpec, betaCompare);
      expect(actual).toBeDefined();
      expect(actual.length).toBeGreaterThanOrEqual(
        Object.values(lSpec.methods).filter(
          (method) => method.status === 'beta'
        ).length
      );
    });
  });
});
