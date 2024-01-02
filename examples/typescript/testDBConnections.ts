import { LookerNodeSDK } from '@looker/sdk-node';
import { IDBConnection } from '@looker/sdk';
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
//runConnectionTests()
