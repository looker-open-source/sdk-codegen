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

import { LookerNodeSDK } from '../src';

type TestResult = Promise<string>;
type TestRun = () => TestResult;

interface TestError {
  message: string;
  type?: string;
}

interface TestCase {
  name: string;
  classname: string;
  time: number;
  failure?: TestError;
  error?: TestError;
}

interface TestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  time: number;
  testcases: TestCase[];
}

const sdk = LookerNodeSDK.init40();
function generateJUnitXML(testSuites: TestSuite[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n';

  for (const suite of testSuites) {
    xml += `<testsuite name="${suite.name}" tests="${suite.tests}" failures="${suite.failures}" errors="${suite.errors}" time="${suite.time}">\n`;

    for (const testcase of suite.testcases) {
      xml += `<testcase classname="${testcase.classname}" name="${testcase.name}" time="${testcase.time}">\n`;

      if (testcase.failure) {
        xml += `<failure message="${testcase.failure.message}" type="${testcase.failure.type}"></failure>\n`;
      }

      if (testcase.error) {
        xml += `<error message="${testcase.error.message}" type="${testcase.error.type}"></error>\n`;
      }

      xml += '</testcase>\n';
    }

    xml += '</testsuite>\n';
  }

  xml += '</testsuites>';

  return xml;
}

async function runTest(
  name: string,
  test: TestRun,
  classname = 'SdkNodeTest'
): Promise<TestCase> {
  const start = performance.now();
  const result: TestCase = {
    time: 0,
    name,
    classname,
  };
  try {
    const message = await test();
    if (message) {
      result.failure = { message, type: 'failure' };
    }
  } catch (e: any) {
    result.error = { message: e.message, type: 'error' };
  }
  const stop = performance.now();
  result.time = stop - start;
  return result;
}

async function runSuite(): Promise<TestCase[]> {
  const tests: TestCase[] = [];
  const add = async (
    name: string,
    test: TestRun,
    classname = 'SdkNodeTest'
  ) => {
    const result = await runTest(name, test, classname);
    tests.push(result);
  };
  await add('login', loginTest);
  await add('create_user_attribute options', userAttribTest);
  return tests;
}

async function loginTest(): TestResult {
  const actual = await sdk.ok(sdk.me());
  if (!actual.id) {
    return 'user id not assigned';
  }
  if (!sdk.authSession.isAuthenticated()) {
    return 'Not authenticated';
  }
  return '';
}

async function userAttribTest(): TestResult {
  try {
    const attrib = await sdk.ok(
      sdk.create_user_attribute({
        name: 'git_username',
        label: 'Git Username',
        type: 'string',
        default_value: undefined,
        value_is_hidden: false,
        user_can_edit: true,
        user_can_view: true,
        hidden_value_domain_whitelist: '',
      })
    );
    // We shouldn't get here but if we do, delete the test attribute
    await sdk.ok(sdk.delete_user_attribute(attrib.id!));
    return 'should have hit an error';
  } catch (e: any) {
    if (e.message !== 'Validation Failed')
      return `message was ${e.message} not Validation Failed`;
    if (
      !e.errors[0].message.match(
        /hidden_value_domain_whitelist must be a comma-separated list of urls with optional wildcards/gim
      )
    ) {
      return `did not expect ${e.errors[0].message}`;
    }
  }
  return '';
}

async function allTests(): Promise<string> {
  const tests = await runSuite();
  const suites: TestSuite[] = [
    {
      name: 'NodeTest',
      tests: tests.length,
      failures: tests.filter(t => t.failure).length,
      errors: tests.filter(t => t.error).length,
      time: tests.reduce((sum, current) => sum + current.time, 0),
      testcases: await runSuite(),
    },
  ];
  const xml = generateJUnitXML(suites);
  return xml;
}

(async () => {
  const output = await allTests();
  // eslint-disable-next-line no-console
  console.log(output);
})();
