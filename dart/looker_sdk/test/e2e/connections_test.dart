import 'package:test/test.dart';
import 'package:looker_sdk/index.dart';
import './utils.dart';

void main() {
  LookerSDK sdk;
  setUp(() async {
    sdk = await utils.getSdk();
  });

  void cleanup() async {
    try {
      await sdk.ok(sdk.deleteConnection('TestConnection'));
    } catch (error) {
      // ignore
    }
  }

  test('connections', () async {
    cleanup();
    var connections = await sdk.ok(sdk.allConnections());
    expect(connections.length, isNonNegative);
    for (var connection in connections) {
      expect(connection.name, isNotNull);
    }
    if (connections.isNotEmpty) {
      var connection = await sdk
          .ok(sdk.connection(connections[0].name, fields: 'name,host,port'));
      expect(connection.name, isNotNull);
    } else {
      print('No connections to print');
    }
    var newConnection = WriteDBConnection();
    newConnection.name = 'TestConnection';
    newConnection.dialectName = 'mysql';
    newConnection.host = 'db1.looker.com';
    newConnection.port = '3306';
    newConnection.username = 'looker_demoX';
    newConnection.password = 'look_your_data';
    newConnection.database = 'demo_db2';
    newConnection.tmpDbName = 'looker_demo_scratch';
    var connection = await sdk.ok(sdk.createConnection(newConnection));
    expect(connection.name, equals(newConnection.name.toLowerCase()));
    expect(connection.username, equals(newConnection.username));
    connection = await sdk
        .ok(sdk.connection('TestConnection', fields: 'name,host,port'));
    expect(connection.name, equals(newConnection.name.toLowerCase()));
    expect(connection.host, equals(newConnection.host));
    expect(connection.port, equals(newConnection.port));
    expect(connection.username, isNull);
    var updateConnection = WriteDBConnection();
    updateConnection.username = 'looker_demo';
    connection =
        await sdk.ok(sdk.updateConnection('TestConnection', updateConnection));
    expect(connection.name, equals(newConnection.name.toLowerCase()));
    expect(connection.username, equals(updateConnection.username));
    var testResults = await sdk.ok(
        sdk.testConnection('TestConnection', tests: DelimList(['connect'])));
    expect(testResults[0].name, equals('connect'));
    expect(testResults[0].message, equals('Can connect'));
    var deleteResult = await sdk.ok(sdk.deleteConnection('TestConnection'));
    expect(deleteResult, equals(''));
  });
}
