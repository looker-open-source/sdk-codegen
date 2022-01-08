import 'dart:io';
import 'dart:typed_data';
import 'package:looker_sdk/looker_sdk.dart';
import 'package:dotenv/dotenv.dart' show load, env;

void main() async {
  load();
  var sdk = await createSdk();
  await runLooks(sdk);
  await runDashboardApis(sdk);
  await runConnectionApis(sdk);
}

Future<LookerSDK> createSdk() async {
  return await Sdk.createSdk({
    'base_url': env['URL'],
    'verify_ssl': false,
    'credentials_callback': credentialsCallback
  });
}

Future<void> runLooks(LookerSDK sdk) async {
  try {
    var looks = await sdk.ok(sdk.all_looks());
    if (looks.isNotEmpty) {
      looks.forEach((look) => print(look.title));
      var look = await sdk.ok(sdk.run_look(looks[looks.length - 1].id, 'png'));
      var dir = Directory('./temp');
      if (!dir.existsSync()) {
        dir.createSync();
      }
      File('./temp/look.png').writeAsBytesSync(look as Uint8List);
      look = await sdk.ok(sdk.run_look(looks[looks.length - 1].id, 'csv'));
      File('./temp/look.csv').writeAsStringSync(look as String);
    }
  } catch (error, stacktrace) {
    print(error);
    print(stacktrace);
  }
}

Future<void> runDashboardApis(LookerSDK sdk) async {
  try {
    var dashboards = await sdk.ok(sdk.all_dashboards());
    dashboards.forEach((dashboard) => print(dashboard.title));
    var dashboard = await sdk.ok(sdk.dashboard(dashboards[0].id));
    print(dashboard.toJson());
  } catch (error, stacktrace) {
    print(error);
    print(stacktrace);
  }
}

Future<void> runConnectionApis(LookerSDK sdk) async {
  try {
    var connections = await sdk.ok(sdk.all_connections());
    connections.forEach((connection) => print(connection.name));
    var connection = await sdk
        .ok(sdk.connection(connections[0].name, fields: 'name,host,port'));
    print(
        'name=${connection.name} host=${connection.host} port=${connection.port}');
    var newConnection = WriteDBConnection();
    SDKResponse resp = await sdk.connection('TestConnection');
    if (resp.statusCode == 200) {
      print('TestConnection already exists');
    } else {
      newConnection.name = 'TestConnection';
      newConnection.dialectName = 'mysql';
      newConnection.host = 'db1.looker.com';
      newConnection.port = '3306';
      newConnection.username = 'looker_demoX';
      newConnection.password = 'look_your_data';
      newConnection.database = 'demo_db2';
      newConnection.tmpDbName = 'looker_demo_scratch';
      connection = await sdk.ok(sdk.create_connection(newConnection));
      print('created ${connection.name}');
    }
    var updateConnection = WriteDBConnection();
    updateConnection.username = 'looker_demo';
    connection =
        await sdk.ok(sdk.update_connection('TestConnection', updateConnection));
    print('Connection updated: username=${connection.username}');
    var testResults = await sdk.ok(
        sdk.test_connection('TestConnection', tests: DelimList(['connect'])));
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
