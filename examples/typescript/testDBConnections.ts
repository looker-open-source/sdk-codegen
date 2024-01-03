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
import type { IDBConnection } from '@looker/sdk';
import { DelimArray } from '@looker/sdk-rtl';

interface ConnectionTestObj {
  connectionName: string;
  tests: {
    name: string;
    status: string;
    message: string;
  }[];
}

const sdk = LookerNodeSDK.init40();

const getConnections = async (): Promise<IDBConnection[]> => {
  const connections = await sdk.ok(sdk.all_connections('name, id, dialect'));
  return connections;
};

const runConnectionTests = async (): Promise<ConnectionTestObj[]> => {
  const connections = await getConnections();
  // loop through all connections run connection test and return connection test obj
  const tests: ConnectionTestObj[] = await Promise.all(
    connections.map(async (c) => {
      try {
        const connection = await sdk.ok(
          sdk.test_connection(
            c.name,
            new DelimArray<string>(c.dialect.connection_tests)
          )
        );
        // return formmatted connection test object
        return {
          connectionName: c.name,
          // test_connection returns and array of tests
          tests: connection.map((c) => {
            return {
              name: c.name,
              status: c.status,
              message: c.message,
            };
          }),
        };
      } catch (e) {
        // in case of misconfigured connection settings that cause the test_connection() method to error
        // log error in console and continue loop
        console.error(
          `There was an error running connection test for ${c.name}. Full error: ${e}`
        );
      }
    })
  );
  return tests;
};

// Example
// runConnectionTests()
