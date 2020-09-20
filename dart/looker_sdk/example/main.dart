import 'package:looker_sdk/looker_sdk.dart';
import 'package:dotenv/dotenv.dart' show load, env;

void main() async {
  load();
  await run40();
}

void run40() async {
  var sdk = await Sdk.create40Sdk(
      {'base_url': env['URL'], 'credentials_callback': credentialsCallback});
  try {
    var connections = await sdk.ok(sdk.all_connections());
    connections.forEach((connection) => print(connection.name));
    var connection =
        await sdk.ok(sdk.connection(connections[0].name, 'name,host,port'));
    print(
        'name=${connection.name} host=${connection.host} port=${connection.port}');
    var newConnection = WriteDBConnection();
    SDKResponse resp = await sdk.connection('TestConnection');
    if (resp.statusCode == 200) {
      print('TestConnection already exists');
    } else {
      newConnection.name = 'TestConnection';
      newConnection.dialect_name = 'mysql';
      newConnection.host = 'db1.looker.com';
      newConnection.port = 3306;
      newConnection.username = 'looker_demoX';
      newConnection.password = 'look_your_data';
      newConnection.database = 'demo_db2';
      newConnection.tmp_db_name = 'looker_demo_scratch';
      connection = await sdk.ok(sdk.create_connection(newConnection));
      print('created ${connection.name}');
    }
    var updateConnection = WriteDBConnection();
    updateConnection.username = 'looker_demo';
    connection =
        await sdk.ok(sdk.update_connection('TestConnection', updateConnection));
    print('Connection updated: username=${connection.username}');
    var testResults = await sdk
        .ok(sdk.test_connection('TestConnection', DelimList(['connect'])));
    if (testResults.isEmpty) {
      print('No connection tests run');
    } else {
      testResults.forEach((i) => print('test result: ${i.name}=${i.message}'));
    }
    var deleteResult = await sdk.ok(sdk.delete_connection('TestConnection'));
    print('Delete result $deleteResult');
  } catch (error, stacktrace) {
    print(error);
    print(stacktrace);
  }
}

Map credentialsCallback() {
  return {'client_id': env['CLIENT_ID'], 'client_secret': env['CLIENT_SECRET']};
}
